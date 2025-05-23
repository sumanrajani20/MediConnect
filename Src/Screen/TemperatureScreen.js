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
import FontAwesome from 'react-native-vector-icons/FontAwesome';

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
  const [editingItem, setEditingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Edit temperature record
  const editTemperature = (item) => {
    setEditingItem(item);
    setTemperature(item.temperature.toString());
    setIsFahrenheit(item.unit === '°F');
    setNotes(item.notes || '');
    setDate(new Date(item.date));
    setIsAdding(true);
  };

  // Delete temperature record
  const deleteTemperature = async (id) => {
    try {
      const user = auth().currentUser;
      if (!user) throw new Error('User not authenticated');

      Alert.alert(
        'Delete Record',
        'Are you sure you want to delete this temperature record?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await firestore()
                  .collection('users')
                  .doc(user.uid)
                  .collection('temperature')
                  .doc(id)
                  .delete();
                
                Alert.alert('Success', 'Temperature record deleted successfully!');
                fetchTemperatureData();
              } catch (error) {
                console.error('Error deleting temperature data:', error);
                Alert.alert('Error', 'Failed to delete temperature record.');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error initiating deletion:', error);
      Alert.alert('Error', 'Could not process your request.');
    }
  };

  const saveTemperature = async () => {
    try {
      setIsSubmitting(true);
      const user = auth().currentUser;
      if (!user) throw new Error('User not authenticated');

      const tempValue = parseFloat(temperature);
      if (isNaN(tempValue)) {
        Alert.alert('Error', 'Please select a valid temperature');
        setIsSubmitting(false);
        return;
      }

      const temperatureData = {
        temperature: tempValue,
        unit: isFahrenheit ? '°F' : '°C',
        status: getStatusText(),
        date: date.toISOString(),
        notes: notes.trim(),
        createdAt: editingItem ? editingItem.createdAt : firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };

      if (editingItem) {
        // Update existing record
        await firestore()
          .collection('users')
          .doc(user.uid)
          .collection('temperature')
          .doc(editingItem.id)
          .update(temperatureData);

        Alert.alert('Success', 'Temperature record updated successfully!');
      } else {
        // Add new record
        await firestore()
          .collection('users')
          .doc(user.uid)
          .collection('temperature')
          .add(temperatureData);

        Alert.alert('Success', 'Temperature data saved successfully!');
      }

      setIsAdding(false);
      setEditingItem(null); // Clear editing state
      fetchTemperatureData();
    } catch (error) {
      console.error('Error saving temperature data:', error);
      Alert.alert('Error', 'Failed to save temperature data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.recordCard}>
      <View style={styles.recordContent}>
        <Text style={styles.currentValueTitle}>Temperature</Text>
        <Text style={styles.currentValue}>
          {item.temperature} <Text style={styles.unit}>{item.unit}</Text>
        </Text>
        <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
          {item.status}
        </Text>
        <Text style={styles.dateText}>Date: {item.date ? formatDate(new Date(item.date)) : 'Unknown'}</Text>
        <Text style={styles.timeText}>Time: {item.date ? formatTime(new Date(item.date)) : 'Unknown'}</Text>
        <Text style={styles.notesText}>Notes: {item.notes || 'No notes'}</Text>
      </View>
      <View style={styles.cardActions}>
        {/* Edit Button */}
        <TouchableOpacity
          onPress={() => editTemperature(item)}
          style={styles.actionButton}
        >
          <FontAwesome name="edit" size={20} color="#4CAF50" />
        </TouchableOpacity>
    
        {/* Delete Button */}
        <TouchableOpacity
          onPress={() => deleteTemperature(item.id)}
          style={styles.actionButton}
        >
          <FontAwesome name="trash" size={20} color="#F44336" />
        </TouchableOpacity>
      </View>
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
            onPress={() => {
              setIsAdding(false);
              setEditingItem(null); // Clear editing state
            }}
            disabled={isSubmitting}
          >
            <Image
              source={require('../../assets/custom-arrow.png')}
              style={styles.backArrowImage}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {editingItem ? 'Edit Temperature' : 'Add Temperature'}
          </Text>
          <TouchableOpacity 
            style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]} 
            onPress={saveTemperature}
            disabled={isSubmitting}
          >
            <Text style={styles.saveButtonText}>
              {isSubmitting ? 'SAVING...' : 'SAVE'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Add/Edit Temperature Screen */}
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
            <Text style={[styles.status, { color: getStatusColor(getStatusText()) }]}>{getStatusText()}</Text>
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
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  scrollView: {
    padding: 15,
  },
  // Updated card styles for records with edit/delete buttons
  recordCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recordContent: {
    marginBottom: 10,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
  },
  actionButton: {
    marginHorizontal: 10,
    padding: 5,
  },
  dateText: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
  timeText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 3,
  },
  notesText: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  toggleText: {
    fontSize: 16,
    marginHorizontal: 15,
    color: '#555',
  },
  toggleActive: {
    fontWeight: 'bold',
    color: '#00CDCE',
  },
  currentValueCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  currentValueTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 10,
  },
  currentValue: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#00CDCE',
    marginBottom: 5,
  },
  unit: {
    fontSize: 24,
    fontWeight: 'normal',
  },
  status: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  tapToEdit: {
    fontSize: 14,
    color: '#888',
  },
  notesContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#444',
  },
  notesInput: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 14,
  },
  dateTimeContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
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
    padding: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    marginRight: 5,
  },
  timeSelector: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    marginLeft: 5,
  },
  dateTimeText: {
    fontSize: 14,
    color: '#333',
  },
  iconText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#444',
  },
  tempScrollView: {
    maxHeight: 300,
  },
  tempItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tempItemSelected: {
    backgroundColor: '#f0f9fa',
  },
  tempItemText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#444',
  },
  tempItemTextSelected: {
    fontWeight: 'bold',
    color: '#00CDCE',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
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