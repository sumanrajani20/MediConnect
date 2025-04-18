import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  StatusBar, 
  Image, 
  ScrollView, 
  Dimensions,
  Modal,
  Alert,
  TextInput
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const HeartRateScreen = ({ navigation, onSave }) => {
  // State variables
  const [heartRate, setHeartRate] = useState("72");
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [showHeartRatePicker, setShowHeartRatePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Sample heart rate data
  const heartRateData = [
    { time: '6:00 AM', value: 62, status: 'Rest' },
    { time: '8:30 AM', value: 78, status: 'Walking' },
    { time: '10:15 AM', value: 72, status: 'Working' },
    { time: '12:30 PM', value: 84, status: 'After lunch' },
    { time: '3:00 PM', value: 68, status: 'Resting' },
    { time: '5:45 PM', value: 92, status: 'Exercise' },
    { time: '8:00 PM', value: 74, status: 'Relaxing' },
  ];
  
  // Generate heart rate values for picker (40-200 BPM)
  const generateHeartRateValues = () => {
    const values = [];
    for (let i = 40; i <= 200; i++) {
      values.push(i.toString());
    }
    return values;
  };
  
  const heartRateValues = generateHeartRateValues();
  
  // Get zone text based on heart rate
  const getHeartRateZone = (rate) => {
    const numRate = typeof rate === 'string' ? parseInt(rate, 10) : rate;
    if (numRate < 60) return "Below resting";
    if (numRate <= 70) return "Resting";
    if (numRate <= 100) return "Normal activity";
    if (numRate <= 140) return "Moderate exercise";
    if (numRate <= 170) return "Intense exercise";
    return "Maximum effort";
  };
  
  // Get color based on heart rate
  const getHeartRateColor = (rate) => {
    const numRate = typeof rate === 'string' ? parseInt(rate, 10) : rate;
    if (numRate < 60) return "#2196F3"; // Blue
    if (numRate <= 70) return "#3F51B5"; // Indigo
    if (numRate <= 100) return "#4CAF50"; // Green
    if (numRate <= 140) return "#FFC107"; // Amber
    if (numRate <= 170) return "#FF5722"; // Deep Orange
    return "#F44336"; // Red
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
    // Validate heart rate
    const numRate = parseInt(heartRate, 10);
    if (isNaN(numRate) || numRate < 40 || numRate > 200) {
      Alert.alert('Error', 'Please enter a valid heart rate (40-200 BPM)');
      return;
    }

    // Create data object with all the form values
    const heartRateData = {
      heartRate: numRate,
      zone: getHeartRateZone(numRate),
      date: formatDate(date),
      time: formatTime(date),
      notes
    };
    
    // Here you can handle the save operation
    if (onSave) {
      onSave(heartRateData);
    }
    
    // Show confirmation alert
    Alert.alert('Success', 'Heart rate data saved successfully!');
    
    // Optionally navigate back
    // if (navigation) {
    //   navigation.goBack();
    // }
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
        <Text style={styles.headerTitle}>Heart Rate</Text>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>SAVE</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView}>
        {/* Heart Animation */}
        <TouchableOpacity 
          style={styles.heartAnimationContainer}
          onPress={() => setShowHeartRatePicker(true)}
        >
          <View style={styles.heartRateCircle}>
            <Text style={styles.currentHeartRate}>{heartRate}</Text>
            <Text style={styles.bpmText}>BPM</Text>
          </View>
          <Text style={styles.tapToEdit}>Tap to edit</Text>
        </TouchableOpacity>
        
        {/* Current Status */}
        <View style={styles.statusCard}>
          <Text style={styles.statusText}>
            Your heart rate is in the <Text 
              style={[styles.statusHighlight, {color: getHeartRateColor(heartRate)}]}
            >
              {getHeartRateZone(heartRate)}
            </Text> zone
          </Text>
        </View>
        
        {/* Notes Input Section */}
        <View style={styles.notesContainer}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Add notes about your heart rate..."
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
        
        {/* Chart Section - Simple Version */}
        <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>Today's Heart Rate</Text>
          
          <View style={styles.chartContent}>
            {/* Y-axis labels */}
            <View style={styles.chartYAxis}>
              <Text style={styles.yAxisLabel}>100</Text>
              <Text style={styles.yAxisLabel}>80</Text>
              <Text style={styles.yAxisLabel}>60</Text>
              <Text style={styles.yAxisLabel}>40</Text>
            </View>
            
            {/* Chart bars */}
            <View style={styles.chartBars}>
              {heartRateData.map((item, index) => (
                <View key={index} style={styles.barContainer}>
                  <View 
                    style={[
                      styles.bar, 
                      { 
                        height: Math.max(item.value - 40, 10) * 1.5,
                        backgroundColor: getHeartRateColor(item.value)
                      }
                    ]}
                  />
                  <Text style={styles.barLabel}>{item.time.split(' ')[0]}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        
        {/* Heart Rate Zones */}
        <View style={styles.zonesContainer}>
          <Text style={styles.sectionTitle}>Heart Rate Zones</Text>
          
          <View style={styles.zoneItem}>
            <View style={[styles.zoneBar, { backgroundColor: '#3F51B5', width: '20%' }]} />
            <View style={styles.zoneTextContainer}>
              <Text style={styles.zoneTitle}>Resting</Text>
              <Text style={styles.zoneRange}>60-70 BPM</Text>
            </View>
          </View>
          
          <View style={styles.zoneItem}>
            <View style={[styles.zoneBar, { backgroundColor: '#4CAF50', width: '40%' }]} />
            <View style={styles.zoneTextContainer}>
              <Text style={styles.zoneTitle}>Normal Activity</Text>
              <Text style={styles.zoneRange}>71-100 BPM</Text>
            </View>
          </View>
          
          <View style={styles.zoneItem}>
            <View style={[styles.zoneBar, { backgroundColor: '#FFC107', width: '60%' }]} />
            <View style={styles.zoneTextContainer}>
              <Text style={styles.zoneTitle}>Moderate Exercise</Text>
              <Text style={styles.zoneRange}>101-140 BPM</Text>
            </View>
          </View>
          
          <View style={styles.zoneItem}>
            <View style={[styles.zoneBar, { backgroundColor: '#FF5722', width: '80%' }]} />
            <View style={styles.zoneTextContainer}>
              <Text style={styles.zoneTitle}>Intense Exercise</Text>
              <Text style={styles.zoneRange}>141-170 BPM</Text>
            </View>
          </View>
          
          <View style={styles.zoneItem}>
            <View style={[styles.zoneBar, { backgroundColor: '#F44336', width: '100%' }]} />
            <View style={styles.zoneTextContainer}>
              <Text style={styles.zoneTitle}>Maximum Effort</Text>
              <Text style={styles.zoneRange}>171+ BPM</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      
      {/* Heart Rate Picker Modal */}
      <Modal
        visible={showHeartRatePicker}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Heart Rate</Text>
            
            <ScrollView style={styles.heartRateScrollView}>
              {heartRateValues.map((value, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.heartRateItem,
                    heartRate === value && styles.heartRateItemSelected
                  ]}
                  onPress={() => {
                    setHeartRate(value);
                  }}
                >
                  <Text 
                    style={[
                      styles.heartRateItemText,
                      heartRate === value && styles.heartRateItemTextSelected
                    ]}
                  >
                    {value} BPM
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <View style={styles.modalButtonRow}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowHeartRatePicker(false)}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => setShowHeartRatePicker(false)}
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

const { width } = Dimensions.get('window');

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
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  heartAnimationContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  heartRateCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#00CDCE',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentHeartRate: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
  },
  bpmText: {
    fontSize: 16,
    color: 'white',
    opacity: 0.8,
  },
  tapToEdit: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    margin: 15,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  statusHighlight: {
    fontWeight: 'bold',
  },
  notesContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    margin: 15,
    padding: 15,
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
    margin: 15,
    padding: 15,
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
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    margin: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartContent: {
    flexDirection: 'row',
    height: 220,
    marginTop: 10,
  },
  chartYAxis: {
    width: 30,
    height: '100%',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  yAxisLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  chartBars: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingLeft: 10,
    paddingBottom: 25,
  },
  barContainer: {
    alignItems: 'center',
    width: 35,
  },
  bar: {
    width: 20,
    borderRadius: 10,
    marginBottom: 5,
  },
  barLabel: {
    fontSize: 10,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  zonesContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    margin: 15,
    padding: 15,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  zoneItem: {
    marginBottom: 15,
  },
  zoneBar: {
    height: 20,
    borderRadius: 10,
    marginBottom: 5,
  },
  zoneTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  zoneTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  zoneRange: {
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
  heartRateScrollView: {
    maxHeight: 250,
    width: '100%',
  },
  heartRateItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  heartRateItemSelected: {
    backgroundColor: '#f0f8ff',
  },
  heartRateItemText: {
    fontSize: 18,
    color: '#333',
  },
  heartRateItemTextSelected: {
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

export default HeartRateScreen;