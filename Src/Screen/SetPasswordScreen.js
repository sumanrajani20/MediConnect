import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const SetPasswordScreen = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [secureConfirmEntry, setSecureConfirmEntry] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Set Password', // Centered title
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
            source={require('../../assets/custom-arrow.png')} // Add your custom arrow here
            style={{ width: 20, height: 20, resizeMode: 'contain' }}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleSetPassword = () => {
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
    } else {
      alert('Password set successfully!');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            secureTextEntry={secureTextEntry}
            value={password}
            onChangeText={setPassword}
            placeholder="********"
            placeholderTextColor="#00C2D4"
          />
          <TouchableOpacity
            onPress={() => setSecureTextEntry(!secureTextEntry)}
            style={styles.eyeIcon}
          >
            <Icon name={secureTextEntry ? 'visibility-off' : 'visibility'} size={24} color="#00C2D4" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Confirm Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            secureTextEntry={secureConfirmEntry}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="********"
            placeholderTextColor="#00C2D4"
          />
          <TouchableOpacity
            onPress={() => setSecureConfirmEntry(!secureConfirmEntry)}
            style={styles.eyeIcon}
          >
            <Icon name={secureConfirmEntry ? 'visibility-off' : 'visibility'} size={24} color="#00C2D4" />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSetPassword} activeOpacity={0.8}>
        <LinearGradient colors={['#00C2D4', '#00A7C4']} style={styles.buttonGradient}>
          <Text style={styles.buttonText}>Create New Password</Text>
        </LinearGradient>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
   flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'flex-start', // Align items to the top
    paddingHorizontal: 20,
    paddingTop: 100, // Adjust the top padding as needed
  },
  descriptionText: {
    fontSize: 16,
    color: '#6C6C6C',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500', // Bold text for description
  },
  inputContainer: {
    marginBottom: 50,
  },
  inputLabel: {
    fontSize: 20,
    color: '#000000',
    marginBottom: 20,
    fontWeight: '700', // Bold label text
  },
  input: {
    height: 50,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#000',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    top: 12,
  },
  button: {
    marginHorizontal: 50,
    borderRadius: 25,
    overflow: 'hidden',
    marginTop: 0,
  },
  buttonGradient: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SetPasswordScreen;
