import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  FlatList,
  PermissionsAndroid
} from 'react-native';
import { Button } from 'react-native-paper';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
const MedicalHistory = ({ navigation }) => {
  // State management
  const [prescriptions, setPrescriptions] = useState([]);
  const [doctorVisits, setDoctorVisits] = useState([]);
  const [isPrescriptionModalVisible, setIsPrescriptionModalVisible] = useState(false);
  const [isDoctorVisitModalVisible, setIsDoctorVisitModalVisible] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [prescriptionNote, setPrescriptionNote] = useState('');
  const [processing, setProcessing] = useState(false);
  const [serverStatus, setServerStatus] = useState('');

  // Doctor visit states
  const [doctorName, setDoctorName] = useState('');
  const [visitDate, setVisitDate] = useState(new Date());
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  // API configuration
  const API_URL = 'http://10.102.128.137:8000'; // Your backend URL

  // Navigation setup
  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'Medical Record',
      headerTitleAlign: 'center',
      headerStyle: { backgroundColor: '#00C2D4', elevation: 0 },
      headerTintColor: '#fff',
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerLeft}>
          <Image source={require('../../assets/custom-arrow.png')} style={styles.arrowIcon} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // Permission handling
  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA, {
            title: "Camera Permission",
            message: "App needs access to your camera",
            buttonPositive: "OK"
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE, {
            title: "Storage Permission",
            message: "App needs access to your photos",
            buttonPositive: "OK"
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  // Prescription processing
  const processPrescriptionImage = async (imageUri) => {
    try {
      setProcessing(true);
      setServerStatus('Processing prescription...');
      
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        name: 'prescription.jpg',
        type: 'image/jpeg'
      });

      setServerStatus('Sending to server...');
      const response = await axios.post(`${API_URL}/process-prescription`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000
      });

      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Processing failed');
      }

      setServerStatus('Processing complete!');
      return response.data.medicines;
    } catch (error) {
      console.error('API Error:', error);
      setServerStatus('Error: ' + (error.message || 'Failed to process'));
      throw error;
    } finally {
      setProcessing(false);
    }
  };
  const fetchUserData = async () => {
    try {
      const userId = auth().currentUser?.uid;
      if (!userId) throw new Error('User not signed in');
  
      // Fetch prescriptions
      const prescriptionsSnapshot = await firestore()
        .collection('users')
        .doc(userId)
        .collection('prescriptions')
        .get();
  
      const fetchedPrescriptions = prescriptionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      // Fetch doctor visits
      const doctorVisitsSnapshot = await firestore()
        .collection('users')
        .doc(userId)
        .collection('doctorVisits')
        .get();
  
      const fetchedDoctorVisits = doctorVisitsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      // Update state
      setPrescriptions(fetchedPrescriptions);
      setDoctorVisits(fetchedDoctorVisits);
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', error.message || 'Failed to fetch data');
    }
  };
  useEffect(() => {
    fetchUserData();
  }, []);
  // Image selection handler
  const handleImageSelection = async (useCamera) => {
    try {
      const options = {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
        saveToPhotos: useCamera,
      };
  
      const response = useCamera 
        ? await launchCamera(options)
        : await launchImageLibrary(options);
  
      if (response.didCancel) return;
      if (response.errorCode) throw new Error(response.errorMessage || 'Image error');
  
      const asset = response.assets?.[0];
      if (!asset?.uri) throw new Error('No image selected');
  
      const medicines = await processPrescriptionImage(asset.uri);
  
      const newPrescription = {
        id: Date.now().toString(),
        uri: asset.uri,
        name: asset.fileName || `Prescription_${Date.now()}`,
        date: new Date().toLocaleDateString(),
        notes: '',
        medicines: medicines,
      };
  
      // Save to Firestore
      const userId = auth().currentUser?.uid;
      if (!userId) throw new Error('User not signed in');
  
      await firestore()
        .collection('users')
        .doc(userId)
        .collection('prescriptions')
        .doc(newPrescription.id)
        .set(newPrescription);
  
      setPrescriptions(prev => [...prev, newPrescription]);
      setSelectedPrescription(newPrescription);
      setIsPrescriptionModalVisible(true);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to process prescription');
    }
  };

  // Add prescription handler
  const handleAddPrescription = () => {
    Alert.alert(
      'Add Prescription',
      'Choose a source',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Camera',
          onPress: async () => {
            const hasPermission = await requestCameraPermission();
            hasPermission 
              ? handleImageSelection(true)
              : Alert.alert('Permission required', 'Camera access is needed');
          },
        },
        {
          text: 'Gallery',
          onPress: async () => {
            const hasPermission = await requestStoragePermission();
            hasPermission 
              ? handleImageSelection(false)
              : Alert.alert('Permission required', 'Storage access is needed');
          },
        },
      ]
    );
  };

  // Save prescription notes
  const savePrescriptionNote = () => {
    if (selectedPrescription) {
      setPrescriptions(prev =>
        prev.map(p => 
          p.id === selectedPrescription.id 
            ? { ...p, notes: prescriptionNote } 
            : p
        )
      );
      setIsPrescriptionModalVisible(false);
    }
  };

  // Doctor visit handlers (keep your existing implementations)
  const handleAddDoctorVisit = () => {
    setDoctorName('');
    setVisitDate(new Date());
    setDiagnosis('');
    setNotes('');
    setIsDoctorVisitModalVisible(true);
  };

  const saveDoctorVisit = async () => {
    if (!doctorName.trim()) {
      Alert.alert('Error', "Please enter doctor's name");
      return;
    }

    const newVisit = {
      id: Date.now().toString(),
      doctorName,
      visitDate: visitDate.toLocaleDateString(),
      diagnosis,
      notes,
    };

    try {
      const userId = auth().currentUser?.uid;
      if (!userId) throw new Error('User not signed in');

      // Save to Firestore
      await firestore()
        .collection('users')
        .doc(userId)
        .collection('doctorVisits')
        .doc(newVisit.id)
        .set(newVisit);

      setDoctorVisits(prev => [...prev, newVisit]);
      setIsDoctorVisitModalVisible(false);
      Alert.alert('Success', 'Doctor visit saved successfully!');
    } catch (error) {
      console.error('Error saving doctor visit:', error);
      Alert.alert('Error', error.message || 'Failed to save doctor visit');
    }
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || visitDate;
    setShowDatePicker(Platform.OS === 'ios');
    setVisitDate(currentDate);
  };

  // Render methods
  const renderPrescriptionItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.recordItem}
      onPress={() => {
        setSelectedPrescription(item);
        setPrescriptionNote(item.notes);
        setIsPrescriptionModalVisible(true);
      }}
    >
      <Image source={{ uri: item.uri }} style={styles.prescriptionImage} />
      <View style={styles.recordDetails}>
        <Text style={styles.recordName}>{item.name}</Text>
        <Text style={styles.recordDate}>{item.date}</Text>
        {item.medicines?.length > 0 && (
          <Text style={styles.recordSubtitle}>
            {item.medicines.length} medicine{item.medicines.length !== 1 ? 's' : ''} detected
          </Text>
        )}
        {item.notes ? (
          <Text style={styles.recordNotes}>{item.notes}</Text>
        ) : (
          <Text style={styles.noNotes}>No notes added</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderVisitItem = ({ item }) => (
    <TouchableOpacity style={styles.recordItem}>
      <View style={styles.visitIconContainer}>
        <Text style={styles.visitIconText}>Dr</Text>
      </View>
      <View style={styles.recordDetails}>
        <Text style={styles.recordName}>Dr. {item.doctorName}</Text>
        <Text style={styles.recordDate}>{item.visitDate}</Text>
        <Text style={styles.recordSubtitle}>{item.diagnosis || 'No diagnosis'}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Image source={require('../../assets/medical-icon.png')} style={styles.icon} />
      <Text style={styles.message}>You Have Not Added Any Medical Records Yet</Text>
      <View style={styles.cardContainer}>
        <TouchableOpacity style={styles.card} onPress={handleAddPrescription}>
          <Image source={require('../../assets/medical-icon.png')} style={styles.cardIcon} />
          <Text style={styles.cardTitle}>Prescriptions</Text>
          <Text style={styles.cardDescription}>Upload and track your prescriptions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={handleAddDoctorVisit}>
          <Image source={require('../../assets/medical-icon.png')} style={styles.cardIcon} />
          <Text style={styles.cardTitle}>Doctor Visits</Text>
          <Text style={styles.cardDescription}>Log your doctor appointments</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRecords = () => (
    <ScrollView style={styles.scrollContainer}>
      {prescriptions.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Prescriptions</Text>
            <TouchableOpacity onPress={handleAddPrescription}>
              <Text style={styles.addText}>+ Add</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={prescriptions}
            renderItem={renderPrescriptionItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        </View>
      )}
      {doctorVisits.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Doctor Visits</Text>
            <TouchableOpacity onPress={handleAddDoctorVisit}>
              <Text style={styles.addText}>+ Add</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={doctorVisits}
            renderItem={renderVisitItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        </View>
      )}
    </ScrollView>
  );

  const renderPrescriptionModal = () => (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Prescription Details</Text>
        
        <Image source={{ uri: selectedPrescription?.uri }} style={styles.modalImagePreview} />
        
        {selectedPrescription?.medicines?.length > 0 ? (
          <View style={styles.medicinesContainer}>
            <Text style={styles.medicinesTitle}>Detected Medicines:</Text>
            {selectedPrescription.medicines.map((med, i) => (
              <Text key={i} style={styles.medicineText}>• {med}</Text>
            ))}
          </View>
        ) : (
          <Text style={styles.noMedicinesText}>No medicines detected</Text>
        )}
        
        <Text style={styles.inputLabel}>Notes</Text>
        <TextInput
          style={styles.modalInput}
          multiline
          placeholder="Add notes about this prescription..."
          value={prescriptionNote}
          onChangeText={setPrescriptionNote}
        />
        
        <View style={styles.modalButtons}>
          <Button mode="outlined" onPress={() => setIsPrescriptionModalVisible(false)}>
            Cancel
          </Button>
          <Button mode="contained" onPress={savePrescriptionNote} style={styles.saveButton}>
            Save
          </Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );

  const renderDoctorVisitModal = () => (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Add Doctor Visit</Text>
        
        <Text style={styles.inputLabel}>Doctor's Name</Text>
        <TextInput
          style={styles.textInput}
          value={doctorName}
          onChangeText={setDoctorName}
          placeholder="Dr. Smith"
        />
        
        <Text style={styles.inputLabel}>Date</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
          <Text style={styles.dateText}>{visitDate.toLocaleDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={visitDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
        
        <Text style={styles.inputLabel}>Diagnosis</Text>
        <TextInput
          style={styles.textInput}
          value={diagnosis}
          onChangeText={setDiagnosis}
          placeholder="Diagnosis or reason for visit"
        />
        
        <Text style={styles.inputLabel}>Notes</Text>
        <TextInput
          style={[styles.textInput, styles.notesInput]}
          value={notes}
          onChangeText={setNotes}
          multiline
          placeholder="Additional notes"
        />
        
        <View style={styles.modalButtons}>
          <Button mode="outlined" onPress={() => setIsDoctorVisitModalVisible(false)}>
            Cancel
          </Button>
          <Button mode="contained" onPress={saveDoctorVisit} style={styles.saveButton}>
            Save Visit
          </Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );

  return (
    <View style={styles.container}>
      {prescriptions.length === 0 && doctorVisits.length === 0 ? renderEmptyState() : renderRecords()}

      {/* Modals */}
      <Modal
        visible={isPrescriptionModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsPrescriptionModalVisible(false)}
      >
        {renderPrescriptionModal()}
      </Modal>

      <Modal
        visible={isDoctorVisitModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsDoctorVisitModalVisible(false)}
      >
        {renderDoctorVisitModal()}
      </Modal>

      {/* Status message */}
      {serverStatus ? (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>{serverStatus}</Text>
        </View>
      ) : null}

      {/* FAB buttons */}
      {(prescriptions.length > 0 || doctorVisits.length > 0) && (
        <View style={styles.fabContainer}>
          <TouchableOpacity 
            style={[styles.fab, styles.fabPrescription]}
            onPress={handleAddPrescription}
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.fabIcon}>Rx</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.fab, styles.fabDoctor]}
            onPress={handleAddDoctorVisit}
          >
            <Text style={styles.fabIcon}>Dr</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerLeft: {
    paddingLeft: 10,
  },
  arrowIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  container: {
    flex: 1,
    backgroundColor: '#F4F8FB',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  icon: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00BBD3',
    textAlign: 'center',
    marginBottom: 30,
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardIcon: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00C2D4',
    marginBottom: 5,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  recordsContainer: {
    padding: 15,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  addText: {
    fontSize: 14,
    color: '#00C2D4',
    fontWeight: '500',
  },
  recordItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  prescriptionImage: {
    width: 70,
    height: 70,
    borderRadius: 6,
    marginRight: 12,
  },
  visitIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 6,
    backgroundColor: '#e6f7f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  visitIconText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00C2D4',
  },
  recordDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  recordName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  recordDate: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  recordSubtitle: {
    fontSize: 14,
    color: '#555',
  },
  recordNotes: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  noNotes: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 4,
  },
  buttonContainer: {
    padding: 15,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#00C2D4',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'column',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    marginBottom: 10,
  },
  fabPrescription: {
    backgroundColor: '#00C2D4',
  },
  fabDoctorVisit: {
    backgroundColor: '#2E86C1',
  },
  fabIcon: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00C2D4',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalImagePreview: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#f5f5f5',
  },
  medicinesContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    maxHeight: 150,
  },
  medicinesTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  medicineText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 5,
  },
  noMedicinesText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 5,
    marginTop: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  dateText: {
    fontSize: 14,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalCancelButton: {
    flex: 1,
    marginRight: 10,
    borderColor: '#999',
  },
  modalSaveButton: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: '#00C2D4',
  },
  statusContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusText: {
    color: 'white',
    fontSize: 14,
  },
});

export default MedicalHistory;