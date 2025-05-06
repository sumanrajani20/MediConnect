import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  Image,
  Modal,
  TextInput,
  SafeAreaView,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Safe toString helper
const safeToString = (value) => {
  if (value === undefined || value === null) {
    return '';
  }
  return value.toString();
};

const CustomMedicationReminder = ({ navigation }) => {
  // Sample medications with their status
  const [medications, setMedications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for add medication modal
  const [modalVisible, setModalVisible] = useState(false);
  const [medicationName, setMedicationName] = useState('');
  const [medicationDosage, setMedicationDosage] = useState('');
  const [medicationTime, setMedicationTime] = useState('08:00');
  const [medicationPeriod, setMedicationPeriod] = useState('Morning');
  
  // State for reminder modal
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const [dueMedication, setDueMedication] = useState(null);

  // Setup navigation
  useEffect(() => {
    if (navigation) {
      navigation.setOptions({
        headerShown: true,
        headerTitle: 'Medication Reminders',
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: '#00C2D4',
          elevation: 0,
        },
        headerTintColor: '#fff',
        headerLeft: () => (
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.headerLeft}
          >
            <Image
              source={require('../../assets/custom-arrow.png')}
              style={styles.customArrowImage}
            />
          </TouchableOpacity>
        ),
      });
    }
  }, [navigation]);

  // Load medications from AsyncStorage on component mount
  useEffect(() => {
    const loadMedications = async () => {
      try {
        const storedMedications = await AsyncStorage.getItem('medications');
        if (storedMedications) {
          setMedications(JSON.parse(storedMedications));
        } else {
          // Default medications if none are stored
          const defaultMedications = [
            { id: 1, name: 'Lisinopril', dosage: '10mg', time: '8:00 AM', timeValue: '08:00', period: 'Morning', taken: false },
            { id: 2, name: 'Metformin', dosage: '500mg', time: '9:30 AM', timeValue: '09:30', period: 'Morning', taken: true },
            { id: 3, name: 'Atorvastatin', dosage: '20mg', time: '1:00 PM', timeValue: '13:00', period: 'Afternoon', taken: false },
            { id: 4, name: 'Aspirin', dosage: '81mg', time: '8:00 PM', timeValue: '20:00', period: 'Evening', taken: false },
          ];
          setMedications(defaultMedications);
          await AsyncStorage.setItem('medications', JSON.stringify(defaultMedications));
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading medications:', error);
        setIsLoading(false);
      }
    };
    
    loadMedications();
  }, []);

  // Save medications to AsyncStorage whenever they change
  useEffect(() => {
    const saveMedications = async () => {
      try {
        if (medications) {
          await AsyncStorage.setItem('medications', JSON.stringify(medications));
        }
      } catch (error) {
        console.error('Error saving medications:', error);
      }
    };
    
    if (!isLoading && medications) {
      saveMedications();
    }
  }, [medications, isLoading]);

  // Function to check for medications that are due
  const checkDueMedications = () => {
    if (!medications || medications.length === 0) return;
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    medications.forEach(med => {
      if (med.taken) return;
      
      // Safely handle the timeValue
      if (!med.timeValue) return;
      
      const timeParts = med.timeValue.split(':');
      if (timeParts.length !== 2) return;
      
      const medHour = parseInt(timeParts[0], 10);
      const medMinute = parseInt(timeParts[1], 10);
      
      if (isNaN(medHour) || isNaN(medMinute)) return;
      
      // If current time matches medication time exactly (or within 1 minute)
      if (currentHour === medHour && Math.abs(currentMinute - medMinute) <= 1) {
        setDueMedication(med);
        setReminderModalVisible(true);
      }
    });
  };
  
  // Schedule medication checks
  useEffect(() => {
    // Initial check
    if (medications && medications.length > 0) {
      checkDueMedications();
    }
    
    // Set interval for medication checks (every minute)
    const interval = setInterval(() => {
      if (medications && medications.length > 0) {
        checkDueMedications();
      }
    }, 60000); // 60 seconds
    
    // Clear interval on component unmount
    return () => clearInterval(interval);
  }, [medications]);

  // Toggle medication taken status
  const toggleTaken = (id) => {
    if (!medications) return;
    
    const updatedMeds = medications.map(med => 
      med.id === id ? {...med, taken: !med.taken} : med
    );
    setMedications(updatedMeds);
  };

  // Get medication status based on time
  const getMedicationStatus = (medication) => {
    if (!medication) return 'upcoming';
    if (medication.taken) return 'taken';
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    
    // Safely handle timeValue
    if (!medication.timeValue) return 'upcoming';
    
    const timeParts = medication.timeValue.split(':');
    if (timeParts.length !== 2) return 'upcoming';
    
    const medHour = parseInt(timeParts[0], 10);
    const medMinute = parseInt(timeParts[1], 10);
    
    if (isNaN(medHour) || isNaN(medMinute)) return 'upcoming';
    
    const medTimeInMinutes = medHour * 60 + medMinute;
    const timeDiffMinutes = currentTimeInMinutes - medTimeInMinutes;
    
    if (timeDiffMinutes >= 30) {
      return 'overdue';
    } else if (timeDiffMinutes >= 0) {
      return 'due';
    } else if (timeDiffMinutes >= -30) {
      return 'due-soon';
    } else {
      return 'upcoming';
    }
  };

  // Add a new medication
  const addMedication = () => {
    if (!medicationName || !medicationDosage || !medicationTime) {
      Alert.alert('Missing Information', 'Please fill all the fields');
      return;
    }
    
    // Convert 24-hour time to 12-hour display time
    const formatDisplayTime = (timeValue) => {
      if (!timeValue) return '';
      
      const timeParts = timeValue.split(':');
      if (timeParts.length !== 2) return '';
      
      const hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1], 10);
      
      if (isNaN(hours) || isNaN(minutes)) return '';
      
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHour = hours % 12 || 12; // Convert 0 to 12
      return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
    };
    
    const newId = medications && medications.length > 0 
      ? Math.max(...medications.map(m => m.id || 0)) + 1
      : 1;
    
    const newMedication = {
      id: newId,
      name: medicationName,
      dosage: medicationDosage,
      time: formatDisplayTime(medicationTime),
      timeValue: medicationTime,
      period: medicationPeriod,
      taken: false
    };
    
    setMedications(medications ? [...medications, newMedication] : [newMedication]);
    resetForm();
    setModalVisible(false);
  };
  
  // Update period based on time
  const updatePeriodFromTime = (timeValue) => {
    if (!timeValue) return;
    
    const hour = parseInt(timeValue.split(':')[0], 10);
    if (isNaN(hour)) return;
    
    if (hour < 12) {
      setMedicationPeriod('Morning');
    } else if (hour < 17) {
      setMedicationPeriod('Afternoon');
    } else {
      setMedicationPeriod('Evening');
    }
  };
  
  // Handle time change
  const handleTimeChange = (newTime) => {
    if (typeof newTime === 'string') {
      setMedicationTime(newTime);
      updatePeriodFromTime(newTime);
    }
  };
  
  // Reset form fields
  const resetForm = () => {
    setMedicationName('');
    setMedicationDosage('');
    setMedicationTime('08:00');
    setMedicationPeriod('Morning');
  };

  // Calculate medication counts
  const totalMeds = medications ? medications.length : 0;
  const takenMeds = medications ? medications.filter(med => med.taken).length : 0;
  
  // Group medications by time period
  const morningMeds = medications ? medications.filter(med => med.period === 'Morning') : [];
  const afternoonMeds = medications ? medications.filter(med => med.period === 'Afternoon') : [];
  const eveningMeds = medications ? medications.filter(med => med.period === 'Evening') : [];

  // Render medication item with status
  const renderMedicationItem = (medication) => {
    if (!medication) return null;
    
    const status = getMedicationStatus(medication);
    
    return (
      <View key={medication.id} style={styles.medicationItem}>
        <View style={styles.medicationInfo}>
          <View style={styles.medicationNameRow}>
            <Text style={styles.medicationName}>{medication.name || 'Unnamed'}</Text>
            <View style={getStatusStyle(status)}>
              <Text style={styles.statusBadgeText}>{getStatusText(status)}</Text>
            </View>
          </View>
          <Text style={styles.medicationDetails}>{medication.dosage || ''} • {medication.time || ''}</Text>
        </View>
        <TouchableOpacity 
          style={[
            styles.checkbox,
            medication.taken && styles.checkboxChecked,
            status === 'overdue' && !medication.taken && styles.checkboxOverdue
          ]} 
          onPress={() => toggleTaken(medication.id)}
        >
          {medication.taken && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>
      </View>
    );
  };

  // Get status style based on status
  const getStatusStyle = (status) => {
    switch(status) {
      case 'taken':
        return styles.statusBadgeTaken;
      case 'due':
        return styles.statusBadgeDue;
      case 'due-soon':
        return styles.statusBadgeDueSoon;
      case 'overdue':
        return styles.statusBadgeOverdue;
      default:
        return styles.statusBadgeUpcoming;
    }
  };
  
  // Get status text based on status
  const getStatusText = (status) => {
    switch(status) {
      case 'taken':
        return 'Taken';
      case 'due':
        return 'Due now';
      case 'due-soon':
        return 'Due soon';
      case 'overdue':
        return 'Overdue';
      default:
        return 'Upcoming';
    }
  };

  // Render section if it has medications
  const renderSection = (title, meds, iconStyle) => {
    if (!meds || meds.length === 0) return null;
    
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIcon, iconStyle]}></View>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        {meds.map(med => renderMedicationItem(med))}
      </View>
    );
  };

  // Decide whether to render our own header or let React Navigation handle it
  const renderHeader = () => {
    if (navigation) {
      // If using with React Navigation, it will use the header set in useEffect
      return null;
    }
    
    // Custom header for standalone use
    return (
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Image
            source={require('../../assets/custom-arrow.png')}
            style={styles.customArrowImage}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medication Reminders</Text>
        <View style={styles.rightButton} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {renderHeader()}
      
      <ScrollView style={styles.container}>
        {/* Progress Overview */}
        <View style={styles.progressContainer}>
          <View style={styles.progressCircle}>
            <Text style={styles.progressText}>
              {takenMeds}/{totalMeds}
            </Text>
            <Text style={styles.progressLabel}>Taken</Text>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: `${totalMeds > 0 ? (takenMeds / totalMeds) * 100 : 0}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressBarLabel}>
              {totalMeds > 0 ? Math.round((takenMeds / totalMeds) * 100) : 0}% Complete
            </Text>
          </View>
        </View>
        
        {/* Medication Sections */}
        {renderSection('Morning', morningMeds, styles.morningIcon)}
        {renderSection('Afternoon', afternoonMeds, styles.afternoonIcon)}
        {renderSection('Evening', eveningMeds, styles.eveningIcon)}
        
        {/* Add button to trigger modal */}
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Add Medication</Text>
        </TouchableOpacity>
      </ScrollView>
      
      {/* Add Medication Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Add Medication</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Medication Name</Text>
              <TextInput
                style={styles.input}
                value={medicationName}
                onChangeText={setMedicationName}
                placeholder="e.g., Lisinopril"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Dosage</Text>
              <TextInput
                style={styles.input}
                value={medicationDosage}
                onChangeText={setMedicationDosage}
                placeholder="e.g., 10mg"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Time</Text>
              <TextInput
                style={styles.input}
                value={medicationTime}
                onChangeText={handleTimeChange}
                placeholder="hh:mm (24h)"
                keyboardType="numbers-and-punctuation"
              />
              <Text style={styles.helperText}>
                Format: 24-hour (e.g., 08:00 for 8 AM, 20:00 for 8 PM)
              </Text>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Time Period</Text>
              <View style={styles.periodButtonsContainer}>
                {['Morning', 'Afternoon', 'Evening'].map((period) => (
                  <TouchableOpacity
                    key={period}
                    style={[
                      styles.periodButton,
                      medicationPeriod === period && styles.activePeriodButton
                    ]}
                    onPress={() => setMedicationPeriod(period)}
                  >
                    <Text 
                      style={[
                        styles.periodButtonText,
                        medicationPeriod === period && styles.activePeriodButtonText
                      ]}
                    >
                      {period}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.buttonCancel]}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.buttonCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.buttonSave]}
                onPress={addMedication}
              >
                <Text style={styles.buttonSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Reminder Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={reminderModalVisible}
        onRequestClose={() => setReminderModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.reminderModalView}>
            <Text style={styles.reminderTitle}>Medicine Reminder</Text>
            
            {dueMedication && (
              <>
                <View style={styles.reminderContent}>
                  <Text style={styles.reminderMedName}>{dueMedication.name}</Text>
                  <Text style={styles.reminderDetails}>
                    {dueMedication.dosage} • {dueMedication.time}
                  </Text>
                </View>
                
                <View style={styles.reminderButtons}>
                  <TouchableOpacity
                    style={[styles.reminderButton, styles.buttonLater]}
                    onPress={() => setReminderModalVisible(false)}
                  >
                    <Text style={styles.buttonLaterText}>Remind later</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.reminderButton, styles.buttonTaken]}
                    onPress={() => {
                      toggleTaken(dueMedication.id);
                      setReminderModalVisible(false);
                    }}
                  >
                    <Text style={styles.buttonTakenText}>Mark as taken</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#00C2D4',
    height: 60,
    paddingHorizontal: 15,
  },
  headerLeft: {
    padding: 10,
  },
  customArrowImage: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: 'white',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    alignItems: 'center',
    
  },
  rightButton: {
    width: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    margin: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  progressCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00CDCE',
  },
  progressText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00CDCE',
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
  },
  progressBarContainer: {
    flex: 1,
    marginLeft: 15,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#00CDCE',
  },
  progressBarLabel: {
    marginTop: 5,
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 10,
  },
  morningIcon: {
    backgroundColor: '#FFD54F', // amber
  },
  afternoonIcon: {
    backgroundColor: '#FF8A65', // deep orange
  },
  eveningIcon: {
    backgroundColor: '#7986CB', // indigo
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  medicationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  medicationInfo: {
    flex: 1,
  },
  medicationNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  medicationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  medicationDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statusBadgeTaken: {
    backgroundColor: '#4CAF50', // green
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 2,
  },
  statusBadgeDue: {
    backgroundColor: '#FF5722', // deep orange
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 2,
  },
  statusBadgeDueSoon: {
    backgroundColor: '#FFC107', // amber
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 2,
  },
  statusBadgeOverdue: {
    backgroundColor: '#F44336', // red
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 2,
  },
  statusBadgeUpcoming: {
    backgroundColor: '#2196F3', // blue
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 2,
  },
  statusBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#00CDCE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#00CDCE',
  },
  checkboxOverdue: {
    borderColor: '#F44336',
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#FF7B7B',
    margin: 15,
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
  },
  periodButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  periodButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#DDD',
    alignItems: 'center',
    marginHorizontal: 2,
    borderRadius: 5,
  },
  activePeriodButton: {
    backgroundColor: '#00CDCE',
    borderColor: '#00CDCE',
  },
  periodButtonText: {
    color: '#666',
  },
  activePeriodButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    padding: 12,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  buttonCancel: {
    backgroundColor: '#F0F0F0',
  },
  buttonSave: {
    backgroundColor: '#00CDCE',
  },
  buttonCancelText: {
    color: '#666',
    fontWeight: 'bold',
  },
  buttonSaveText: {
    color: 'white',
    fontWeight: 'bold',
  },
  reminderModalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  reminderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  reminderContent: {
    alignItems: 'center',
    marginBottom: 20,
  },
  reminderMedName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  reminderDetails: {
    fontSize: 16,
    color: '#666',
  },
  reminderButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reminderButton: {
    padding: 12,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  buttonLater: {
    backgroundColor: '#F0F0F0',
  },
  buttonTaken: {
    backgroundColor: '#00CDCE',
  },
  buttonLaterText: {
    color: '#666',
    fontWeight: 'bold',
  },
  buttonTakenText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default CustomMedicationReminder;