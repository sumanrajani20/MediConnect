import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Alert,
  TextInput,
  StyleSheet,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Card } from 'react-native-paper';
import { saveBloodPressureReading } from '../../services/VitalSignsService';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import DateTimePicker from '@react-native-community/datetimepicker';

// Constants
const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 3;
const generatePickerValues = (min, max) => {
  const values = [];
  for (let i = min; i <= max; i++) {
    values.push(i.toString());
  }
  return values;
};
const VALIDATION_RANGES = {
  systolic: { min: 90, max: 200 },
  diastolic: { min: 40, max: 130 },
  pulse: { min: 40, max: 200 }
};

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
  
  useEffect(() => {
    const index = items.findIndex(item => item === selectedValue);
    if (index !== -1) {
      setSelectedIndex(index);
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: index * ITEM_HEIGHT,
          animated: false,
        });
      }, 50);
    }
  }, [items, selectedValue]);

  const handleScrollEnd = (event) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
    
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
        <View style={pickerStyles.topFade} />
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
              <Text style={[
                pickerStyles.item,
                itemStyle,
                index === selectedIndex && [pickerStyles.selectedItem, selectedItemStyle]
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={pickerStyles.bottomFade} />
      </View>
    </View>
  );
};

const BloodPressureScreen = ({ navigation }) => {
  const [bpData, setBpData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // Track the item being edited
  const [systolic, setSystolic] = useState('120');
  const [diastolic, setDiastolic] = useState('80');
  const [pulse, setPulse] = useState('70');
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [bpClassification, setBpClassification] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const systolicValues = generatePickerValues(VALIDATION_RANGES.systolic.min, VALIDATION_RANGES.systolic.max);
  const diastolicValues = generatePickerValues(VALIDATION_RANGES.diastolic.min, VALIDATION_RANGES.diastolic.max);
  const pulseValues = generatePickerValues(VALIDATION_RANGES.pulse.min, VALIDATION_RANGES.pulse.max);
  
  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Function to format the time as HH:MM AM/PM
  const formatTime = (date) => {
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
  };

  const fetchBloodPressure = async () => {
    try {
      const userId = auth().currentUser?.uid;
      if (!userId) throw new Error('User not signed in');

      const snapshot = await firestore()
        .collection('users')
        .doc(userId)
        .collection('vitalSigns')
        .where('type', '==', 'blood_pressure')
        .get();

      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setBpData(data);
    } catch (error) {
      console.error('Error getting blood pressure data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBloodPressure();
  }, []);

  const saveReading = async () => {
    try {
      setIsSubmitting(true);
      const user = auth().currentUser;
      if (!user) throw new Error('Please sign in to save readings');

      const reading = {
        systolic: parseInt(systolic),
        diastolic: parseInt(diastolic),
        pulse: parseInt(pulse),
        date: date.toISOString(),
        notes: notes.trim(),
        classification: bpClassification,
        userId: user.uid,
      };

      if (editingItem) {
        // Update existing reading
        await firestore()
          .collection('users')
          .doc(user.uid)
          .collection('vitalSigns')
          .doc(editingItem.id)
          .update(reading);
        Alert.alert('Success', 'Reading updated successfully!');
      } else {
        // Add new reading
        await saveBloodPressureReading(reading);
        Alert.alert('Success', 'Reading saved successfully!');
      }

      setIsAdding(false);
      setEditingItem(null); // Clear editing state
      fetchBloodPressure();
    } catch (error) {
      console.error('Save Error:', error);
      Alert.alert('Error', error.message || 'Failed to save. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteReading = async (id) => {
    try {
      const user = auth().currentUser;
      if (!user) throw new Error('Please sign in to delete readings');

      await firestore()
        .collection('users')
        .doc(user.uid)
        .collection('vitalSigns')
        .doc(id)
        .delete();

      Alert.alert('Success', 'Reading deleted successfully!');
      fetchBloodPressure();
    } catch (error) {
      console.error('Delete Error:', error);
      Alert.alert('Error', error.message || 'Failed to delete. Please try again.');
    }
  };

  const editReading = (item) => {
    setEditingItem(item);
    setSystolic(item.systolic.toString());
    setDiastolic(item.diastolic.toString());
    setPulse(item.pulse.toString());
    setDate(new Date(item.date));
    setNotes(item.notes || '');
    setBpClassification(item.classification || '');
    setIsAdding(true);
  };

  const renderItem = ({ item }) => (
    <Card style={{ margin: 10 }}>
      <Card.Content>
        <Text variant="titleMedium">🩺 Blood Pressure</Text>
        <Text>Systolic: {item.systolic} mmHg</Text>
        <Text>Diastolic: {item.diastolic} mmHg</Text>
        <Text>Pulse: {item.pulse} bpm</Text>
        <Text>
          Time: {item.timestamp?.toDate().toLocaleString() || 'Unknown'}
        </Text>
      </Card.Content>
      <Card.Actions style={{ justifyContent: 'flex-end' }}>
        {/* Edit Button */}
        <TouchableOpacity
          onPress={() => editReading(item)}
          style={{ marginHorizontal: 10 }}
        >
          <FontAwesome name="edit" size={20} color="#4CAF50" />
        </TouchableOpacity>
  
        {/* Delete Button */}
        <TouchableOpacity
          onPress={() => deleteReading(item.id)}
          style={{ marginHorizontal: 10 }}
        >
          <FontAwesome name="trash" size={20} color="#F44336" />
        </TouchableOpacity>
      </Card.Actions>
    </Card>
  );

  if (loading) {
    return <ActivityIndicator animating={true} style={{ marginTop: 50 }} />;
  }

  if (isAdding) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar backgroundColor="#00C2D4" barStyle="light-content" />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setIsAdding(false);
              setEditingItem(null); // Clear editing state
            }}
            disabled={isSubmitting}
          >
            <FontAwesome name="chevron-left" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Blood Pressure</Text>
          
          {/* Updated SAVE button with pill design */}
          <TouchableOpacity
            style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
            onPress={saveReading}
            disabled={isSubmitting}
          >
            <Text style={styles.saveButtonText}>
              {isSubmitting ? 'Saving...' : 'SAVE'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.container}>
          {/* Add/Edit Form */}
          <View style={styles.readingsCard}>
            <View style={styles.readingsHeader}>
              <Text style={styles.readingLabel}>Systolic</Text>
              <Text style={styles.readingLabel}>Diastolic</Text>
              <Text style={styles.readingLabel}>Pulse</Text>
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

          <View style={styles.notesCard}>
            <Text style={styles.notesLabel}>Notes</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add notes here..."
              multiline
            />
          </View>
          
          {showDatePicker && (
            <DateTimePicker
              testID="datePicker"
              value={date}
              mode="date"
              is24Hour={true}
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setDate(selectedDate);
                }
              }}
            />
          )}
          
          {showTimePicker && (
            <DateTimePicker
              testID="timePicker"
              value={date}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={(event, selectedDate) => {
                setShowTimePicker(false);
                if (selectedDate) {
                  setDate(selectedDate);
                }
              }}
            />
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#00C2D4" barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <FontAwesome name="chevron-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Blood Pressure</Text>
        
        {/* Updated ADD button with pill design */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsAdding(true)}
        >
          <Text style={styles.addButtonText}>ADD</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={bpData}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyList}>
            <Text style={styles.emptyText}>No blood pressure records found.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

// Styles for the ScrollPicker component
const pickerStyles = StyleSheet.create({
  container: {
    height: 120,
    width: '100%',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  pickerContainer: {
    height: 120,
    overflow: 'hidden',
    position: 'relative',
  },
  itemContainer: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  item: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  selectedItem: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  selectionIndicator: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    marginTop: -ITEM_HEIGHT / 2,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    zIndex: 1,
  },
  topFade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.8)',
    zIndex: 2,
  },
  bottomFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.8)',
    zIndex: 2,
  },
});

// Styles for the main component
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    padding: 15,
  },
  // New header styles to match Glucose Level screen
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#00C2D4', // Turquoise header
    height: 56,
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: 8,
    width: 40,
  },
  // New pill-shaped ADD button style to match Glucose Level
  addButton: {
    backgroundColor: '#FF7B7B', // Pink/coral color
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20, // Pill shape
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  // New pill-shaped SAVE button style to match Glucose Level
  saveButton: {
    backgroundColor: '#FF7B7B', // Pink/coral color
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20, // Pill shape
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  listContainer: {
    padding: 10,
  },
  emptyList: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  },
  readingsCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  readingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  readingLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  currentReading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  readingInputContainer: {
    flex: 1,
    alignItems: 'center',
  },
  classificationContainer: {
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  classificationLabel: {
    fontSize: 16,
    marginRight: 8,
    color: '#555',
  },
  classificationValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#888',
  },
  highBP: {
    color: '#e53935',
  },
  normalBP: {
    color: '#43a047',
  },
  elevatedBP: {
    color: '#fb8c00',
  },
  crisisBP: {
    color: '#d32f2f',
  },
  dateTimeCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateTimeColumn: {
    flex: 1,
    paddingHorizontal: 5,
  },
  dateTimeLabel: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold',
    color: '#555',
  },
  dateTimeButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#f9f9f9',
  },
  dateTimeValue: {
    fontSize: 14,
    color: '#333',
  },
  notesCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  notesLabel: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold',
    color: '#555',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 10,
    minHeight: 80,
    textAlignVertical: 'top',
  },
});

export default BloodPressureScreen;