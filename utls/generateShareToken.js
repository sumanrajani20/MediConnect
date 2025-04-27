import {  doc, setDoc, Timestamp } from "firebase/firestore";
import uuid from 'react-native-uuid';

import firestore from '@react-native-firebase/firestore';
export const generateShareToken = async (userId) => {



    const token = uuid.v4();
  const expiresAt = Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000));


 // expires in 24 hrs
    console.log('Generated Token:', token); // Debugging
  console.log('Expires At:', expiresAt.toDate()); // Debugging
try{

  await firestore()
  .collection('shareTokens')
  .doc(token)
  .set({
    userId: userId,
    expiresAt: expiresAt,
  });

}catch(error){
  console.error('Error saving token to Firestore:', error); }
  return token;
};
