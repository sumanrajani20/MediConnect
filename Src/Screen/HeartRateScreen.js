import React, { useState, useEffect } from 'react';
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
  TextInput,
  FlatList,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { saveHeartRateData, getHeartRateData } from '../../services/VitalSignsService';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const HeartRateScreen = ({ navigation }) => {
  // State variables
  const [heartRate, setHeartRate] = useState("72");
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [showHeartRatePicker, setShowHeartRatePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [heartRateRecords, setHeartRateRecords] = useState([]);
  const [activeTab, setActiveTab] = useState('input'); // 'input' or 'records'
  // Add these new state variables for editing
  const [isEditing, setIsEditing] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState(null);

  // Fetch heart rate records on component mount
  useEffect(() => {
    fetchHeartRateRecords();
  }, []);

  const fetchHeartRateRecords = async () => {
    try {
      const records = await getHeartRateData();
      setHeartRateRecords(records);
    } catch (error) {
      console.error('Error fetching heart rate records:', error);
    }
  };

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
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
  };

  // Handle date change
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  // Handle time change
  const onTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || date;
    setShowTimePicker(false);
    const newDate = new Date(date);
    newDate.setHours(currentTime.getHours(), currentTime.getMinutes());
    setDate(newDate);
  };
  
  // Reset form fields
  const resetForm = () => {
    setHeartRate("72");
    setDate(new Date());
    setNotes('');
    setIsEditing(false);
    setEditingRecordId(null);
  };
  
  // Handle edit record
  const handleEditRecord = (record) => {
    setHeartRate(record.bpm.toString());
    setDate(new Date(record.date));
    setNotes(record.notes || '');
    setIsEditing(true);
    setEditingRecordId(record.id);
    setActiveTab('input'); // Switch to input tab for editing
  };
  
  // Handle delete record
  const handleDeleteRecord = (recordId) => {
    Alert.alert(
      'Delete Record',
      'Are you sure you want to delete this heart rate record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Import your delete function from the service
              // Assuming there's a deleteHeartRateData function in your service
              // await deleteHeartRateData(recordId);
              
              // For now, let's filter the records locally (update this with your actual delete logic)
              const updatedRecords = heartRateRecords.filter(record => record.id !== recordId);
              setHeartRateRecords(updatedRecords);
              Alert.alert('Success', 'Heart rate record deleted successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete heart rate record.');
            }
          }
        }
      ]
    );
  };
  
  // Handle save button press
  const handleSave = async () => {
    const numRate = parseInt(heartRate, 10);
    if (isNaN(numRate) || numRate < 40 || numRate > 200) {
      Alert.alert('Error', 'Please enter a valid heart rate (40-200 BPM)');
      return;
    }

    const heartRateData = {
      bpm: numRate,
      zone: getHeartRateZone(numRate),
      date: date.toISOString(),
      notes: notes.trim(),
    };

    try {
      if (isEditing && editingRecordId) {
        // Update existing record
        // Assuming there's an updateHeartRateData function in your service
        // await updateHeartRateData(editingRecordId, heartRateData);
        
        // For now, let's update the records locally (update this with your actual update logic)
        const updatedRecords = heartRateRecords.map(record => {
          if (record.id === editingRecordId) {
            return { ...record, ...heartRateData };
          }
          return record;
        });
        
        setHeartRateRecords(updatedRecords);
        Alert.alert('Success', 'Heart rate data updated successfully!');
      } else {
        // Create new record
        await saveHeartRateData(heartRateData);
        Alert.alert('Success', 'Heart rate data saved successfully!');
      }
      
      fetchHeartRateRecords();
      resetForm();
    } catch (error) {
      Alert.alert('Error', 'Failed to save heart rate data.');
    }
  };

  // Render a single heart rate record
  const renderHeartRateItem = ({ item }) => (
    <View style={styles.recordCard}>
      <Text style={styles.recordText}>
        <Text style={styles.recordLabel}>Heart Rate:</Text> {item.bpm} BPM
      </Text>
      <Text style={styles.recordText}>
        <Text style={styles.recordLabel}>Zone:</Text> {item.zone}
      </Text>
      <Text style={styles.recordText}>
        <Text style={styles.recordLabel}>Date:</Text> {formatDate(new Date(item.date))}
      </Text>
      <Text style={styles.recordText}>
        <Text style={styles.recordLabel}>Notes:</Text> {item.notes || 'No notes'}
      </Text>
      
      {/* Action buttons at the bottom right */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          onPress={() => handleEditRecord(item)}
          style={styles.actionButton}
        >
          <FontAwesome name="edit" size={20} color="#4CAF50" />
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => handleDeleteRecord(item.id)}
          style={styles.actionButton}
        >
          <FontAwesome name="trash" size={20} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render input form
  const renderInputForm = () => (
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
    </ScrollView>
  );

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
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Heart Rate' : 'Heart Rate'}
        </Text>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>
            {isEditing ? 'UPDATE' : 'SAVE'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Tab buttons */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'input' && styles.activeTab]}
          onPress={() => setActiveTab('input')}
        >
          <Text style={[styles.tabText, activeTab === 'input' && styles.activeTabText]}>
            {isEditing ? 'Edit Reading' : 'New Reading'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'records' && styles.activeTab]}
          onPress={() => {
            setActiveTab('records');
            if (isEditing) {
              resetForm();
            }
          }}
        >
          <Text style={[styles.tabText, activeTab === 'records' && styles.activeTabText]}>
            History
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Content based on active tab */}
      {activeTab === 'input' ? (
        renderInputForm()
      ) : (
        <View style={styles.recordsListContainer}>
          <Text style={styles.recordsTitle}>Heart Rate Records</Text>
          <FlatList
            data={heartRateRecords}
            keyExtractor={(item) => item.id}
            renderItem={renderHeartRateItem}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No heart rate records found.</Text>
            }
          />
        </View>
      )}
      
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
  // Add these new styles
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    padding: 5,
    borderRadius: 10,
    margin: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontWeight: '500',
    color: '#888',
  },
  activeTabText: {
    color: '#00C2D4',
    fontWeight: 'bold',
  },
  recordsListContainer: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  recordsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  
  // Existing styles
  recordsContainer: {
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
  recordCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    position: 'relative', // Add this for absolute positioning of action buttons
  },
  recordText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  recordLabel: {
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
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
  },
  currentHeartRate: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
  },
  bpmText: {
    fontSize: 16,
    color: 'white',
    opacity: 0.8,
  },
  tapToEdit: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    margin: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statusText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#444',
  },
  statusHighlight: {
    fontWeight: 'bold',
  },
  notesContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    margin: 15,
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
    margin: 15,
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
  heartRateScrollView: {
    maxHeight: 300,
  },
  heartRateItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  heartRateItemSelected: {
    backgroundColor: '#f0f9fa',
  },
  heartRateItemText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#444',
  },
  heartRateItemTextSelected: {
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
  // Add these for action buttons
  actionButtonsContainer: {
    position: 'absolute',
    bottom: 10,
    right: 15,
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 15,
    padding: 5,
  },
});

export default HeartRateScreen;