import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // Vector icons library

export default function Profile() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      {/* User Info */}
      <View style={styles.userInfo}>
        <View style={styles.userImagePlaceholder}>
          <Icon name="person-circle-outline" size={80} color="#00BBD3" />
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.userName}>Jane Doe</Text>
          <Text style={styles.userContact}>+123 567 89000</Text>
          <Text style={styles.userEmail}>Janedoe@example.com</Text>
        </View>
      </View>

      {/* Profile Options */}
      <View style={styles.options}>
        <Option icon="person-outline" text="Profile" />
        <Option icon="heart-outline" text="Favorite" />
        <Option icon="card-outline" text="Payment Method" />
        <Option icon="lock-closed-outline" text="Privacy Policy" />
        <Option icon="settings-outline" text="Settings" />
        <Option icon="help-circle-outline" text="Help" />
        <Option icon="log-out-outline" text="Logout" />
      </View>
    </View>
  );
}

function Option({ icon, text }) {
  return (
    <TouchableOpacity style={styles.option}>
      <Icon name={icon} size={24} color="#00BBD3" style={styles.optionIcon} />
      <Text style={styles.optionText}>{text}</Text>
      <Icon name="chevron-forward-outline" size={20} color="#CCCCCC" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF6F8',
  },
  header: {
    backgroundColor: '#00BBD3',
    paddingVertical: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 12,
    marginTop: -40,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  userImagePlaceholder: {
    marginRight: 15,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  userContact: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  options: {
    marginTop: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionIcon: {
    marginRight: 15,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
});