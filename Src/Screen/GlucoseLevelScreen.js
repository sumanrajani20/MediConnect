import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  Modal,
  Image,
  SafeAreaView,
  FlatList,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const GlucoseLevelScreen = ({ navigation }) => {
  const [glucoseData, setGlucoseData] = useState([]);
  const [isAdding, setIsAdding] = useState(false); // Toggle between list and form
  const [glucoseLevel, setGlucoseLevel] = useState('0');
  const [measurementType, setMeasurementType] = useState('Fasting'); // Default to Fasting
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [unit, setUnit] = useState('mg/dL');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  // Add these new state variables
  const [isEditing, setIsEditing] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);

  const fetchGlucoseData = async () => {
    try {
      const userId = auth().currentUser?.uid;
      if (!userId) throw new Error('User not signed in');

      const snapshot = await firestore()
        .collection('users')
        .doc(userId)
        .collection('bloodGlucose')
        .where('type', '==', 'blood_glucose')
        .get();

      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setGlucoseData(data);
    } catch (error) {
      console.error('Error getting glucose data:', error);
    }
  };

  useEffect(() => {
    fetchGlucoseData();
  }, []);

  // Add this reset form function
  const resetForm = () => {
    setGlucoseLevel('0');
    setMeasurementType('Fasting');
    setDate(new Date());
    setTime(new Date());
    setNotes('');
    setIsEditing(false);
    setEditingItemId(null);
  };

  const saveReading = async () => {
    try {
      const user = auth().currentUser;
      if (!user) throw new Error('Please sign in to save readings');

      const reading = {
        glucoseLevel: parseFloat(glucoseLevel),
        measurementType,
        date: date.toISOString(),
        time: time.toISOString(),
        notes: notes.trim(),
        type: 'blood_glucose',
        userId: user.uid,
      };

      if (isEditing && editingItemId) {
        // Update existing reading
        await firestore()
          .collection('users')
          .doc(user.uid)
          .collection('bloodGlucose')
          .doc(editingItemId)
          .update(reading);

        Alert.alert('Success', 'Glucose reading updated successfully!');
      } else {
        // Add new reading
        await firestore()
          .collection('users')
          .doc(user.uid)
          .collection('bloodGlucose')
          .add(reading);

        Alert.alert('Success', 'Glucose reading saved successfully!');
      }

      setIsAdding(false); // Return to list view
      resetForm(); // Reset the form for next use
      fetchGlucoseData(); // Refresh the list
    } catch (error) {
      console.error('Save Error:', error);
      Alert.alert('Error', error.message || 'Failed to save. Please try again.');
    }
  };

  const handleEdit = (item) => {
    // Set form to edit mode with item data
    setGlucoseLevel(item.glucoseLevel.toString());
    setMeasurementType(item.measurementType);
    setDate(new Date(item.date));
    setTime(new Date(item.time));
    setNotes(item.notes || '');
    setIsEditing(true);
    setEditingItemId(item.id);
    setIsAdding(true); // Show the form
  };

  const handleDelete = (itemId) => {
    Alert.alert(
      'Delete Reading',
      'Are you sure you want to delete this glucose reading?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const user = auth().currentUser;
              if (!user) throw new Error('Please sign in to delete readings');

              await firestore()
                .collection('users')
                .doc(user.uid)
                .collection('bloodGlucose')
                .doc(itemId)
                .delete();

              Alert.alert('Success', 'Reading deleted successfully!');
              fetchGlucoseData(); // Refresh the list
            } catch (error) {
              console.error('Delete Error:', error);
              Alert.alert('Error', error.message || 'Failed to delete. Please try again.');
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>🩸 Glucose Level</Text>
      <Text style={styles.cardText}>Level: {item.glucoseLevel} {unit}</Text>
      <Text style={styles.cardText}>Type: {item.measurementType}</Text>
      <Text style={styles.cardText}>
        Date: {item.date ? new Date(item.date).toLocaleDateString() : 'Unknown'}
      </Text>
      <Text style={styles.cardText}>
        Time: {item.time ? new Date(item.time).toLocaleTimeString() : 'Unknown'}
      </Text>
      <Text style={styles.cardText}>Notes: {item.notes || 'None'}</Text>
      
      {/* Action buttons at the bottom right */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          onPress={() => handleEdit(item)}
          style={styles.actionButton}
        >
          <FontAwesome name="edit" size={20} color="#4CAF50" />
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => handleDelete(item.id)}
          style={styles.actionButton}
        >
          <FontAwesome name="trash" size={20} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );
   
  if (isAdding) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => {
              setIsAdding(false);
              resetForm();
            }}
          >
            <Image
              source={require('../../assets/custom-arrow.png')}
              style={styles.backArrowImage}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Edit Glucose' : 'Blood Glucose'}
          </Text>
          <TouchableOpacity style={styles.saveButton} onPress={saveReading}>
            <Text style={styles.saveButtonText}>
              {isEditing ? 'UPDATE' : 'SAVE'}
            </Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.contentContainer}>
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
                onPress={() => setUnit(unit === 'mg/dL' ? 'mmol/L' : 'mg/dL')}
              >
                <Text style={styles.unitText}>{unit} ▼</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Type*</Text>
            <View style={styles.radioGroupContainer}>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setMeasurementType('Fasting')}
              >
                <View style={[
                  styles.radioCircle,
                  measurementType === 'Fasting' && styles.radioCircleSelected,
                ]}>
                  {measurementType === 'Fasting' && <View style={styles.radioIndicator} />}
                </View>
                <Text style={styles.radioText}>Fasting</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setMeasurementType('PostPrandial')}
              >
                <View style={[
                  styles.radioCircle,
                  measurementType === 'PostPrandial' && styles.radioCircleSelected,
                ]}>
                  {measurementType === 'PostPrandial' && <View style={styles.radioIndicator} />}
                </View>
                <Text style={styles.radioText}>PostPrandial</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setMeasurementType('Random')}
              >
                <View style={[
                  styles.radioCircle,
                  measurementType === 'Random' && styles.radioCircleSelected,
                ]}>
                  {measurementType === 'Random' && <View style={styles.radioIndicator} />}
                </View>
                <Text style={styles.radioText}>Random</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.dateTimeContainer}>
            <View style={styles.dateTimeColumn}>
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity
                style={styles.dateTimeSelector}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateTimeText}>
                  {date.toLocaleDateString('en-GB')}
                </Text>
              </TouchableOpacity>
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
            </View>
            <View style={styles.dateTimeColumn}>
              <Text style={styles.label}>Time</Text>
              <TouchableOpacity
                style={styles.dateTimeSelector}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.dateTimeText}>
                  {time.toLocaleTimeString('en-GB')}
                </Text>
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={time}
                  mode="time"
                  display="default"
                  onChange={(event, selectedTime) => {
                    setShowTimePicker(false);
                    if (selectedTime) setTime(selectedTime);
                  }}
                />
              )}
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              multiline
              placeholder="Add notes here..."
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image
            source={require('../../assets/custom-arrow.png')}
            style={styles.backArrowImage}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Glucose Levels</Text>
        <TouchableOpacity style={styles.saveButton} onPress={() => setIsAdding(true)}>
          <Text style={styles.saveButtonText}>ADD</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={glucoseData}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyList}>
            <Text style={styles.emptyText}>No glucose records found.</Text>
          </View>
        }
      />
    </SafeAreaView>
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
  listContainer: {
    padding: 15,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15, // Add space between records
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  cardText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 3,
  },
  emptyList: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
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
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
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
  notesInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    height: 100,
    textAlignVertical: 'top',
    padding: 10,
  },
  radioText: {
    fontSize: 14,
    color: '#555',
  },
  // Add these new styles
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

export default GlucoseLevelScreen