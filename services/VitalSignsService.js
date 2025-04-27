// import { db}from './firebase-config'; // Use your initialized services
// import { 
//   collection, 
//   addDoc, 
//   serverTimestamp,
//   query, 
//   orderBy, 
//   limit, 
//   getDocs 
// } from 'firebase/firestore';
import auth from '@react-native-firebase/auth'; // Ensure you have this package installed
const COLLECTIONS = {
  BLOOD_PRESSURE: 'bloodPressure', // Consistent naming
  BLOOD_GLUCOSE: 'bloodGlucose',
  TEMPERATURE: 'temperature',
  HEART_RATE: 'heartRate'
};
import firestore from '@react-native-firebase/firestore';






// export const saveBloodPressureReading = async (readingData) => {
//   console.log("Saving blood pressure reading:", readingData);
//   try {
//     const user = auth().currentUser;
//     if (!user) throw new Error("User not authenticated");

//     const docRef = await addDoc(
//       collection(db, "users", user._user.uid, "bloodPressure"),
//       {
//         ...readingData,
//       }
//     );

//     return docRef.id;
//   } catch (error) {
//     console.error("Firestore Error:", {
//       error: error.message,
//       stack: error.stack,
//       timestamp: new Date().toISOString()
//     });
//     throw error;
//   }
// };


export const getBloodPressureReadings = async () => {
  try {
    const userId = auth().currentUser.uid;

    const snapshot = await firestore()
      .collection('users')
      .doc(userId)
      .collection('vitalSigns')
      .where('type', '==', 'blood_pressure').get();

    const bloodPressureData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log('Blood pressure data:', bloodPressureData);
    return bloodPressureData;
  } catch (error) {
    console.error('Error getting blood pressure data:', error);
    return [];
  }
};

export const saveBloodPressureReading = async (readingData) => {
  try {
    const userId = auth().currentUser.uid;

    const bloodPressureData = {
      type: 'blood_pressure',
      systolic: readingData.systolic,
      diastolic: readingData.diastolic,
      pulse: readingData.pulse,

    };

    await firestore()
    .collection('users')
    .doc(userId)
    .collection('vitalSigns')
    .add(bloodPressureData);

  console.log('Blood pressure data saved!');
    console.log('Blood pressure data saved!');
  } catch (error) {
    console.error('Error saving blood pressure:', error);
  }
};
// Update other service functions similarly...

// Save blood glucose data
// export const saveGlucoseData = async (glucoseData) => {
//   try {
//     // Get current user
//     const user = auth().currentUser;
//     if (!user) {
//       console.log('No user is signed in');
//       throw new Error('User not authenticated');
//     }

//     console.log('Current user:', user.email);

    // Create document in Firestore
    // const docRef = await addDoc(
    //   collection(db, 'users', user.uid, COLLECTIONS.BLOOD_GLUCOSE),
    //   {
    //     ...glucoseData,
    //     createdAt: serverTimestamp(),
    //     updatedAt: serverTimestamp(),
    //   }
    // );

    // console.log('Document written with ID: ', docRef.id);
    // return docRef.id;
//   } catch (error) {
//     console.error('Error saving glucose data:', error);
//     throw error;
//   }
// };
// Get blood glucose data

export const saveGlucoseData = async (glucoseData) => {
  try {
    const user = auth().currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const glucoseDataWithTimestamp = {
      ...glucoseData,
      createdAt: firestore.FieldValue.serverTimestamp(),
    };

    await firestore()
      .collection('users')
      .doc(user.uid)
      .collection(COLLECTIONS.BLOOD_GLUCOSE)
      .add(glucoseDataWithTimestamp);

    console.log('Glucose data saved successfully!');
  } catch (error) {
    console.error('Error saving glucose data:', error);
    throw error;
  }
};

export const saveTemperatureData = async (temperatureData) => {
  try {
    const user = auth().currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const temperatureDataWithTimestamp = {
      ...temperatureData,
      createdAt: firestore.FieldValue.serverTimestamp(),
    };

    await firestore()
      .collection('users')
      .doc(user.uid)
      .collection(COLLECTIONS.TEMPERATURE)
      .add(temperatureDataWithTimestamp);

    console.log('Temperature data saved successfully!');
  } catch (error) {
    console.error('Error saving temperature data:', error);
    throw error;
  }
};
// Get temperature data
export const getTemperatureData = async () => {
  try {
    const user = auth().currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const snapshot = await firestore()
      .collection('users')
      .doc(user.uid)
      .collection(COLLECTIONS.TEMPERATURE)
      .orderBy('createdAt', 'desc')
      .get();

    const temperatureData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log('Temperature data retrieved successfully:', temperatureData);
    return temperatureData;
  } catch (error) {
    console.error('Error retrieving temperature data:', error);
    throw error;
  }
};

// Save heart rate data
export const saveHeartRateData = async (heartRateData) => {
  try {
    const user = auth().currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const heartRateDataWithTimestamp = {
      ...heartRateData,
      createdAt: firestore.FieldValue.serverTimestamp(),
    };

    await firestore()
      .collection('users')
      .doc(user.uid)
      .collection(COLLECTIONS.HEART_RATE)
      .add(heartRateDataWithTimestamp);

    console.log('Heart rate data saved successfully!');
  } catch (error) {
    console.error('Error saving heart rate data:', error);
    throw error;
  }
}

// Get heart rate data
export const getHeartRateData = async () => {
  try {
    const user = auth().currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const snapshot = await firestore()
      .collection('users')
      .doc(user.uid)
      .collection(COLLECTIONS.HEART_RATE)
      .orderBy('createdAt', 'desc')
      .get();

    const heartRateData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log('Heart rate data retrieved successfully:', heartRateData);
    return heartRateData;
  } catch (error) {
    console.error('Error retrieving heart rate data:', error);
    throw error;
  }
};

// Get glucose history
export const getGlucoseHistory = async (limitCount = 10) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    // const q = query(
    //   collection(db, 'users', user.uid, COLLECTIONS.BLOOD_GLUCOSE),
    //   orderBy('createdAt', 'desc'),
    //   limit(limitCount)
    // );

    // const snapshot = await getDocs(q);

    // return snapshot.docs.map((doc) => ({
    //   id: doc.id,
    //   ...doc.data(),
    // }));
  } catch (error) {
    console.error('Error fetching glucose history:', error);
    throw error;
  }
};