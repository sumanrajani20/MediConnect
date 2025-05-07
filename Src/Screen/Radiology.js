import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Button } from 'react-native-paper';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const Radiology = ({ navigation }) => {
  const [images, setImages] = useState([]); // State to store radiology records
  const [selectedImage, setSelectedImage] = useState(null); // Selected image for full preview
  const [isAddNoteModalVisible, setIsAddNoteModalVisible] = useState(false); // Modal for adding/editing notes
  const [currentNote, setCurrentNote] = useState(''); // Current note being edited
  const [editingImage, setEditingImage] = useState(null); // Image being edited
  const [showImagePreview, setShowImagePreview] = useState(false); // Preview modal visibility
  const [previewImage, setPreviewImage] = useState(null); // Image being previewed
  const [isDeleteConfirmationVisible, setIsDeleteConfirmationVisible] = useState(false); // Delete confirmation modal
  const [imageToDelete, setImageToDelete] = useState(null); // Image to be deleted

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Radiology                ',
      headerTitleAlign: 'center',
      headerStyle: {
        backgroundColor: '#00C2D4',
      },
      headerTintColor: '#fff',
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingLeft: 10,
          }}
        >
          <Image
            source={require('../../assets/custom-arrow.png')}
            style={{ width: 20, height: 20, resizeMode: 'contain' }}
          />
        </TouchableOpacity>
      ),
    });

    // Fetch radiology records on component mount
    fetchRadiologyRecords();
  }, [navigation]);

  // Fetch radiology records from Firestore
  const fetchRadiologyRecords = async () => {
    try {
      const userId = auth().currentUser?.uid;
      if (!userId) throw new Error('User not signed in');

      const snapshot = await firestore()
        .collection('users')
        .doc(userId)
        .collection('radiology')
        .get();

      const fetchedImages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setImages(fetchedImages);
    } catch (error) {
      console.error('Error fetching radiology records:', error);
      Alert.alert('Error', error.message || 'Failed to fetch radiology records');
    }
  };

  const handleAddPicture = () => {
    Alert.alert(
      'Add Picture',
      'Choose a source',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Camera',
          onPress: () => {
            launchCamera(
              {
                mediaType: 'photo',
                saveToPhotos: true,
                cameraType: 'back',
              },
              response => {
                if (response.didCancel) {
                  console.log('User cancelled camera');
                } else if (response.errorCode) {
                  Alert.alert('Error', response.errorMessage || 'Camera error');
                } else if (response.assets && response.assets.length > 0) {
                  const asset = response.assets[0];
                  const newImage = {
                    uri: asset.uri,
                    name: asset.fileName || `Camera_Image_${Date.now()}`,
                    date: new Date().toLocaleDateString(),
                    notes: '',
                  };

                  setPreviewImage(newImage);
                  setShowImagePreview(true);
                }
              }
            );
          },
        },
        {
          text: 'Gallery',
          onPress: () => {
            launchImageLibrary(
              {
                mediaType: 'photo',
              },
              response => {
                if (response.didCancel) {
                  console.log('User cancelled gallery');
                } else if (response.errorCode) {
                  Alert.alert('Error', response.errorMessage || 'Gallery error');
                } else if (response.assets && response.assets.length > 0) {
                  const asset = response.assets[0];
                  const newImage = {
                    uri: asset.uri,
                    name: asset.fileName || `Gallery_Image_${Date.now()}`,
                    date: new Date().toLocaleDateString(),
                    notes: '',
                  };

                  setPreviewImage(newImage);
                  setShowImagePreview(true);
                }
              }
            );
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleConfirmImage = async () => {
    if (previewImage) {
      try {
        const userId = auth().currentUser?.uid;
        if (!userId) throw new Error('User not signed in');

        const newImage = {
          ...previewImage,
          id: Date.now().toString(),
        };

        // Save to Firestore
        await firestore()
          .collection('users')
          .doc(userId)
          .collection('radiology')
          .doc(newImage.id)
          .set(newImage);

        // Update state
        setImages(prev => [...prev, newImage]);

        // Open notes modal for the new image
        setEditingImage(newImage);
        setCurrentNote('');

        // Close preview and open notes
        setShowImagePreview(false);
        setIsAddNoteModalVisible(true);
      } catch (error) {
        console.error('Error saving image:', error);
        Alert.alert('Error', error.message || 'Failed to save image');
      }
    }
  };

  const handleCancelImage = () => {
    setShowImagePreview(false);
    setPreviewImage(null);
  };

  const saveNote = async () => {
    if (editingImage) {
      try {
        const userId = auth().currentUser?.uid;
        if (!userId) throw new Error('User not signed in');

        const updatedImage = { ...editingImage, notes: currentNote };

        // Update Firestore
        await firestore()
          .collection('users')
          .doc(userId)
          .collection('radiology')
          .doc(updatedImage.id)
          .update({ notes: currentNote });

        // Update state
        setImages(prev =>
          prev.map(img => (img.id === updatedImage.id ? updatedImage : img))
        );

        setIsAddNoteModalVisible(false);
      } catch (error) {
        console.error('Error saving notes:', error);
        Alert.alert('Error', error.message || 'Failed to save notes');
      }
    }
  };

  // Handle delete confirmation dialog
  const handleDeletePress = (image) => {
    setImageToDelete(image);
    setIsDeleteConfirmationVisible(true);
  };

  // Cancel delete operation
  const handleCancelDelete = () => {
    setIsDeleteConfirmationVisible(false);
    setImageToDelete(null);
  };

  // Confirm and execute delete operation
  const handleConfirmDelete = async () => {
    if (imageToDelete) {
      try {
        const userId = auth().currentUser?.uid;
        if (!userId) throw new Error('User not signed in');

        // Delete from Firestore
        await firestore()
          .collection('users')
          .doc(userId)
          .collection('radiology')
          .doc(imageToDelete.id)
          .delete();

        // Update local state
        setImages(prev => prev.filter(img => img.id !== imageToDelete.id));
        
        // Close modal and reset state
        setIsDeleteConfirmationVisible(false);
        setImageToDelete(null);
        
        // Show success message
        Alert.alert('Success', 'X-ray record deleted successfully');
      } catch (error) {
        console.error('Error deleting record:', error);
        Alert.alert('Error', error.message || 'Failed to delete record');
        setIsDeleteConfirmationVisible(false);
        setImageToDelete(null);
      }
    }
  };

  return (
    <View style={styles.container}>
      {images.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.message}>
            You Have Not Added Any Radiology Records Yet
          </Text>
          <Button
            mode="contained"
            onPress={handleAddPicture}
            style={styles.centerButton}
            labelStyle={styles.addButtonLabel}
          >
            Add Picture
          </Button>
        </View>
      ) : (
        <ScrollView>
          {images.map((item, index) => (
            <View key={index} style={styles.imageRow}>
              <TouchableOpacity
                style={styles.imageContainer}
                onPress={() => setSelectedImage(item)}
              >
                <Image source={{ uri: item.uri }} style={styles.thumbnail} />
              </TouchableOpacity>
              <View style={styles.detailsContainer}>
                <Text style={styles.imageLabel} numberOfLines={1}>
                  {item.name || `Image ${index + 1}`}
                </Text>
                <Text style={styles.imageDate}>{item.date}</Text>

                {item.notes ? (
                  <View style={styles.notesContainer}>
                    <Text style={styles.notesTitle}>Notes:</Text>
                    <Text style={styles.notesText} numberOfLines={3}>
                      {item.notes}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.noNotes}>No notes added</Text>
                )}

                <View style={styles.actionButtonsContainer}>
                  <TouchableOpacity
                    style={styles.editNotesButton}
                    onPress={() => {
                      setEditingImage(item);
                      setCurrentNote(item.notes || '');
                      setIsAddNoteModalVisible(true);
                    }}
                  >
                    <Text style={styles.editNotesButtonText}>
                      {item.notes ? 'Edit Notes' : 'Add Notes'}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeletePress(item)}
                  >
                    <FontAwesome name="trash" size={20} color="#F44336" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.floatingButton} onPress={handleAddPicture}>
        <Text style={styles.floatingText}>＋</Text>
      </TouchableOpacity>

      {/* Image Preview Modal */}
      <Modal
        visible={showImagePreview}
        transparent
        animationType="slide"
        onRequestClose={handleCancelImage}
      >
        <View style={styles.previewModalOverlay}>
          <View style={styles.previewModalContent}>
            <Text style={styles.previewModalTitle}>X-ray Image Preview</Text>

            {previewImage && (
              <Image source={{ uri: previewImage.uri }} style={styles.previewImage} />
            )}

            {previewImage && (
              <View style={styles.validationNoteContainer}>
                <Text style={styles.validationNoteText}>
                  ⚠️ Please ensure this is a valid X-ray image
                </Text>
              </View>
            )}

            <View style={styles.previewModalButtons}>
              <Button
                mode="outlined"
                onPress={handleCancelImage}
                style={styles.previewModalCancelButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleConfirmImage}
                style={styles.previewModalConfirmButton}
              >
                Confirm
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add/Edit Notes Modal */}
      <Modal
        visible={isAddNoteModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAddNoteModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.notesModalContainer}
        >
          <View style={styles.notesModalContent}>
            <Text style={styles.notesModalTitle}>
              {editingImage?.notes ? 'Edit X-ray Notes' : 'Add X-ray Notes'}
            </Text>

            <TextInput
              style={styles.notesInput}
              multiline
              placeholder="Enter details about this X-ray..."
              value={currentNote}
              onChangeText={setCurrentNote}
              autoFocus
            />

            <View style={styles.notesModalButtons}>
              <Button
                mode="outlined"
                onPress={() => setIsAddNoteModalVisible(false)}
                style={styles.notesModalCancelButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={saveNote}
                style={styles.notesModalSaveButton}
              >
                Save Notes
              </Button>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={isDeleteConfirmationVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCancelDelete}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContent}>
            <Text style={styles.deleteModalTitle}>Delete X-ray Record</Text>
            <Text style={styles.deleteModalMessage}>
              Are you sure you want to delete this X-ray record? This action cannot be undone.
            </Text>

            <View style={styles.deleteModalButtons}>
              <Button
                mode="outlined"
                onPress={handleCancelDelete}
                style={styles.deleteModalCancelButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleConfirmDelete}
                style={styles.deleteModalConfirmButton}
                color="#D32F2F"
              >
                Delete
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  headerLeft: {
    paddingLeft: 10,
  },
  customBackButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  backText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  container: {
    flex: 1,
    backgroundColor: '#F4F8FB',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerButton: {
    backgroundColor: '#00C2D4',
    borderRadius: 25,
    marginTop: 20,
    paddingHorizontal: 15,
  },
  addButtonLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#546E7A',
    marginHorizontal: 30,
  },
  imageRow: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  imageContainer: {
    marginRight: 15,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  detailsContainer: {
    flex: 1,
  },
  imageLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#263238',
    marginBottom: 5,
  },
  imageDate: {
    fontSize: 14,
    color: '#546E7A',
    marginBottom: 8,
  },
  notesContainer: {
    marginTop: 4,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#455A64',
  },
  notesText: {
    fontSize: 14,
    color: '#607D8B',
    marginTop: 2,
  },
  noNotes: {
    fontSize: 14,
    color: '#90A4AE',
    fontStyle: 'italic',
    marginTop: 5,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  editNotesButton: {
    backgroundColor: '#E3F2FD',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  editNotesButtonText: {
    color: '#1976D2',
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 25,
    right: 25,
    backgroundColor: '#00C2D4',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  floatingText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  previewModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  previewModalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  previewModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#263238',
    marginBottom: 15,
    textAlign: 'center',
  },
  previewImage: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    borderRadius: 8,
    marginBottom: 20,
  },
  validationNoteContainer: {
    backgroundColor: '#FFF8E1',
    padding: 10,
    borderRadius: 6,
    marginBottom: 20,
  },
  validationNoteText: {
    color: '#F57C00',
    fontSize: 14,
  },
  previewModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  previewModalCancelButton: {
    flex: 1,
    marginRight: 10,
    borderColor: '#CFD8DC',
  },
  previewModalConfirmButton: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: '#00C2D4',
  },
  notesModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  notesModalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  notesModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#263238',
    marginBottom: 15,
    textAlign: 'center',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#CFD8DC',
    borderRadius: 6,
    padding: 12,
    height: 120,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#455A64',
    backgroundColor: '#F5F7FA',
    marginBottom: 20,
  },
  notesModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  notesModalCancelButton: {
    flex: 1,
    marginRight: 10,
    borderColor: '#CFD8DC',
  },
  notesModalSaveButton: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: '#00C2D4',
  },
  // Delete confirmation modal styles
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  deleteModalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: 15,
    textAlign: 'center',
  },
  deleteModalMessage: {
    fontSize: 16,
    color: '#455A64',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deleteModalCancelButton: {
    flex: 1,
    marginRight: 10,
    borderColor: '#CFD8DC',
  },
  deleteModalConfirmButton: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: '#D32F2F',
  },
});

export default Radiology;