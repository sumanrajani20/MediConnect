import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import React from 'react';

const VitalSign = () => {
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.header}>Vital Signs</Text>

        <View style={styles.vitalSignBox}>
          <Text style={styles.label}>Heart Rate</Text>
          <Text style={styles.value}>75 bpm</Text>
        </View>

        <View style={styles.vitalSignBox}>
          <Text style={styles.label}>Blood Pressure</Text>
          <Text style={styles.value}>120/80 mmHg</Text>
        </View>

        <View style={styles.vitalSignBox}>
          <Text style={styles.label}>Temperature</Text>
          <Text style={styles.value}>98.6°F</Text>
        </View>

        <View style={styles.vitalSignBox}>
          <Text style={styles.label}>Respiration Rate</Text>
          <Text style={styles.value}>16 breaths/min</Text>
        </View>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>View More</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default VitalSign;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff',
    width: '100%',
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginVertical: 20,
  },
  vitalSignBox: {
    backgroundColor: '#ffffff',
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    fontSize: 18,
    color: '#666',
  },
  value: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#33E4DB',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});