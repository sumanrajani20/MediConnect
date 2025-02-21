import React, { useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';

const MedicalHistory = ({ navigation }) => {
  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'Medical Record',
      headerTitleAlign: 'center',
      headerStyle: {
        backgroundColor: '#00C2D4', // Matches the card background
      },
      headerTintColor: '#fff',
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerLeft}
        >
          <Image
            source={require('../../assets/custom-arrow.png')} // Replace with your arrow image
            style={styles.arrowIcon}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/medical-icon.png')} // Replace with your medical icon
        style={styles.icon}
      />
      <Text style={styles.message}>You Have Not Added Any Medical Records Yet</Text>
      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>Add Records</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
  },
  arrowIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F8FB', // Light background
  },
  icon: {
    width: 200,
    height: 200,
    marginBottom: 20,
    
  },
  message: {
    fontSize: 18,
    fontWeight: '600',
    color: '#00BBD3',
    textAlign: 'center',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#00C2D4',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MedicalHistory;