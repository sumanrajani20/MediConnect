import React, { useState } from 'react';
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
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import axios from 'axios';

const LabResults = () => {
  const [results, setResults] = useState([]);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [serverStatus, setServerStatus] = useState('');

  // Replace with your computer's local IP address
  const API_URL = 'http://10.102.144.214:8000';

  const handleImageSelect = async () => {
    try {
      // Reset states
      setLoading(true);
      setError(null);
      setResults([]);
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

      setResults(response.data.results);
      setServerStatus('Processing complete!');

    } catch (err) {
      console.error('Error:', err); // Debug log
      setError(err.message || 'Processing failed');
      setServerStatus('Error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <Text style={styles.header}>Medical Report Analyzer</Text>
      
      {/* Image Preview */}
      {image && (
        <Image source={{ uri: image }} style={styles.previewImage} />
      )}

      {/* Upload Button */}
      <Button
        title={loading ? 'Processing...' : 'Upload Report'}
        onPress={handleImageSelect}
        disabled={loading}
        color="#4FE5E7"
      />

      {/* Status Messages */}
      {serverStatus ? (
        <Text style={styles.statusText}>{serverStatus}</Text>
      ) : null}

      {/* Loading Indicator */}
      {loading && (
        <ActivityIndicator size="large" color="#4FE5E7" style={styles.loader} />
      )}

      {/* Error Display */}
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {/* Results Display */}
      {results.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.sectionTitle}>Test Results</Text>
          {results.map((item, index) => (
            <View key={`result-${index}`} style={styles.resultItem}>
              <Text style={styles.testName}>{item.test}</Text>
              <Text style={styles.testValue}>{item.result}</Text>
            </View>
          ))}
        </View>
      )}
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
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  testName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  testValue: {
    fontSize: 16,
    color: '#4FE5E7',
    fontWeight: 'bold',
  },
});

export default LabResults;