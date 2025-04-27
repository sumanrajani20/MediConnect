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

const Radiology = ({ navigation }) => {
  const [images, setImages] = useState([]); // State to store radiology records
  const [selectedImage, setSelectedImage] = useState(null); // Selected image for full preview
  const [isAddNoteModalVisible, setIsAddNoteModalVisible] = useState(false); // Modal for adding/editing notes
  const [currentNote, setCurrentNote] = useState(''); // Current note being edited
  const [editingImage, setEditingImage] = useState(null); // Image being edited
  const [showImagePreview, setShowImagePreview] = useState(false); // Preview modal visibility
  const [previewImage, setPreviewImage] = useState(null); // Image being previewed

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Radiology',
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
    borderRadius: 8,
    marginTop: 10,
  },
  addButtonLabel: {
    color: '#fff',
  },
  message: {
    fontSize: 15,
    fontWeight: '600',
    color: '#00BBD3',
    textAlign: 'center',
    marginBottom: 20,
  },
  imageRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: 'white',
    marginHorizontal: 8,
    marginTop: 8,
    borderRadius: 8,
  },
  imageContainer: {
    width: 100,
    height: 100,
    marginRight: 10,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  imageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
  },
  imageDate: {
    fontSize: 12,
    color: '#888',
    marginBottom: 6,
  },
  notesContainer: {
    backgroundColor: '#f0f0f0',
    padding: 6,
    borderRadius: 4,
    marginTop: 4,
    marginBottom: 8,
  },
  notesTitle: {
    fontWeight: '600',
    fontSize: 12,
    color: '#555',
  },
  notesText: {
    fontSize: 12,
    color: '#666',
  },
  noNotes: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginVertical: 4,
  },
  editNotesButton: {
    marginTop: 4,
    backgroundColor: '#e6f7f9',
    padding: 6,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  editNotesButtonText: {
    color: '#00C2D4',
    fontSize: 12,
    fontWeight: '500',
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#00C2D4',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  floatingText: {
    color: 'white',
    fontSize: 30,
    marginBottom: 2,
  },
  // Preview Modal Styles
  previewModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  previewModalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    alignItems: 'center',
  },
  previewModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00C2D4',
    marginBottom: 15,
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 15,
    resizeMode: 'contain',
  },
  validationNoteContainer: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeeba',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 15,
    width: '100%',
  },
  validationNoteText: {
    color: '#856404',
    fontSize: 14,
    textAlign: 'center',
  },
  previewModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  previewModalCancelButton: {
    flex: 1,
    marginRight: 10,
    borderColor: '#999',
  },
  previewModalConfirmButton: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: '#00C2D4',
  },
  // Existing Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: '#000000cc',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fullImage: {
    width: '100%',
    height: '60%',
    borderRadius: 8,
    marginBottom: 15,
    resizeMode: 'contain',
  },
  modalImageLabel: {
    color: 'white',
    fontSize: 16,
    marginBottom: 5,
  },
  modalNotesContainer: {
    backgroundColor: '#ffffff22',
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
    width: '100%',
  },
  modalNotesTitle: {
    color: 'white',
    fontWeight: '600',
    marginBottom: 5,
  },
  modalNotesText: {
    color: 'white',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 10,
  },
  deleteBtn: {
    flex: 1,
    marginRight: 10,
    borderColor: '#ff6b6b',
    backgroundColor: '#ff6b6b22',
  },
  editNotesBtn: {
    flex: 1,
    marginLeft: 10,
    borderColor: '#00C2D4',
    backgroundColor: '#00C2D422',
  },
  closeBtn: {
    width: '100%',
    backgroundColor: '#00C2D4',
  },
  notesModalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  notesModalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    elevation: 5,
  },
  notesModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00C2D4',
    marginBottom: 5,
  },
  notesModalImageName: {
    fontSize: 14,
    color: '#555',
    marginBottom: 15,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  notesModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  notesModalCancelButton: {
    flex: 1,
    marginRight: 10,
    borderColor: '#999',
  },
  notesModalSaveButton: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: '#00C2D4',
  },
});

export default Radiology;