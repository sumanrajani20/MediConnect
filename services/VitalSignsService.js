// services/VitalSignsService.js

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

// Collection names
const COLLECTIONS = {
  BLOOD_GLUCOSE: 'bloodGlucose',
  TEMPERATURE: 'temperature',
  HEART_RATE: 'heartRate',
  BLOOD_PRESSURE: 'bloodPressure',
};

// Save blood glucose data
export const saveGlucoseData = async (glucoseData) => {
  try {
    // Get current user
    const user = auth().currentUser;
    if (!user) {
      console.log('No user is signed in');
      throw new Error('User not authenticated');
    }

    console.log('Current user:', user.email);
    
    // Get timestamp
    const timestamp = firestore.FieldValue.serverTimestamp();
    
    // Create document in Firestore
    const docRef = await firestore()
      .collection('users')
      .doc(user.uid)
      .collection(COLLECTIONS.BLOOD_GLUCOSE)
      .add({
        ...glucoseData,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    
    console.log('Document written with ID: ', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving glucose data:', error);
    throw error;
  }
};

// Similar functions for other vital signs...
export const saveTemperatureData = async (temperatureData) => {
  try {
    const user = auth().currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const timestamp = firestore.FieldValue.serverTimestamp();
    
    const docRef = await firestore()
      .collection('users')
      .doc(user.uid)
      .collection(COLLECTIONS.TEMPERATURE)
      .add({
        ...temperatureData,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      
    return docRef.id;
  } catch (error) {
    console.error('Error saving temperature data:', error);
    throw error;
  }
};

// Get glucose history
export const getGlucoseHistory = async (limit = 10) => {
  try {
    const user = auth().currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const snapshot = await firestore()
      .collection('users')
      .doc(user.uid)
      .collection(COLLECTIONS.BLOOD_GLUCOSE)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
      
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching glucose history:', error);
    throw error;
  }
};