import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
// Using a custom arrow component (alternatively can use an image)
const CustomArrow = () => {
  return (
    <View style={styles.arrowContainer}>
      <View style={styles.arrowLine} />
      <View style={styles.arrowHead} />
    </View>
  );
};

const CustomMedicationReminder = ({ navigation }) => {
  // Sample medications with their status
  const [medications, setMedications] = useState([
    { id: 1, name: 'Lisinopril', dosage: '10mg', time: '8:00 AM', period: 'Morning', taken: false },
    { id: 2, name: 'Metformin', dosage: '500mg', time: '9:30 AM', period: 'Morning', taken: true },
    { id: 3, name: 'Atorvastatin', dosage: '20mg', time: '1:00 PM', period: 'Afternoon', taken: false },
    { id: 4, name: 'Aspirin', dosage: '81mg', time: '8:00 PM', period: 'Evening', taken: false },
  ]);

  // Set up navigation options similar to the Radiology component
  useEffect(() => {
    if (navigation) {
      navigation.setOptions({
        headerShown: true,
        headerTitle: 'Medication Reminders',
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: '#00C2D4', // Exact color from the Radiology component
          elevation: 0,
        },
        headerTintColor: '#fff',
        headerLeft: () => (
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.headerLeft}
          >
            {/* This matches the exact structure from the Radiology component */}
            <CustomArrow />
          </TouchableOpacity>
        ),
      });
    }
  }, [navigation]);

  // Toggle medication taken status
  const toggleTaken = (id) => {
    const updatedMeds = medications.map(med => 
      med.id === id ? {...med, taken: !med.taken} : med
    );
    setMedications(updatedMeds);
  };

  // Handle back button press for when not using React Navigation
  const handleBack = () => {
    if (navigation && navigation.goBack) {
      navigation.goBack();
    } else {
      Alert.alert('Back', 'Navigating back');
    }
  };

  // Group medications by time period
  const morningMeds = medications.filter(med => med.period === 'Morning');
  const afternoonMeds = medications.filter(med => med.period === 'Afternoon');
  const eveningMeds = medications.filter(med => med.period === 'Evening');

  // Decide whether to render our own header or let React Navigation handle it
  const renderHeader = () => {
    if (navigation) {
      // If using with React Navigation, it will use the header set in useEffect
      return null;
    }
    
    // Custom header for standalone use
    return (
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBack}
        >
          <CustomArrow />
        </TouchableOpacity>
        <Text style={styles.headerText}>Medication Reminders</Text>
        <View style={styles.headerRightSpace} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Render header based on navigation context */}
      {renderHeader()}

      <ScrollView>
        {/* Morning Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Morning</Text>
          {morningMeds.map(med => (
            <View key={med.id} style={styles.medicationItem}>
              <View>
                <Text style={styles.medicationName}>{med.name}</Text>
                <Text style={styles.medicationDetails}>{med.dosage} • {med.time}</Text>
              </View>
              <TouchableOpacity 
                style={[styles.checkbox, med.taken && styles.checkboxChecked]} 
                onPress={() => toggleTaken(med.id)}
              >
                {med.taken && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Afternoon Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Afternoon</Text>
          {afternoonMeds.map(med => (
            <View key={med.id} style={styles.medicationItem}>
              <View>
                <Text style={styles.medicationName}>{med.name}</Text>
                <Text style={styles.medicationDetails}>{med.dosage} • {med.time}</Text>
              </View>
              <TouchableOpacity 
                style={[styles.checkbox, med.taken && styles.checkboxChecked]} 
                onPress={() => toggleTaken(med.id)}
              >
                {med.taken && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Evening Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Evening</Text>
          {eveningMeds.map(med => (
            <View key={med.id} style={styles.medicationItem}>
              <View>
                <Text style={styles.medicationName}>{med.name}</Text>
                <Text style={styles.medicationDetails}>{med.dosage} • {med.time}</Text>
              </View>
              <TouchableOpacity 
                style={[styles.checkbox, med.taken && styles.checkboxChecked]} 
                onPress={() => toggleTaken(med.id)}
              >
                {med.taken && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => Alert.alert('Add Medication', 'Adding a new medication')}
      >
        <Text style={styles.addButtonText}>+ Add Medication</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#00C2D4', // Match the navigation header color
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    elevation: 0, // Match the navigation header
  },
  headerLeft: {
    paddingLeft: 10, // Match the style from Radiology component
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Custom arrow elements
  arrowContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
  },
  arrowLine: {
    width: 15,
    height: 2,
    backgroundColor: 'white',
    position: 'absolute',
    left: 0,
  },
  arrowHead: {
    width: 12,
    height: 12,
    borderWidth: 2,
    borderColor: 'white',
    borderRightWidth: 0,
    borderBottomWidth: 0,
    transform: [{ rotate: '-45deg' }],
    position: 'absolute',
    left: 0,
  },
  headerText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerRightSpace: {
    width: 40, // Same width as backButton for balance
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  medicationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '500',
  },
  medicationDetails: {
    color: 'gray',
    marginTop: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: 'green',
    borderColor: 'green',
  },
  checkmark: {
    color: 'white',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#ff7b7b',
    padding: 15,
    margin: 16,
    borderRadius: 25,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CustomMedicationReminder;