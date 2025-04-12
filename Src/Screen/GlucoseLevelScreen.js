import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  Modal,
  Image
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const GlucoseLevelScreen = ({ navigation, onSave }) => {
  // State for form fields
  const [glucoseLevel, setGlucoseLevel] = useState('0');
  const [measurementType, setMeasurementType] = useState('Fasting'); // Default to Fasting
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [unit, setUnit] = useState('mg/dL');
  
  // State for date/time pickers
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Format date as DD-MM-YYYY
  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };
  
  // Format time as HH:MM AM/PM
  const formatTime = (time) => {
    let hours = time.getHours();
    const minutes = String(time.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
  };
  
  // Handle date change
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };
  
  // Handle time change
  const onTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || time;
    setShowTimePicker(Platform.OS === 'ios');
    setTime(currentTime);
  };
  
  // Handle save button press - Removed Firebase
  const handleSave = () => {
    // Validate glucose level
    if (!glucoseLevel || isNaN(parseFloat(glucoseLevel))) {
      Alert.alert('Error', 'Please enter a valid glucose level');
      return;
    }
    
    // Create data object with all the form values
    const glucoseData = {
      glucoseLevel: parseFloat(glucoseLevel),
      measurementType,
      date: formatDate(date),
      time: formatTime(time),
      notes,
      unit
    };
    
    // Here you can handle the save operation
    // For example, call the onSave prop or use navigation to go back
    if (onSave) {
      onSave(glucoseData);
    }
    
    // Show confirmation alert
    Alert.alert('Success', 'Glucose level data saved successfully!');
    
    // Navigate back after saving
    if (navigation) {
      navigation.goBack();
    }
  };
  
  // Handle back button press
  const handleBack = () => {
    // Navigate back
    if (navigation) {
      navigation.goBack();
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Header with updated back button */}
      <View style={[styles.header, { backgroundColor: '#13b9c8' }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <Image
            source={require('../../assets/custom-arrow.png')}
            style={styles.backArrowImage}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Blood Glucose</Text>
        <TouchableOpacity 
          style={[styles.saveButton, { backgroundColor: '#ff7b7b' }]} 
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>SAVE</Text>
        </TouchableOpacity>
      </View>
      
      {/* Main content */}
      <View style={styles.contentContainer}>
        {/* Result field */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Result*</Text>
          <View style={styles.resultInputRow}>
            <TextInput
              style={styles.resultInput}
              value={glucoseLevel}
              onChangeText={setGlucoseLevel}
              keyboardType="numeric"
            />
            <TouchableOpacity 
              style={styles.unitSelector}
              onPress={() => {
                // Toggle between mg/dL and mmol/L
                setUnit(unit === 'mg/dL' ? 'mmol/L' : 'mg/dL');
              }}
            >
              <Text style={styles.unitText}>{unit} ▼</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Type selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Type*</Text>
          <View style={styles.radioGroupContainer}>
            <View style={styles.radioRow}>
              <TouchableOpacity 
                style={styles.radioOption}
                onPress={() => setMeasurementType('Fasting')}
              >
                <View style={[
                  styles.radioCircle, 
                  measurementType === 'Fasting' && styles.radioCircleSelected
                ]}>
                  <View style={
                    measurementType === 'Fasting' 
                    ? styles.radioIndicator 
                    : styles.radioIndicatorHidden
                  } />
                </View>
                <Text style={styles.radioText}>Fasting</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.radioOption}
                onPress={() => setMeasurementType('PostPrandial')}
              >
                <View style={[
                  styles.radioCircle, 
                  measurementType === 'PostPrandial' && styles.radioCircleSelected
                ]}>
                  <View style={
                    measurementType === 'PostPrandial' 
                    ? styles.radioIndicator 
                    : styles.radioIndicatorHidden
                  } />
                </View>
                <Text style={styles.radioText}>PostPrandial</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.radioRow}>
              <TouchableOpacity 
                style={styles.radioOption}
                onPress={() => setMeasurementType('Random')}
              >
                <View style={[
                  styles.radioCircle, 
                  measurementType === 'Random' && styles.radioCircleSelected
                ]}>
                  <View style={
                    measurementType === 'Random' 
                    ? styles.radioIndicator 
                    : styles.radioIndicatorHidden
                  } />
                </View>
                <Text style={styles.radioText}>Random</Text>
              </TouchableOpacity>
              
              <View style={styles.emptyRadio} />
            </View>
          </View>
        </View>
        
        {/* Date and Time */}
        <View style={styles.dateTimeContainer}>
          <View style={styles.dateTimeColumn}>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity 
              style={styles.dateTimeSelector}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateTimeText}>{formatDate(date)}</Text>
              <Text style={styles.iconText}>📅</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.dateTimeColumn}>
            <Text style={styles.label}>Time</Text>
            <TouchableOpacity 
              style={styles.dateTimeSelector}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.dateTimeText}>{formatTime(time)}</Text>
              <Text style={styles.iconText}>⏱️</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Notes */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.notesInput, { padding: 10 }]}
            multiline={true}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add notes here..."
          />
        </View>
      </View>
      
      {/* Date Picker Modal (for iOS) */}
      {Platform.OS === 'ios' && showDatePicker && (
        <Modal
          transparent={true}
          animationType="slide"
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <DateTimePicker
                value={date}
                mode="date"
                display="spinner"
                onChange={onDateChange}
              />
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.modalButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
      
      {/* Time Picker Modal (for iOS) */}
      {Platform.OS === 'ios' && showTimePicker && (
        <Modal
          transparent={true}
          animationType="slide"
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <DateTimePicker
                value={time}
                mode="time"
                display="spinner"
                onChange={onTimeChange}
              />
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowTimePicker(false)}
              >
                <Text style={styles.modalButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
      
      {/* Date Picker (for Android) */}
      {Platform.OS === 'android' && showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
      
      {/* Time Picker (for Android) */}
      {Platform.OS === 'android' && showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={onTimeChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f1e7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#13b9c8',
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#0097a7',
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
    flex: 1,
    textAlign: 'center',
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
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  contentContainer: {
    flex: 1,
    padding: 15,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: '#666',
  },
  resultInputRow: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    height: 40,
  },
  resultInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 10,
  },
  unitSelector: {
    borderLeftWidth: 1,
    borderLeftColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: '100%',
    backgroundColor: '#f5f5f5',
  },
  unitText: {
    color: '#666',
  },
  radioGroupContainer: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 10,
  },
  radioRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    flex: 1,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  radioCircleSelected: {
    borderColor: '#13b9c8',
  },
  radioIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#13b9c8',
  },
  radioIndicatorHidden: {
    display: 'none',
  },
  radioText: {
    fontSize: 14,
    color: '#666',
  },
  emptyRadio: {
    flex: 1,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  dateTimeColumn: {
    flex: 1,
    marginRight: 10,
  },
  dateTimeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    height: 40,
    paddingHorizontal: 10,
  },
  dateTimeText: {
    color: '#666',
  },
  iconText: {
    fontSize: 16,
  },
  notesInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    height: 100,
    textAlignVertical: 'top',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalButton: {
    backgroundColor: '#13b9c8',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 15,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default GlucoseLevelScreen;