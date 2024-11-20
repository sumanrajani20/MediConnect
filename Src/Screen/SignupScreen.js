import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';

const SignupScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignup = () => {
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Confirm Password:', confirmPassword);
  };

  return (
    <View style={styles.container}>
      {/* Logo Section */}
      <Image
        source={require('../../assets/Logo.png')} // Path to your logo
        style={styles.logo}
      />

      {/* Title Section */}
      <Text style={styles.title}>Create your Account</Text>

      {/* Input Fields */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#8e8e8e"
        value={email}
        onChangeText={(text) => setEmail(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#8e8e8e"
        secureTextEntry
        value={password}
        onChangeText={(text) => setPassword(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="#8e8e8e"
        secureTextEntry
        value={confirmPassword}
        onChangeText={(text) => setConfirmPassword(text)}
      />

      {/* Sign Up Button */}
      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Sign up</Text>
      </TouchableOpacity>

      {/* Social Login Options */}
      <Text style={styles.orText}>or sign in with</Text>
      <View style={styles.socialIcons}>
        <TouchableOpacity>
          <Image
            source={require('../../assets/gmail.png')} // Path to Gmail icon
            style={styles.socialIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image
            source={require('../../assets/facebook.png')} // Path to Facebook icon
            style={styles.socialIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image
            source={require('../../assets/twitter.png')} // Path to Twitter icon
            style={styles.socialIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d4efd5', // Light green background
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2b2b2b',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#e0e0e0', // Light grey background for input
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
    color: '#000',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#1976d2', // Blue button color
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  orText: {
    fontSize: 14,
    color: '#8e8e8e',
    marginBottom: 15,
  },
  socialIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  socialIcon: {
    width: 40,
    height: 40,
    marginHorizontal: 10,
  },
});

export default SignupScreen;
