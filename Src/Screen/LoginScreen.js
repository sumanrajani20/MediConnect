import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Log In',
      headerTitleAlign: 'center',
      headerStyle: {
        height: 60,
      },
      headerTintColor: '#fff',
      headerBackground: () => (
        <LinearGradient colors={['#33E4DB', '#00BBD3']} style={{ flex: 1 }} />
      ),
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingLeft: 10 }}>
          <Image source={require('../../assets/custom-arrow.png')} style={{ width: 20, height: 20, resizeMode: 'contain' }} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleLogin = async () => {
    try {
      if (!email.trim() || !password.trim()) {
        throw new Error('Please enter both email and password.');
      }
      await auth().signInWithEmailAndPassword(email.trim(), password.trim());
      navigation.replace('MainTabs');
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={require('../../assets/Doctor.jpg')} style={styles.image} resizeMode="contain" />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          mode="outlined"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          placeholder="example@example.com"
          placeholderTextColor="#00C2D4"
          outlineColor="#E0E0E0"
          activeOutlineColor="#00C2D4"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Password</Text>
        <View style={styles.passwordWrapper}>
          <TextInput
            mode="outlined"
            style={[styles.input, { flex: 1 }]}
            secureTextEntry={secureTextEntry}
            value={password}
            onChangeText={setPassword}
            placeholder="********"
            placeholderTextColor="#00C2D4"
            outlineColor="#E0E0E0"
            activeOutlineColor="#00C2D4"
          />
          <TouchableOpacity
            onPress={() => setSecureTextEntry(!secureTextEntry)}
            style={styles.iconContainer}
          >
            <MaterialIcons
              name={secureTextEntry ? 'visibility-off' : 'visibility'}
              size={24}
              color="#00C2D4"
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.forgotPassword} onPress={() => navigation.navigate('SetPasswordScreen')}>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      <Button mode="contained" onPress={handleLogin} style={styles.button} buttonColor="#00A7C4" textColor="#ffffff">
        Log In
      </Button>

      <Text style={styles.footerText}>
        Don’t have an Account?{' '}
        <TouchableOpacity onPress={() => navigation.navigate('SignupScreen')}>
          <Text style={styles.signUpText}>Sign Up</Text>
        </TouchableOpacity>
      </Text>
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
    fontSize: 16,
    color: '#000000',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#F5F5F5',
    fontSize: 16,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  iconContainer: {
    position: 'absolute',
    right: 10,
    padding: 10,
  },
  forgotPassword: {
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  forgotText: {
    fontSize: 12,
    color: '#33E4DB',
  },
  button: {
    marginHorizontal: 110,
    borderRadius: 25,
    marginTop: 30,
  },
  footerText: {
    fontSize: 14,
    color: '#6C6C6C',
    textAlign: 'center',
    marginTop: 10,
  },
  signUpText: {
    color: '#00A7C4',
    fontWeight: '600',
  },
});

export default LoginScreen;
