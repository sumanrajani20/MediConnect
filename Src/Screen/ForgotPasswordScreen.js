import React, { useState , useEffect} from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet,Image } from 'react-native';
import auth from '@react-native-firebase/auth'; // ya 'firebase/auth' agar tum web version use kar rahi ho
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  useEffect(() => {
      navigation.setOptions({
        headerTitle: 'Forget password         ',
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
              source={require('../../assets/custom-arrow.png')} 
              style={{ width: 20, height: 20, resizeMode: 'contain' }}
            />
          </TouchableOpacity>
        ),
      });
    }, [navigation]);
    const navigation = useNavigation();

  const handlePasswordReset = async () => {
    if (!email) {
      Alert.alert("Email Required", "Please enter your email address.");
      return;
    }

    try {
      await auth().sendPasswordResetEmail(email);
      Alert.alert(
        "Reset Email Sent",
        "Check your inbox for the password reset link.",
        [
          { text: "OK", onPress: () => navigation.goBack() }
        ]
      );
    } catch (error) {
      console.log("Password reset error:", error);
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Your Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        onChangeText={setEmail}
        value={email}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.button} onPress={handlePasswordReset}>
        <Text style={styles.buttonText}>Send Reset Link</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, textAlign: 'center', marginBottom: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 20, borderRadius: 5 },
  button: { backgroundColor: '#1E90FF', padding: 15, borderRadius: 5 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
});
