import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

const categories = [
  { name: 'Medical History', icon: 'medkit-outline', screen: 'MedicalHistory' },
  { name: 'Vital Signs', icon: 'pulse-outline', screen: 'VitalSign' },
  { name: 'Allergies', icon: 'alert-circle-outline', screen: 'Allergies' },
  { name: 'Reminders', icon: 'alarm-outline', screen: 'Reminders' },
  { name: 'Lab Results', icon: 'flask-outline', screen: 'LabResult' },
  { name: 'Radiology', icon: 'scan-outline', screen: 'Radiology' },
];

const CategoryCard = () => {
  const navigation = useNavigation();

  // ✅ Custom Header WITH Title and Showing the Header
  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'Categories',
      headerTitleAlign: 'center',
      headerStyle: { backgroundColor: '#00BBD3' },
      headerTintColor: '#fff',
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {categories.map((item, index) => (
          <TouchableOpacity key={index} onPress={() => navigation.navigate(item.screen)} style={styles.cardContainer}>
            <LinearGradient colors={['#33E4DB', '#00BBD3']} style={styles.card}>
              <Ionicons name={item.icon} size={50} color="#fff" />
              <Text style={styles.cardText}>{item.name}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 90,
  },
  cardContainer: {
    width: '45%',
    marginBottom: 20,
  },
  card: {
    width: '100%',
    height: 140,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    padding: 15,
  },
  cardText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default CategoryCard;
