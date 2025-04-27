import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
  Modal,
  Image,
  FlatList,
} from 'react-native';
import { Switch } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const TemperatureScreen = ({ navigation }) => {
  const [isFahrenheit, setIsFahrenheit] = useState(true);
  const [temperature, setTemperature] = useState('98.6');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date());
  const [showTempPicker, setShowTempPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [temperatureData, setTemperatureData] = useState([]);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchTemperatureData();
  }, []);

  const fetchTemperatureData = async () => {
    try {
      const user = auth().currentUser;
      if (!user) throw new Error('User not authenticated');

      const snapshot = await firestore()
        .collection('users')
        .doc(user.uid)
        .collection('temperature')
        .orderBy('createdAt', 'desc')
        .get();

      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setTemperatureData(data);
    } catch (error) {
      console.error('Error fetching temperature data:', error);
    }
  };

  const getStatusColor = (status) => {
    if (status === "Normal") return "#4CAF50"; // Green for normal
    if (status === "Mild fever") return "#FF9800"; // Orange for mild fever
    if (status === "High fever") return "#F44336"; // Red for high fever
    return "#2196F3"; // Blue for below normal or unknown
  };

  const getStatusText = () => {
    const tempValue = parseFloat(temperature);
    if (isNaN(tempValue)) return "Invalid";

    if (isFahrenheit) {
      if (tempValue < 97.0) return "Below normal";
      if (tempValue <= 99.0) return "Normal";
      if (tempValue <= 100.4) return "Mild fever";
      return "High fever";
    } else {
      if (tempValue < 36.1) return "Below normal";
      if (tempValue <= 37.2) return "Normal";
      if (tempValue <= 38.0) return "Mild fever";
      return "High fever";
    }
  };

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatTime = (date) => {
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
  };

  const generateTemperatureValues = () => {
    const values = [];
    if (isFahrenheit) {
      for (let i = 950; i <= 1050; i++) {
        values.push((i / 10).toFixed(1));
      }
    } else {
      for (let i = 350; i <= 410; i++) {
        values.push((i / 10).toFixed(1));
      }
    }
    return values;
  };

  const saveTemperature = async () => {
    try {
      const user = auth().currentUser;
      if (!user) throw new Error('User not authenticated');

      const tempValue = parseFloat(temperature);
      if (isNaN(tempValue)) {
        Alert.alert('Error', 'Please select a valid temperature');
        return;
      }

      const temperatureData = {
        temperature: tempValue,
        unit: isFahrenheit ? '°F' : '°C',
        status: getStatusText(),
        date: date.toISOString(),
        notes: notes.trim(),
        createdAt: firestore.FieldValue.serverTimestamp(),
      };

      await firestore()
        .collection('users')
        .doc(user.uid)
        .collection('temperature')
        .add(temperatureData);

      Alert.alert('Success', 'Temperature data saved successfully!');
      setIsAdding(false);
      fetchTemperatureData();
    } catch (error) {
      console.error('Error saving temperature data:', error);
      Alert.alert('Error', 'Failed to save temperature data.');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.currentValueCard}>
      <Text style={styles.currentValueTitle}>Temperature</Text>
      <Text style={styles.currentValue}>
        {item.temperature} <Text style={styles.unit}>{item.unit}</Text>
      </Text>
      <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
        {item.status}
      </Text>
      <Text style={styles.tapToEdit}>{item.date ? new Date(item.date).toLocaleString() : 'Unknown'}</Text>
      <Text style={styles.tapToEdit}>{item.notes || 'No notes'}</Text>
    </View>
  );

  const temperatureValues = generateTemperatureValues();

  if (isAdding) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar backgroundColor="#00C2D4" barStyle="light-content" />

        {/* Custom Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setIsAdding(false)}
          >
            <Image
              source={require('../../assets/custom-arrow.png')}
              style={styles.backArrowImage}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Temperature</Text>
          <TouchableOpacity style={styles.saveButton} onPress={saveTemperature}>
            <Text style={styles.saveButtonText}>SAVE</Text>
          </TouchableOpacity>
        </View>

        {/* Add Temperature Screen */}
        <ScrollView style={styles.scrollView}>
          {/* Temperature Unit Toggle */}
          <View style={styles.toggleContainer}>
            <Text style={[styles.toggleText, !isFahrenheit && styles.toggleActive]}>°C</Text>
            <Switch
              value={isFahrenheit}
              onValueChange={setIsFahrenheit}
              trackColor={{ false: "#00CDCE", true: "#00CDCE" }}
              thumbColor={"#fff"}
            />
            <Text style={[styles.toggleText, isFahrenheit && styles.toggleActive]}>°F</Text>
          </View>

          {/* Current Temperature Card */}
          <TouchableOpacity
            style={styles.currentValueCard}
            onPress={() => setShowTempPicker(true)}
          >
            <Text style={styles.currentValueTitle}>Current Temperature</Text>
            <Text style={styles.currentValue}>
              {temperature} <Text style={styles.unit}>{isFahrenheit ? '°F' : '°C'}</Text>
            </Text>
            <Text style={[styles.status, { color: getStatusColor() }]}>{getStatusText()}</Text>
            <Text style={styles.tapToEdit}>Tap to edit</Text>
          </TouchableOpacity>

          {/* Notes Input */}
          <View style={styles.notesContainer}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Add notes about your temperature reading..."
              multiline={true}
              value={notes}
              onChangeText={setNotes}
            />
          </View>

          {/* Date and Time */}
          <View style={styles.dateTimeContainer}>
            <Text style={styles.sectionTitle}>Date & Time</Text>
            <View style={styles.dateTimeRow}>
              <TouchableOpacity
                style={styles.dateSelector}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateTimeText}>{formatDate(date)}</Text>
                <Text style={styles.iconText}>📅</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.timeSelector}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.dateTimeText}>{formatTime(date)}</Text>
                <Text style={styles.iconText}>⏱️</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Temperature Picker Modal */}
        <Modal
          visible={showTempPicker}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Temperature</Text>

              <ScrollView style={styles.tempScrollView}>
                {temperatureValues.map((value, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.tempItem,
                      temperature === value && styles.tempItemSelected,
                    ]}
                    onPress={() => {
                      setTemperature(value);
                    }}
                  >
                    <Text
                      style={[
                        styles.tempItemText,
                        temperature === value && styles.tempItemTextSelected,
                      ]}
                    >
                      {value} {isFahrenheit ? '°F' : '°C'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowTempPicker(false)}
                >
                  <Text style={styles.modalButtonTextCancel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={() => setShowTempPicker(false)}
                >
                  <Text style={styles.modalButtonTextConfirm}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}

        {/* Time Picker */}
        {showTimePicker && (
          <DateTimePicker
            value={date}
            mode="time"
            is24Hour={false}
            display="default"
            onChange={(event, selectedTime) => {
              setShowTimePicker(false);
              if (selectedTime) setDate(selectedTime);
            }}
          />
        )}
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>Temperature Records</Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => setIsAdding(true)}
        >
          <Text style={styles.saveButtonText}>ADD</Text>
        </TouchableOpacity>
      </View>

      {/* Temperature Records List */}
      <FlatList
        data={temperatureData}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.scrollView}
        ListEmptyComponent={
          <View style={styles.notesContainer}>
            <Text style={styles.tapToEdit}>No temperature records found.</Text>
          </View>
        }
      />
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
    backgroundColor: '#13b9c8',
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
    tintColor: 'white',
  },
  backButtonText: {
    fontSize: 24,
    color: 'white',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#ff7b7b',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
    padding: 15,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '500',
    marginHorizontal: 10,
    color: '#666',
  },
  toggleActive: {
    color: '#00CDCE',
    fontWeight: 'bold',
  },
  currentValueCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginVertical: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentValueTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  currentValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
  },
  unit: {
    fontSize: 24,
    fontWeight: 'normal',
  },
  status: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  tapToEdit: {
    fontSize: 12,
    color: '#888',
    marginTop: 10,
  },
  notesContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 10,
    height: 80,
    textAlignVertical: 'top',
  },
  dateTimeContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateSelector: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 10,
    marginRight: 5,
  },
  timeSelector: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 10,
    marginLeft: 5,
  },
  dateTimeText: {
    fontSize: 14,
    color: '#444',
  },
  iconText: {
    fontSize: 16,
    color: '#00CDCE',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mockChartContainer: {
    flexDirection: 'row',
    height: 200,
    marginTop: 10,
  },
  chartYAxis: {
    width: 50,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 10,
    paddingVertical: 15,
  },
  yAxisLabel: {
    fontSize: 12,
    color: '#888',
  },
  dataPointsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingVertical: 15,
  },
  dataPointColumn: {
    alignItems: 'center',
  },
  dataPoint: {
    width: 20,
    borderRadius: 10,
    marginBottom: 5,
  },
  dataPointLabel: {
    fontSize: 10,
    color: '#888',
  },
  guideContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  guideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  guideColor: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 10,
  },
  guideTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  guideValue: {
    fontSize: 14,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  tempScrollView: {
    maxHeight: 250,
    width: '100%',
  },
  tempItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  tempItemSelected: {
    backgroundColor: '#f0f8ff',
  },
  tempItemText: {
    fontSize: 18,
    color: '#333',
  },
  tempItemTextSelected: {
    fontWeight: 'bold',
    color: '#00CDCE',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    margin: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: '#00CDCE',
  },
  modalButtonTextCancel: {
    color: '#666',
    fontWeight: 'bold',
  },
  modalButtonTextConfirm: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default TemperatureScreen;