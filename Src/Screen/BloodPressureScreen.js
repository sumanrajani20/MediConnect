import React, { useState, useRef, useEffect } from 'react';
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
  ActivityIndicator
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { saveBloodPressureReading } from './firebase/bloodPressureService';

// Constants for ScrollPicker
const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 3;

// Validation ranges for blood pressure readings
const VALIDATION_RANGES = {
  systolic: { min: 90, max: 200 },
  diastolic: { min: 40, max: 130 },
  pulse: { min: 40, max: 200 }
};

/**
 * Generates an array of numbers for picker values
 */
const generatePickerValues = (min, max) => {
  const values = [];
  for (let i = min; i <= max; i++) {
    values.push(i.toString());
  }
  return values;
};

/**
 * Validates if a value is within the specified range
 */
const isValidReading = (type, value) => {
  const numValue = parseInt(value, 10);
  
  if (isNaN(numValue)) {
    return false;
  }
  
  const range = VALIDATION_RANGES[type];
  if (!range) {
    return false;
  }
  
  return numValue >= range.min && numValue <= range.max;
};

/**
 * Gets a classification for blood pressure reading
 */
const getBPClassification = (systolic, diastolic) => {
  const sys = parseInt(systolic, 10);
  const dia = parseInt(diastolic, 10);
  
  if (sys < 120 && dia < 80) {
    return 'Normal';
  } else if ((sys >= 120 && sys <= 129) && dia < 80) {
    return 'Elevated';
  } else if ((sys >= 130 && sys <= 139) || (dia >= 80 && dia <= 89)) {
    return 'High BP (Stage 1)';
  } else if (sys >= 140 || dia >= 90) {
    return 'High BP (Stage 2)';
  } else if (sys > 180 || dia > 120) {
    return 'Hypertensive Crisis';
  }
  
  return 'Unknown';
};

/**
 * Custom ScrollPicker component for value selection
 */
const ScrollPicker = ({
  items,
  selectedValue,
  onValueChange,
  label,
  containerStyle,
  itemStyle,
  selectedItemStyle
}) => {
  const scrollViewRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Find index of selected value on mount and when items change
  useEffect(() => {
    const index = items.findIndex(item => item === selectedValue);
    if (index !== -1) {
      setSelectedIndex(index);
      // Scroll to selected index
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: index * ITEM_HEIGHT,
          animated: false,
        });
      }, 50);
    }
  }, [items, selectedValue]);

  // Handle scroll end to snap to the closest item
  const handleScrollEnd = (event) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
    
    // Snap to the item
    scrollViewRef.current?.scrollTo({
      y: clampedIndex * ITEM_HEIGHT,
      animated: true,
    });
    
    setSelectedIndex(clampedIndex);
    onValueChange(items[clampedIndex]);
  };

  return (
    <View style={[pickerStyles.container, containerStyle]}>
      {label && <Text style={pickerStyles.label}>{label}</Text>}
      
      <View style={pickerStyles.pickerContainer}>
        {/* Top fade gradient */}
        <View style={pickerStyles.topFade} />
        
        {/* Middle selector indicator */}
        <View style={pickerStyles.selectionIndicator} />
        
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          onMomentumScrollEnd={handleScrollEnd}
          contentContainerStyle={{
            paddingTop: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
            paddingBottom: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2)
          }}
        >
          {items.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={pickerStyles.itemContainer}
              onPress={() => {
                scrollViewRef.current?.scrollTo({
                  y: index * ITEM_HEIGHT,
                  animated: true,
                });
                setSelectedIndex(index);
                onValueChange(item);
              }}
            >
              <Text
                style={[
                  pickerStyles.item,
                  itemStyle,
                  index === selectedIndex && [pickerStyles.selectedItem, selectedItemStyle]
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* Bottom fade gradient */}
        <View style={pickerStyles.bottomFade} />
      </View>
    </View>
  );
};

const BloodPressureScreen = ({ navigation }) => {
  // State variables for blood pressure readings
  const [systolic, setSystolic] = useState('120');
  const [diastolic, setDiastolic] = useState('80');
  const [pulse, setPulse] = useState('70');
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState('');
  
  // Previous and next readings for context
  const [prevReadings] = useState({ systolic: '115', diastolic: '75', pulse: '68' });
  const [nextReadings] = useState({ systolic: '125', diastolic: '85', pulse: '72' });
  
  // State for date time pickers
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // State for Firebase interaction
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Generate picker values based on validation ranges
  const systolicValues = generatePickerValues(VALIDATION_RANGES.systolic.min, VALIDATION_RANGES.systolic.max);
  const diastolicValues = generatePickerValues(VALIDATION_RANGES.diastolic.min, VALIDATION_RANGES.diastolic.max);
  const pulseValues = generatePickerValues(VALIDATION_RANGES.pulse.min, VALIDATION_RANGES.pulse.max);

  // Classification of blood pressure
  const [bpClassification, setBpClassification] = useState('');

  // Update BP classification when readings change
  useEffect(() => {
    const classification = getBPClassification(systolic, diastolic);
    setBpClassification(classification);
  }, [systolic, diastolic]);

  // Format date for display
  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Format time for display
  const formatTime = (date) => {
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
  };

  // Handle date picker change
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    
    // Preserve time from the current date
    const newDate = new Date(currentDate);
    newDate.setHours(date.getHours(), date.getMinutes());
    setDate(newDate);
  };

  // Handle time picker change
  const onTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || date;
    setShowTimePicker(false);
    setDate(currentTime);
  };

  // Save the blood pressure reading to Firebase
  const saveReading = async () => {
    // Validate all readings
    if (!isValidReading('systolic', systolic)) {
      Alert.alert("Invalid Reading", `Systolic pressure should be between ${VALIDATION_RANGES.systolic.min} and ${VALIDATION_RANGES.systolic.max}`);
      return;
    }
    
    if (!isValidReading('diastolic', diastolic)) {
      Alert.alert("Invalid Reading", `Diastolic pressure should be between ${VALIDATION_RANGES.diastolic.min} and ${VALIDATION_RANGES.diastolic.max}`);
      return;
    }
    
    if (!isValidReading('pulse', pulse)) {
      Alert.alert("Invalid Reading", `Pulse should be between ${VALIDATION_RANGES.pulse.min} and ${VALIDATION_RANGES.pulse.max}`);
      return;
    }

    // Check if systolic is greater than diastolic
    if (parseInt(systolic) <= parseInt(diastolic)) {
      Alert.alert("Invalid Readings", "Systolic pressure should be greater than diastolic pressure");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Create reading object
      const reading = {
        systolic: parseInt(systolic),
        diastolic: parseInt(diastolic),
        pulse: parseInt(pulse),
        date: date,
        notes: notes,
        classification: bpClassification
      };
      
      // Save to Firebase
      await saveBloodPressureReading(reading);
      
      Alert.alert(
        "Reading Saved", 
        `Your blood pressure reading has been successfully saved.`
      );
      
      // Navigate back after saving
      navigation.goBack();
    } catch (error) {
      console.error('Error saving blood pressure reading:', error);
      Alert.alert(
        "Error", 
        "There was an error saving your reading. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#00C2D4" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={isSubmitting}
        >
          <FontAwesome name="chevron-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Blood Pressure</Text>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={saveReading}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.saveButtonText}>SAVE</Text>
          )}
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.container}>
        {/* Blood Pressure Readings */}
        <View style={styles.readingsCard}>
          <View style={styles.readingsHeader}>
            <Text style={styles.readingLabel}>Systolic</Text>
            <Text style={styles.readingLabel}>Diastolic</Text>
            <Text style={styles.readingLabel}>Pulse</Text>
          </View>
          
          <View style={styles.prevReading}>
            <Text style={styles.readingValue}>{prevReadings.systolic}</Text>
            <Text style={styles.readingValue}>{prevReadings.diastolic}</Text>
            <Text style={styles.readingValue}>{prevReadings.pulse}</Text>
          </View>
          
          <View style={styles.currentReading}>
            <View style={styles.readingInputContainer}>
              <ScrollPicker
                items={systolicValues}
                selectedValue={systolic}
                onValueChange={setSystolic}
              />
            </View>
            
            <View style={styles.readingInputContainer}>
              <ScrollPicker
                items={diastolicValues}
                selectedValue={diastolic}
                onValueChange={setDiastolic}
              />
            </View>
            
            <View style={styles.readingInputContainer}>
              <ScrollPicker
                items={pulseValues}
                selectedValue={pulse}
                onValueChange={setPulse}
              />
            </View>
          </View>
          
          <View style={styles.nextReading}>
            <Text style={styles.readingValue}>{nextReadings.systolic}</Text>
            <Text style={styles.readingValue}>{nextReadings.diastolic}</Text>
            <Text style={styles.readingValue}>{nextReadings.pulse}</Text>
          </View>
          
          {/* BP Classification */}
          <View style={styles.classificationContainer}>
            <Text style={styles.classificationLabel}>Classification:</Text>
            <Text style={[
              styles.classificationValue,
              bpClassification.includes('High') && styles.highBP,
              bpClassification === 'Normal' && styles.normalBP,
              bpClassification === 'Elevated' && styles.elevatedBP,
              bpClassification === 'Hypertensive Crisis' && styles.crisisBP
            ]}>
              {bpClassification}
            </Text>
          </View>
        </View>
        
        {/* Date and Time */}
        <View style={styles.dateTimeCard}>
          <View style={styles.dateTimeRow}>
            <View style={styles.dateTimeColumn}>
              <Text style={styles.dateTimeLabel}>Date</Text>
              <TouchableOpacity 
                style={styles.dateTimeButton} 
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateTimeValue}>{formatDate(date)}</Text>
                <FontAwesome name="calendar" size={16} color="#999" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.dateTimeColumn}>
              <Text style={styles.dateTimeLabel}>Time</Text>
              <TouchableOpacity 
                style={styles.dateTimeButton} 
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.dateTimeValue}>{formatTime(date)}</Text>
                <FontAwesome name="clock-o" size={16} color="#999" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Notes */}
        <View style={styles.notesCard}>
          <Text style={styles.notesLabel}>Notes</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            multiline
            placeholder="Add notes here..."
          />
        </View>
        
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
            display="default"
            onChange={onTimeChange}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles for the main component
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
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  readingsCard: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 15,
    padding: 15,
  },
  readingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  readingLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  prevReading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  currentReading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  nextReading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  readingValue: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
  readingInputContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  readingInput: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 5,
    textAlign: 'center',
    width: '80%',
  },
  dateTimeCard: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 15,
    marginTop: 10,
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  dateTimeColumn: {
    flex: 1,
  },
  dateTimeLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dateTimeValue: {
    fontSize: 16,
    color: '#00CDCE',
  },
  notesCard: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 15,
    padding: 15,
    marginTop: 10,
    marginBottom: 30,
  },
  notesLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 8,
  },
  // Classification styles
  classificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingTop: 10,
  },
  classificationLabel: {
    fontSize: 16,
    color: '#555',
    marginRight: 5,
  },
  classificationValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  normalBP: {
    color: '#4CAF50', // Green
  },
  elevatedBP: {
    color: '#FFC107', // Amber
  },
  highBP: {
    color: '#FF9800', // Orange
  },
  crisisBP: {
    color: '#F44336', // Red
  },
});

// Styles for the ScrollPicker component
const pickerStyles = StyleSheet.create({
  container: {
    width: 80,
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  pickerContainer: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    overflow: 'hidden',
    position: 'relative',
  },
  itemContainer: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  item: {
    fontSize: 20,
    color: '#888',
    textAlign: 'center',
  },
  selectedItem: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 26,
  },
  topFade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1,
  },
  bottomFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1,
  },
  selectionIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    top: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    zIndex: 0,
  },
});

export default BloodPressureScreen;