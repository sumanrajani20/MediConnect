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
} from 'react-native';
import { Button } from 'react-native-paper';
import { launchCamera } from 'react-native-image-picker';

const Radiology = ({ navigation }) => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'Radiology',
      headerTitleAlign: 'center',
      headerStyle: {
        backgroundColor: '#00C2D4',
        elevation: 0,
      },
      headerTintColor: '#fff',
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerLeft}>
          <Image source={require('../../assets/custom-arrow.png')} style={styles.arrowIcon} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleAddPicture = () => {
    launchCamera(
      {
        mediaType: 'photo',
        saveToPhotos: true,
        cameraType: 'back',
      },
      response => {
        if (response.didCancel) {
          console.log('User cancelled');
        } else if (response.errorCode) {
          Alert.alert('Error', response.errorMessage || 'Camera error');
        } else {
          const asset = response.assets?.[0];
          if (asset?.uri) {
            const newImage = {
              uri: asset.uri,
              name: asset.fileName || `Image_${Date.now()}`,  // FIXED: Added backticks
              date: new Date().toLocaleDateString(),
            };
            setImages(prev => [...prev, newImage]);
          }
        }
      }
    );
  };

  const handleDelete = () => {
    if (selectedImage) {
      setImages(prev => prev.filter(img => img.uri !== selectedImage.uri));
      setSelectedImage(null);
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
        <>
          <ScrollView contentContainerStyle={styles.imageGrid}>
            {images.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.imageContainer}
                onPress={() => setSelectedImage(item)}
              >
                <Image source={{ uri: item.uri }} style={styles.thumbnail} />
                <Text style={styles.imageLabel} numberOfLines={1}>
                  {item.name || `Image ${index + 1}`}  {/* FIXED: Added backticks */}
                </Text>
                <Text style={styles.imageDate}>{item.date}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Floating Add Button */}
          <TouchableOpacity style={styles.floatingButton} onPress={handleAddPicture}>
            <Text style={styles.floatingText}>＋</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Fullscreen Preview Modal */}
      <Modal visible={!!selectedImage} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Image source={{ uri: selectedImage?.uri }} style={styles.fullImage} />
          <Text style={styles.modalImageLabel}>{selectedImage?.name}</Text>
          <Text style={styles.modalImageLabel}>{selectedImage?.date}</Text>
          <Button mode="outlined" onPress={handleDelete} style={styles.deleteBtn}>
            Delete
          </Button>
          <Button mode="contained" onPress={() => setSelectedImage(null)} style={styles.closeBtn}>
            Close
          </Button>
        </View>
      </Modal>
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
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingHorizontal: 10,
    paddingTop: 16,
    gap: 10,
  },
  imageContainer: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 16,
  },
  thumbnail: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  imageLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    color: '#444',
    maxWidth: '100%',
  },
  imageDate: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
    textAlign: 'center',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: '#000000cc',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fullImage: {
    width: '90%',
    height: '60%',
    resizeMode: 'contain',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
    marginBottom: 10,
  },
  modalImageLabel: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 5,
  },
  deleteBtn: {
    marginBottom: 10,
    borderColor: 'red',
    borderWidth: 1,
  },
  closeBtn: {
    backgroundColor: '#00C2D4',
  },
});

export default Radiology;