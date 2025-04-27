import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  Image,
  StyleSheet,
  ActivityIndicator,
  PermissionsAndroid,
  ScrollView,
  Alert,
  Platform,
  FlatList,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import axios from 'axios';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const LabResults = () => {
  const [results, setResults] = useState([]); // State for lab results
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [serverStatus, setServerStatus] = useState('');

  // Replace with your computer's local IP address
  const API_URL = 'http:/192.168.100.70:8000';

  // Fetch Lab Results from Firestore
  const fetchLabResults = async () => {
    try {
      const userId = auth().currentUser?.uid;
      if (!userId) throw new Error('User not signed in');

      const snapshot = await firestore()
        .collection('users')
        .doc(userId)
        .collection('labResults')
        .get();

      const fetchedResults = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setResults(fetchedResults);
    } catch (error) {
      console.error('Error fetching lab results:', error);
      Alert.alert('Error', error.message || 'Failed to fetch lab results');
    }
  };

  // Fetch lab results on component mount
  useEffect(() => {
    fetchLabResults();
  }, []);

  const handleImageSelect = async () => {
    try {
      // Reset states
      setLoading(true);
      setError(null);
      setServerStatus('Starting process...');

      // 1. Check Android permissions
      if (Platform.OS === 'android') {
        setServerStatus('Checking permissions...');
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'App needs access to your storage',
            buttonPositive: 'OK',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          throw new Error('Storage permission required');
        }
      }

      // 2. Launch image picker
      setServerStatus('Selecting image...');
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
      });

      if (result.didCancel) {
        setLoading(false);
        return;
      }

      if (result.errorCode) {
        throw new Error(result.errorMessage || 'Image picker error');
      }

      if (!result.assets?.[0]?.uri) {
        throw new Error('No image selected');
      }

      const selectedImage = result.assets[0];
      setImage(selectedImage.uri);
      setServerStatus('Preparing upload...');

      // 3. Prepare form data
      const formData = new FormData();
      formData.append('file', {
        uri: selectedImage.uri,
        name: 'medical_report.jpg',
        type: 'image/jpeg',
      });

      // 4. Send to API
      setServerStatus('Uploading to server...');
      const response = await axios.post(`${API_URL}/process-report`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 second timeout
      });

      console.log('API Response:', response.data); // Debug log

      // 5. Handle response
      if (!response.data?.results) {
        throw new Error('Invalid response format');
      }

      const labResults = response.data.results;
      setServerStatus('Processing complete!');

      // 6. Save to Firestore
      const userId = auth().currentUser?.uid;
      if (!userId) throw new Error('User not signed in');

      const newLabResult = {
        id: Date.now().toString(),
        imageUri: selectedImage.uri,
        results: labResults,
        date: new Date().toISOString(),
      };

      await firestore()
        .collection('users')
        .doc(userId)
        .collection('labResults')
        .doc(newLabResult.id)
        .set(newLabResult);

      // Update the results state to include the new lab result
      setResults(prevResults => [newLabResult, ...prevResults]);

      Alert.alert('Success', 'Lab results saved successfully!');
    } catch (err) {
      console.error('Error:', err); // Debug log
      setError(err.message || 'Processing failed');
      setServerStatus('Error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderLabResultItem = ({ item }) => (
    <View style={styles.resultItem}>
      <Text style={styles.testName}>Date: {new Date(item.date).toLocaleDateString()}</Text>
      <Text style={styles.testValue}>Results:</Text>
      {item.results.map((result, index) => (
        <Text key={index} style={styles.testValue}>
          {result.test}: {result.result}
        </Text>
      ))}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <Text style={styles.header}>Medical Report Analyzer</Text>
  
      {/* Image Preview */}
      {image && <Image source={{ uri: image }} style={styles.previewImage} />}
  
      {/* Upload Button */}
      <Button
        title={loading ? 'Processing...' : 'Upload Report'}
        onPress={handleImageSelect}
        disabled={loading}
        color="#4FE5E7"
      />
  
      {/* Status Messages */}
      {serverStatus ? <Text style={styles.statusText}>{serverStatus}</Text> : null}
  
      {/* Loading Indicator */}
      {loading && <ActivityIndicator size="large" color="#4FE5E7" style={styles.loader} />}
  
      {/* Error Display */}
      {error && <Text style={styles.errorText}>{error}</Text>}
  
      {/* Lab Results Display */}
      <View style={{ flex: 1, marginTop: 20 }}>
        {results.length > 0 ? (
          <FlatList
            data={results}
            renderItem={renderLabResultItem}
            keyExtractor={item => item.id}
          />
        ) : (
          <Text style={styles.noResultsText}>No lab results found.</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8FCFF',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#13b9c8',
    marginBottom: 20,
    textAlign: 'center',
  },
  previewImage: {
    width: '100%',
    height: 200,
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  statusText: {
    color: '#555',
    textAlign: 'center',
    marginVertical: 10,
  },
  loader: {
    marginVertical: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 10,
  },
  resultsContainer: {
    marginTop: 20,
  },
  resultItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  testName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  testValue: {
    fontSize: 14,
    color: '#4FE5E7',
  },
  noResultsText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
});

export default LabResults;