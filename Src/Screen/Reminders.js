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
// If you're using Firebase, import it properly
// import { getApp } from 'firebase/app';

// Safe toString helper
const safeToString = (value) => {
  if (value === undefined || value === null) {
    return '';
  }
  return value.toString();
};

// Custom arrow component
const CustomArrow = () => {
  return (
    <View style={styles.arrowContainer}>
      <View style={styles.arrowLine} />
      <View style={styles.arrowHead} />
    </View>
  );
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
            <CustomArrow />
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

  // Test function to show reminder notification
  const testReminderNotification = () => {
    // Find a non-taken medication
    const testMed = medications.find(med => !med.taken) || (medications.length > 0 ? medications[0] : null);
    
    if (testMed) {
      setDueMedication(testMed);
      setReminderModalVisible(true);
      return;
    }
    
    Alert.alert('No medications', 'No medications found to test reminder');
  };

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
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => Alert.alert('Back', 'Navigating back')}
        >
          <CustomArrow />
        </TouchableOpacity>
        <Text style={styles.headerText}>Medication Reminders</Text>
        <View style={styles.headerRightSpace} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Render header based on navigation context */}
      {renderHeader()}

      <ScrollView style={styles.scrollView}>
        {/* Time and Progress Display */}
        <TimeDisplay />
        <ProgressDisplay total={totalMeds} taken={takenMeds} />
        
        {/* Medication Sections */}
        {renderSection('Morning', morningMeds, styles.morningIcon)}
        {renderSection('Afternoon', afternoonMeds, styles.afternoonIcon)}
        {renderSection('Evening', eveningMeds, styles.eveningIcon)}
        
        {/* Empty state */}
        {(!medications || medications.length === 0) && !isLoading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No medications scheduled for today</Text>
            <Text style={styles.emptyStateSubtext}>Tap the "Add Medication" button to add your medications</Text>
          </View>
        )}
        
        {/* Extra space at bottom for floating button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Test Reminder Button */}
      <TouchableOpacity 
        style={styles.testButton}
        onPress={testReminderNotification}
      >
        <Text style={styles.testButtonText}>Test Reminder</Text>
      </TouchableOpacity>

      {/* Add Button */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+ Add Medication</Text>
      </TouchableOpacity>
      
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
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Medication</Text>
            </View>
            
            <View style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Medication Name</Text>
                <TextInput
                  style={styles.formInput}
                  value={medicationName}
                  onChangeText={setMedicationName}
                  placeholder="e.g., Aspirin"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Dosage</Text>
                <TextInput
                  style={styles.formInput}
                  value={medicationDosage}
                  onChangeText={setMedicationDosage}
                  placeholder="e.g., 81mg"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Time</Text>
                <TextInput
                  style={styles.formInput}
                  value={medicationTime}
                  onChangeText={handleTimeChange}
                  placeholder="HH:MM"
                  keyboardType="numbers-and-punctuation"
                />
                <Text style={styles.timeHint}>Use 24-hour format (e.g., 13:00 for 1:00 PM)</Text>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Period</Text>
                <View style={styles.periodContainer}>
                  <TouchableOpacity
                    style={[
                      styles.periodOption,
                      medicationPeriod === 'Morning' && styles.periodOptionSelected
                    ]}
                    onPress={() => setMedicationPeriod('Morning')}
                  >
                    <View style={styles.morningIcon}></View>
                    <Text style={styles.periodText}>Morning</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.periodOption,
                      medicationPeriod === 'Afternoon' && styles.periodOptionSelected
                    ]}
                    onPress={() => setMedicationPeriod('Afternoon')}
                  >
                    <View style={styles.afternoonIcon}></View>
                    <Text style={styles.periodText}>Afternoon</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.periodOption,
                      medicationPeriod === 'Evening' && styles.periodOptionSelected
                    ]}
                    onPress={() => setMedicationPeriod('Evening')}
                  >
                    <View style={styles.eveningIcon}></View>
                    <Text style={styles.periodText}>Evening</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setModalVisible(false);
                    resetForm();
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={addMedication}
                >
                  <Text style={styles.submitButtonText}>Add Medication</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Reminder Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={reminderModalVisible}
        onRequestClose={() => {
          setReminderModalVisible(false);
        }}
      >
        <View style={styles.reminderModalContainer}>
          <View style={styles.reminderModalContent}>
            <View style={styles.reminderIcon}>
              <Text style={styles.reminderIconText}>⏰</Text>
            </View>
            <Text style={styles.reminderTitle}>Medication Due</Text>
            {dueMedication && (
              <Text style={styles.reminderText}>
                It's time to take {dueMedication.name || 'your medication'} ({dueMedication.dosage || ''})
              </Text>
            )}
            <View style={styles.reminderActions}>
              <TouchableOpacity
                style={styles.reminderButton}
                onPress={() => {
                  if (dueMedication) {
                    toggleTaken(dueMedication.id);
                  }
                  setReminderModalVisible(false);
                }}
              >
                <Text style={styles.reminderButtonText}>Mark as Taken</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.reminderCancelButton}
                onPress={() => {
                  setReminderModalVisible(false);
                }}
              >
                <Text style={styles.reminderCancelText}>Remind me later</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Time Display Component
const TimeDisplay = () => {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  
  // Format time (12-hour format) 
  const formatTime = (date) => {
    try {
      let hours = date.getHours();
      let minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 should be 12
      minutes = minutes < 10 ? '0'+minutes : minutes;
      return `${hours}:${minutes} ${ampm}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return '--:-- --';
    }
  };
  
  // Format date
  const formatDate = (date) => {
    try {
      const options = { weekday: 'short', month: 'short', day: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return '----, --- --';
    }
  };
  
  // Update time and date
  const updateDateTime = () => {
    const now = new Date();
    setCurrentTime(formatTime(now));
    setCurrentDate(formatDate(now));
  };
  
  useEffect(() => {
    updateDateTime();
    const interval = setInterval(updateDateTime, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);
  
  return (
    <View style={styles.timeContainer}>
      <View>
        <Text style={styles.timeLabel}>Current Time</Text>
        <Text style={styles.timeValue}>{currentTime}</Text>
      </View>
      <View>
        <Text style={styles.timeLabel}>Current Date</Text>
        <Text style={styles.dateValue}>{currentDate}</Text>
      </View>
    </View>
  );
};

// Progress display component
const ProgressDisplay = ({ total, taken }) => {
  const percentage = total > 0 ? Math.round((taken / total) * 100) : 0;
  
  return (
    <View style={styles.progressContainer}>
      <Text style={styles.progressTitle}>Today's Progress</Text>
      <View style={styles.progressContent}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>{taken}/{total} medications taken</Text>
          <Text style={styles.progressPercentage}>{percentage}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressBarFill, 
              { width: `${percentage}%` }
            ]} 
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    backgroundColor: '#00C2D4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    elevation: 0,
  },
  headerLeft: {
    paddingLeft: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Custom arrow elements
  arrowContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
  },
  arrowLine: {
    width: 15,
    height: 2,
    backgroundColor: 'white',
    position: 'absolute',
    left: 0,
  },
  arrowHead: {
    width: 12,
    height: 12,
    borderWidth: 2,
    borderColor: 'white',
    borderRightWidth: 0,
    borderBottomWidth: 0,
    transform: [{ rotate: '-45deg' }],
    position: 'absolute',
    left: 0,
  },
  headerText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerRightSpace: {
    width: 40,
  },
  
  // Time display styles
  timeContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
  },
  timeValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  dateValue: {
    fontSize: 18,
    color: '#333',
  },
  
  // Progress display styles
  progressContainer: {
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  progressContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  
  // Section styles
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginRight: 8,
  },
  morningIcon: {
    backgroundColor: '#FFB74D', // Orange/amber for morning
  },
  afternoonIcon: {
    backgroundColor: '#FF7043', // Deep orange for afternoon
  },
  eveningIcon: {
    backgroundColor: '#5C6BC0', // Indigo for evening
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  
  // Medication item styles
  medicationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginRight: 8,
  },
  medicationDetails: {
    color: '#666',
    marginTop: 4,
  },
  
  // Status badge styles
  statusBadgeUpcoming: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusBadgeTaken: {
    backgroundColor: '#C8E6C9', // Light green
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusBadgeDue: {
    backgroundColor: '#FFECB3', // Light amber
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusBadgeDueSoon: {
    backgroundColor: '#FFECB3', // Light amber
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusBadgeOverdue: {
    backgroundColor: '#FFCDD2', // Light red
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontSize: 12,
    color: '#333',
  },
  
  // Checkbox styles
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkboxOverdue: {
    borderColor: '#F44336',
    transform: [{ scale: 1.1 }],
  },
  checkmark: {
    color: 'white',
    fontWeight: 'bold',
  },
  
  // Empty state
  emptyState: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  
  // Add Button
  addButton: {
    backgroundColor: '#FF7B7B',
    padding: 15,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 25,
    alignItems: 'center',
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  
  // Test Button
  testButton: {
    backgroundColor: '#7B7BFF',
    padding: 10,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 25,
    alignItems: 'center',
    position: 'absolute',
    bottom: 80,
    right: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  testButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    backgroundColor: '#00C2D4',
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  modalBody: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: '#333',
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
  },
  timeHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  periodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  periodOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 10,
    marginHorizontal: 2,
  },
  periodOptionSelected: {
    borderColor: '#00C2D4',
    backgroundColor: 'rgba(0, 194, 212, 0.1)',
  },
  periodText: {
    marginLeft: 5,
    fontSize: 14,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#00C2D4',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Reminder modal styles
  reminderModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  reminderModalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  reminderIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFECB3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  reminderIconText: {
    fontSize: 30,
  },
  reminderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  reminderText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  reminderActions: {
    width: '100%',
  },
  reminderButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 8,
  },
  reminderButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  reminderCancelButton: {
    padding: 12,
    alignItems: 'center',
  },
  reminderCancelText: {
    color: '#666',
    fontSize: 14,
  },
});

export default CustomMedicationReminder;