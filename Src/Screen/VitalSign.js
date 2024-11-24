import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

const VitalSign = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Vital Sign</Text>
    </View>
  );
};

export default VitalSign;

const styles = StyleSheet.create({
  container: {
    flex: 1, // Ensures the component takes the full screen
    justifyContent: 'center', // Centers content vertically
    alignItems: 'center', // Centers content horizontally
    backgroundColor: '#f0f8ff', // Light blue background (adjustable)
  },
  text: {
    fontSize: 20, // Larger text for readability
    fontWeight: 'bold', // Bold text for emphasis
    color: '#333', // Neutral dark gray text color
  },
});
