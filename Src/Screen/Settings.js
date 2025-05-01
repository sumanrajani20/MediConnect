import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
  Button,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';
import QRCode from 'react-native-qrcode-svg';


import { generateShareToken } from '../../utls/generateShareToken';

const Settings = ({ navigation }) => {
  const [isModalVisible, setModalVisible] = useState(false);

  const user = auth().currentUser;


  const [qrValue, setQrValue] = useState(null);

  const createQR = async () => {
    console.log('Creating QR Code...'); // Debugging
    const token = await generateShareToken(user?.uid);
    const shareUrl = `https://mediconn.netlify.app/?token=${token}`;
    console.log('Generated QR Value:', shareUrl); // Debugging
    setQrValue(shareUrl);
  };


  const settingsOptions = [
    { id: '1', title: 'Account', icon: 'person' },
    { id: '2', title: 'Terms & Conditions', icon: 'document-text' },
    { id: '3', title: 'Sign Out', icon: 'log-out', action: 'signOut' },
  ];

  const handleSignOut = async () => {
    setModalVisible(false);
    try {
      await auth().signOut();
      navigation.replace('HomeScreen');
    } catch (error) {
      Alert.alert('Error', 'Unable to sign out. Please try again.');
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => {
        if (item.action === 'signOut') {
          setModalVisible(true);
        } else if (item.id === '2') {
          navigation.navigate('TermsAndConditions');
        } else {
          Alert.alert('Option Selected', `${item.title} clicked!`);
        }
      }}
    >
      <View style={styles.iconContainer}>
        <Icon name={item.icon} size={24} color="#fff" />
      </View>
      <Text style={styles.itemText}>{item.title}</Text>
      <Icon name="chevron-forward" size={20} color="#00BBD3" />
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#33E4DB', '#00BBD3']} style={styles.container}>
      <Text style={styles.header}>Settings</Text>
      <View style={styles.listContainer}>
     

      <Button backgroundColor='red' title="Generate QR Code" onPress={createQR} />
      {qrValue && <QRCode  value={qrValue} size={200} />}
        <FlatList
          data={settingsOptions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      






      </View>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sign Out</Text>
            <Text style={styles.modalMessage}>Are you sure you want to log out?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.logoutButton]}
                onPress={handleSignOut}
              >
                <Text style={styles.buttonText}>Yes, Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  listContainer: {
    backgroundColor: '#fff',
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#00BBD3',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  itemText: {
    fontSize: 16,
    flex: 1,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#33E4DB',
    backgroundColor: '#fff',
  },
  cancelButtonText: {
    color: '#33E4DB',
  },
  logoutButton: {
    backgroundColor: '#33E4DB',
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
  },
});

export default Settings;