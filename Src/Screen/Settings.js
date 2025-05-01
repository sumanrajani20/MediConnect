import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
  TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';
import QRCode from 'react-native-qrcode-svg';

import { generateShareToken } from '../../utls/generateShareToken';

const Settings = ({ navigation }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [isAccountModalVisible, setAccountModalVisible] = useState(false);
  const [qrValue, setQrValue] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const user = auth().currentUser;
  const [displayName, setDisplayName] = useState(user?.displayName || '');

  const toggleQR = async () => {
    if (showQR) {
      setShowQR(false);
    } else {
      const token = await generateShareToken(user?.uid);
      const shareUrl = `https://mediconn.netlify.app/?token=${token}`;
      setQrValue(shareUrl);
      setShowQR(true);
    }
  };

  const settingsOptions = [
    {
      id: '0',
      title: 'Share My Info (QR)',
      icon: 'qr-code',
      action: 'qr',
    },
    {
      id: '1',
      title: 'Account',
      icon: 'person',
      subtitle: user?.displayName || user?.email || 'Not available',
    },
    {
      id: '2',
      title: 'Terms & Conditions',
      icon: 'document-text',
    },
    {
      id: '3',
      title: 'Sign Out',
      icon: 'log-out',
      action: 'signOut',
    },
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
    <>
      <TouchableOpacity
        style={styles.item}
        onPress={() => {
          if (item.action === 'signOut') {
            setModalVisible(true);
          } else if (item.action === 'qr') {
            toggleQR();
          } else if (item.id === '2') {
            navigation.navigate('TermsAndConditions');
          } else if (item.id === '1') {
            setAccountModalVisible(true);
          } else {
            Alert.alert('Option Selected', `${item.title} clicked!`);
          }
        }}
      >
        <View style={styles.iconContainer}>
          <Icon name={item.icon} size={24} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemText}>{item.title}</Text>
          {item.subtitle && (
            <Text style={styles.subtitleText}>{item.subtitle}</Text>
          )}
        </View>
        <Icon name="chevron-forward" size={20} color="#00BBD3" />
      </TouchableOpacity>

      {item.action === 'qr' && showQR && qrValue && (
        <View style={styles.qrContainer}>
          <QRCode value={qrValue} size={200} />
        </View>
      )}
    </>
  );

  return (
    <LinearGradient colors={['#33E4DB', '#00BBD3']} style={styles.container}>
      <Text style={styles.header}>Settings</Text>
      <View style={styles.listContainer}>
        <FlatList
          data={settingsOptions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      </View>

      {/* Sign Out Confirmation Modal */}
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

      {/* Account Info Modal */}
      <Modal
        visible={isAccountModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAccountModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Account Info</Text>

            {isEditing ? (
              <>
                <Text style={styles.modalMessage}>Edit Name:</Text>
                <TextInput
                  value={displayName}
                  onChangeText={setDisplayName}
                  style={styles.textInput}
                  placeholder="Enter display name"
                />
              </>
            ) : (
              <Text style={styles.modalMessage}>Name: {user?.displayName || 'N/A'}</Text>
            )}

            <Text style={styles.modalMessage}>Email: {user?.email || 'N/A'}</Text>
            <Text style={styles.modalMessage}>UID: {user?.uid || 'N/A'}</Text>

            <View style={{ flexDirection: 'row', marginTop: 20 }}>
              {isEditing ? (
                <>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton, { marginRight: 5 }]}
                    onPress={() => {
                      setIsEditing(false);
                      setDisplayName(user?.displayName || '');
                    }}
                  >
                    <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.logoutButton, { marginLeft: 5 }]}
                    onPress={async () => {
                      try {
                        await user.updateProfile({ displayName });
                        Alert.alert('Success', 'Display name updated');
                        setIsEditing(false);
                      } catch (error) {
                        Alert.alert('Error', 'Could not update name');
                      }
                    }}
                  >
                    <Text style={styles.buttonText}>Save</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={[styles.button, styles.logoutButton]}
                    onPress={() => setIsEditing(true)}
                  >
                    <Text style={styles.buttonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton, { marginLeft: 10 }]}
                    onPress={() => setAccountModalVisible(false)}
                  >
                    <Text style={[styles.buttonText, styles.cancelButtonText]}>Close</Text>
                  </TouchableOpacity>
                </>
              )}
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
    color: '#333',
  },
  subtitleText: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
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
    marginBottom: 10,
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
  textInput: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
});

export default Settings;
