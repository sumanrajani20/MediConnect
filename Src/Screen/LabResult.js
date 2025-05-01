import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  PermissionsAndroid,
  Alert,
  Platform,
  FlatList,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import axios from 'axios';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';

const LabResults = () => {
  const [results, setResults] = useState([]);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [serverStatus, setServerStatus] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
        navigation.setOptions({
          headerTitle: 'Lab Results           ', // Centered title
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: '#00C2D4',
          },
          headerTintColor: '#fff',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingLeft: 10,
              }}
            >
              <Image
                source={require('../../assets/custom-arrow.png')} // Add your custom arrow here
                style={{ width: 20, height: 20, resizeMode: 'contain' }}
              />
            </TouchableOpacity>
          ),
        });
      }, [navigation]);
  

  const API_URL = 'http:/10.102.129.50:8000';

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

  useEffect(() => {
    fetchLabResults();
  }, []);

  const handleImageSelect = async () => {
    try {
      setLoading(true);
      setError(null);
      setServerStatus('Starting process...');

      if (Platform.OS === 'android') {
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

      const formData = new FormData();
      formData.append('file', {
        uri: selectedImage.uri,
        name: 'medical_report.jpg',
        type: 'image/jpeg',
      });

      setServerStatus('Uploading to server...');
      const response = await axios.post(`${API_URL}/process-report`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      });

      if (!response.data?.results) {
        throw new Error('Invalid response format');
      }

      const labResults = response.data.results;
      setServerStatus('Processing complete!');

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

      setResults(prevResults => [newLabResult, ...prevResults]);
      Alert.alert('Success', 'Lab results saved successfully!');
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Processing failed');
      setServerStatus('Error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderLabResultItem = ({ item }) => (
    <View style={styles.resultCard}>
      <Text style={styles.resultDate}>
        📅 {new Date(item.date).toLocaleDateString()}
      </Text>
      {item.results.map((result, index) => (
        <View key={index} style={styles.resultRow}>
          <Text style={styles.testName}>{result.test}</Text>
          <Text style={styles.testValue}>{result.result}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🧪 Medical Report Analyzer</Text>

      {image && <Image source={{ uri: image }} style={styles.previewImage} />}

      <Button
        title={loading ? 'Processing...' : 'Upload Report'}
        onPress={handleImageSelect}
        disabled={loading}
        color="#4FE5E7"
      />

      {serverStatus ? <Text style={styles.statusText}>{serverStatus}</Text> : null}
      {loading && <ActivityIndicator size="large" color="#4FE5E7" style={styles.loader} />}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {results.length > 0 ? (
        <FlatList
          data={results}
          renderItem={renderLabResultItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.resultsList}
        />
      ) : (
        <Text style={styles.noResultsText}>No lab results found.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8FCFF',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0C7C8A',
    marginBottom: 20,
    textAlign: 'center',
  },
  previewImage: {
    width: '100%',
    height: 200,
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: '#eee',
  },
  statusText: {
    color: '#444',
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 16,
  },
  loader: {
    marginVertical: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 16,
  },
  noResultsText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
    fontSize: 16,
  },
  resultsList: {
    paddingVertical: 20,
  },
  resultCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  resultDate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0C7C8A',
    marginBottom: 10,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  testName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  testValue: {
    fontSize: 16,
    color: '#13b9c8',
    fontWeight: '600',
  },
});

export default LabResults;
