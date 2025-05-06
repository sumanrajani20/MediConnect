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
import auth from '@react-native-firebase/auth';


const { width } = Dimensions.get('window');

const SignupScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [secureConfirmEntry, setSecureConfirmEntry] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Sign up',
      headerTitleAlign: 'center',
      headerStyle: {
        height: 60,
      },
      headerTintColor: '#fff',
      headerBackground: () => (
        <LinearGradient
          colors={['#33E4DB', '#00BBD3'] || ['#000', '#FFF']} // Default colors added
          style={{ flex: 1 }}
        />
      ),
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
  
  const handleSignup = async () => {
    try {
      if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
        throw new Error('Please fill in all fields.');
      }
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match.');
      }
      await auth().createUserWithEmailAndPassword(email.trim(), password.trim());
      navigation.replace('MainTabs');
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.imageContainer}>
        <Image
          source={require('../../assets/Doctor.jpg')} 
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          placeholder="example@example.com"
          placeholderTextColor="#00C2D4"
        />
      </View>

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

      <TouchableOpacity style={styles.button} onPress={handleSignup} activeOpacity={0.8}>
        <LinearGradient colors={['#00C2D4', '#00A7C4']} style={styles.buttonGradient}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </LinearGradient>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  image: {
    width: width * 0.6,
    height: width * 0.4,
  },
  inputContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 5,
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
    marginHorizontal: 110,
    borderRadius: 25,
    overflow: 'hidden',
    marginTop: 30,
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

export default SignupScreen;

