import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, StatusBar, Image, Button } from 'react-native';

const VitalSign = ({ navigation }) => {
  const vitalData = [
    {
      id: 1,
      title: "Blood Pressure",
      value: "120/80",
      unit: "mmHg",
      status: "Your blood pressure is normal",
      screen: "BloodPressureScreen",
    },
    {
      id: 2,
      title: "Glucose Level",
      value: "95",
      unit: "mg/dL",
      status: "Your glucose level is normal",
      screen: "GlucoseLevelScreen",
    },
    {
      id: 3,
      title: "Temperature",
      value: "98.6",
      unit: "°F",
      status: "Your temperature is normal",
      screen: "TemperatureScreen",
    },
    {
      id: 4,
      title: "Heart Rate",
      value: "72",
      unit: "BPM",
      status: "Your heart rate is normal",
      screen: "HeartRateScreen",
    },
  ];

  const handleCardPress = (screenName) => {
    navigation && navigation.navigate(screenName);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#00C2D4" barStyle="light-content" />
      
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation && navigation.goBack()}
        >
          <Image
            source={require('../../assets/custom-arrow.png')}
            style={styles.backArrowImage}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vital Sign</Text>
        <View style={styles.emptySpace} />
      </View>
      
      {/* Cards Container */}
      <View style={styles.container}>
        <View style={styles.cardsWrapper}>
          {vitalData.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => handleCardPress(item.screen)}
              activeOpacity={0.8}
            >
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.value}>
                {item.value} <Text style={styles.unit}>{item.unit}</Text>
              </Text>
              <Text style={styles.status}>{item.status}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#00C2D4',
    height: 56,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
    width: 40,
  },
  backArrowImage: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: 'white',  // This will make any image white
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  emptySpace: {
    width: 40, // To balance the header title in center
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 25,
    paddingHorizontal: 15,
  },
  cardsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '85%',
    maxWidth: 500,
  },
  card: {
    width: '48%',
    borderRadius: 15,
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#00CDCE',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  unit: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  status: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 5,
  },
  testButtonContainer: {
    marginTop: 20,
    width: '85%',
    maxWidth: 500,
  }
});

export default VitalSign;