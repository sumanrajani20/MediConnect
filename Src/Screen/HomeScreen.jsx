import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { colors } from '../../utls/colors';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
    const navigation = useNavigation();
    const handleLogin = () => {
        navigation.navigate("Login");
    };

    const handleSignup = () => {
        navigation.navigate("Signup");
    };
  return (
    <View style={styles.container}>
      {/* Center the logo image */}
      <Image
        source={require('../../assets/Logo.png')}  // Path to your image
        style={styles.logo}
      />
      <View style = {styles.buttonContainer}>
        <TouchableOpacity style ={[styles.loginButtononWrapper,{backgroundColor: colors.primary},]}  onPress = {handleLogin}>
       
            <Text style ={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style= {styles.loginButtononWrapper} onPress={handleSignup}>
            <Text style = {styles.signupButtonText}>Sign-up</Text>
        </TouchableOpacity>
      </View>
    </View>

  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.Green,
    justifyContent: 'center',  
    alignItems: 'center',      
  },
  logo: {
    width: 200,     
    height: 200,  
  },
 buttonContainer: {
    marginTop:20,
    flexDirection: 'row',
    borderWidth:2,
    borderColor: colors.primary,
    width: "85%",
    height:60,
    borderRadius: 100,
  }, 
  loginButtononWrapper: {
    justifyContent: "center",
    alignItems: "center",
    width: "50%",
    
    borderRadius:98,
  },
  loginButtonText:{
    color: colors.white, 
    fontSize: 18,
   
    
  },
  signupButtonText: {
    fontSize: 18,
  }

});
