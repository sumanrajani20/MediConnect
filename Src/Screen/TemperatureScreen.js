import React, { useState } from 'react';
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
  Image
} from 'react-native';
import { Switch } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const TemperatureScreen = ({ navigation, onSave }) => {
  const [isFahrenheit, setIsFahrenheit] = useState(true);
  const [temperature, setTemperature] = useState('98.6');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date());
  const [showTempPicker, setShowTempPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Generate temperature values for the picker
  const generateTemperatureValues = () => {
    const values = [];
    if (isFahrenheit) {
      // Generate Fahrenheit values (95.0 to 105.0 in 0.1 increments)
      for (let i = 950; i <= 1050; i++) {
        values.push((i / 10).toFixed(1));
      }
    } else {
      // Generate Celsius values (35.0 to 41.0 in 0.1 increments)
      for (let i = 350; i <= 410; i++) {
        values.push((i / 10).toFixed(1));
      }
    }
    return values;
  };
  
  const temperatureValues = generateTemperatureValues();
  
  // Sample temperature data
  const tempData = [
    { date: 'Mon', value: isFahrenheit ? 98.4 : 36.9 },
    { date: 'Tue', value: isFahrenheit ? 98.6 : 37.0 },
    { date: 'Wed', value: isFahrenheit ? 99.1 : 37.3 },
    { date: 'Thu', value: isFahrenheit ? 98.8 : 37.1 },
    { date: 'Fri', value: isFahrenheit ? 98.6 : 37.0 },
    { date: 'Sat', value: isFahrenheit ? 98.4 : 36.9 },
    { date: 'Sun', value: isFahrenheit ? 98.6 : 37.0 },
  ];
  
  // Convert temperature when unit changes
  const handleUnitChange = (newIsFahrenheit) => {
    if (newIsFahrenheit !== isFahrenheit) {
      const currentTemp = parseFloat(temperature);
      if (!isNaN(currentTemp)) {
        let convertedTemp;
        if (newIsFahrenheit) {
          // Convert C to F
          convertedTemp = (currentTemp * 9/5) + 32;
        } else {
          // Convert F to C
          convertedTemp = (currentTemp - 32) * 5/9;
        }
        setTemperature(convertedTemp.toFixed(1));
      }
      setIsFahrenheit(newIsFahrenheit);
    }
  };
  
  // Get status text based on temperature
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
  
  // Get color based on temperature
  const getStatusColor = () => {
    const status = getStatusText();
    if (status === "Normal") return "#4CAF50";
    if (status === "Mild fever") return "#FF9800";
    if (status === "High fever") return "#F44336";
    return "#2196F3";
  };

  // Format date as DD-MM-YYYY
  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Format time as HH:MM AM/PM
  const formatTime = (date) => {
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
  };

  // Handle date change
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    
    // Keep the time from the original date
    const newDate = new Date(currentDate);
    newDate.setHours(date.getHours(), date.getMinutes());
    
    setDate(newDate);
  };

  // Handle time change
  const onTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || date;
    setShowTimePicker(false);
    
    // Keep the date from the original date but update the time
    const newDate = new Date(date);
    newDate.setHours(currentTime.getHours(), currentTime.getMinutes());
    
    setDate(newDate);
  };

  // Handle save button press
  const handleSave = () => {
    // Validate temperature
    const tempValue = parseFloat(temperature);
    if (isNaN(tempValue)) {
      Alert.alert('Error', 'Please enter a valid temperature');
      return;
    }

    // Create data object with all the form values
    const temperatureData = {
      temperature: tempValue,
      unit: isFahrenheit ? '°F' : '°C',
      status: getStatusText(),
      date: formatDate(date),
      time: formatTime(date),
      notes
    };
    
    // Here you can handle the save operation
    if (onSave) {
      onSave(temperatureData);
    }
    
    // Show confirmation alert
    Alert.alert('Success', 'Temperature data saved successfully!');
    
    // Optionally navigate back
    // if (navigation) {
    //   navigation.goBack();
    // }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#00C2D4" barStyle="light-content" />
      
      {/* Custom Header with updated back button */}
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
        <Text style={styles.headerTitle}>Temperature</Text>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>SAVE</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView}>
        {/* Temperature Unit Toggle */}
        <View style={styles.toggleContainer}>
          <Text style={[styles.toggleText, !isFahrenheit && styles.toggleActive]}>°C</Text>
          <Switch
            value={isFahrenheit}
            onValueChange={handleUnitChange}
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

        {/* Notes Input Section */}
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
        
        {/* Chart Section - Simplified */}
        <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>Weekly Trend</Text>
          <View style={styles.mockChartContainer}>
            {/* Simplistic visualization of temperature trend */}
            <View style={styles.dataPointsContainer}>
              {tempData.map((data, index) => (
                <View key={index} style={styles.dataPointColumn}>
                  <View 
                    style={[
                      styles.dataPoint, 
                      { 
                        height: 
                          isFahrenheit 
                            ? Math.max(20, (data.value - 97) * 40) 
                            : Math.max(20, (data.value - 36) * 70),
                        backgroundColor: '#00CDCE' 
                      }
                    ]} 
                  />
                  <Text style={styles.dataPointLabel}>{data.date}</Text>
                </View>
              ))}
            </View>
            <View style={styles.chartYAxis}>
              {isFahrenheit ? (
                <>
                  <Text style={styles.yAxisLabel}>100°F</Text>
                  <Text style={styles.yAxisLabel}>99°F</Text>
                  <Text style={styles.yAxisLabel}>98°F</Text>
                  <Text style={styles.yAxisLabel}>97°F</Text>
                </>
              ) : (
                <>
                  <Text style={styles.yAxisLabel}>38°C</Text>
                  <Text style={styles.yAxisLabel}>37°C</Text>
                  <Text style={styles.yAxisLabel}>36°C</Text>
                </>
              )}
            </View>
          </View>
        </View>
        
        {/* Temperature Guide */}
        <View style={styles.guideContainer}>
          <Text style={styles.sectionTitle}>Temperature Guide</Text>
          
          <View style={styles.guideItem}>
            <View style={[styles.guideColor, { backgroundColor: '#2196F3' }]} />
            <View style={styles.guideTextContainer}>
              <Text style={styles.guideTitle}>Below Normal</Text>
              <Text style={styles.guideValue}>
                {isFahrenheit ? 'Below 97.0°F' : 'Below 36.1°C'}
              </Text>
            </View>
          </View>
          
          <View style={styles.guideItem}>
            <View style={[styles.guideColor, { backgroundColor: '#4CAF50' }]} />
            <View style={styles.guideTextContainer}>
              <Text style={styles.guideTitle}>Normal</Text>
              <Text style={styles.guideValue}>
                {isFahrenheit ? '97.0-99.0°F' : '36.1-37.2°C'}
              </Text>
            </View>
          </View>
          
          <View style={styles.guideItem}>
            <View style={[styles.guideColor, { backgroundColor: '#FF9800' }]} />
            <View style={styles.guideTextContainer}>
              <Text style={styles.guideTitle}>Mild Fever</Text>
              <Text style={styles.guideValue}>
                {isFahrenheit ? '99.1-100.4°F' : '37.3-38.0°C'}
              </Text>
            </View>
          </View>
          
          <View style={styles.guideItem}>
            <View style={[styles.guideColor, { backgroundColor: '#F44336' }]} />
            <View style={styles.guideTextContainer}>
              <Text style={styles.guideTitle}>High Fever</Text>
              <Text style={styles.guideValue}>
                {isFahrenheit ? 'Above 100.4°F' : 'Above 38.0°C'}
              </Text>
            </View>
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
                    temperature === value && styles.tempItemSelected
                  ]}
                  onPress={() => {
                    setTemperature(value);
                  }}
                >
                  <Text 
                    style={[
                      styles.tempItemText,
                      temperature === value && styles.tempItemTextSelected
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
          onChange={onDateChange}
        />
      )}

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={date}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={onTimeChange}
        />
      )}
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