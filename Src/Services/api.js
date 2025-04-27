// src/services/api.js
import axios from 'axios';

const API_URL = 'http://10.102.128.135:8000'; // Replace with your actual IP

export const processLabReport = async (imageUri) => {
  const formData = new FormData();
  formData.append('file', {
    uri: imageUri,
    name: 'lab_report.jpg',
    type: 'image/jpeg',
  });

  try {
    const response = await axios.post(`${API_URL}/process-report`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.results; // Return just the results array
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
};