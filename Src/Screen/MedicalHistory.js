import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

const MedicalHistory = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Medical History</Text>
    </View>
  );
};

export default MedicalHistory;

const styles = StyleSheet.create({
  container: {
    flex: 1, // Ensures the component takes up the full screen
    justifyContent: 'center', // Centers content vertically
    alignItems: 'center', // Centers content horizontally
    backgroundColor: '#f5f5f5', // Light background for a clean UI
  },
  text: {
    fontSize: 20, // Increase font size for readability
    fontWeight: 'bold', // Make the text bold
    color: '#333', // Neutral text color
  },
});
