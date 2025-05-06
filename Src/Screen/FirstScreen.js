import React from 'react';
import { View, Image } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';

const FirstScreen = ({ navigation }) => {
  const theme = useTheme();

  return (
    <View style={{
      flex: 1,
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingVertical: 60,
      backgroundColor: theme.colors.background,
    }}>
      <Image
        source={require('../../assets/Green-logo.jpeg')}
        style={{
          width: 220,
          height: 220,
          marginBottom: 10,
          marginTop: 100
        }}
        resizeMode="contain"
      />
      <Text 
        variant="displayMedium" 
        style={{ 
          color: '#00BBD3', 
          marginBottom: 20 
        }}>
        MediConnect
      </Text>
      {/* <Text 
        variant="bodyMedium" 
        style={{ 
          color: theme.colors.secondary,
          textAlign: 'center',
          paddingHorizontal: 40,
          marginBottom: 60
        }}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
      </Text> */}
      <View style={{ 
        marginTop: 60,
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 40
      }}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('LoginScreen')}
          style={{
            marginBottom: 15,
            width: '100%',
            borderRadius: 30,
            backgroundColor: '#00BBD3'
          }}
          labelStyle={{ fontSize: 16 }}
        >
          Login
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('SignupScreen')}
          style={{
            width: '100%',
            borderRadius: 30,
            borderColor: '#00BBD3'
          }}
          labelStyle={{ fontSize: 16, color: '#00BBD3' }}
        >
          Sign up
        </Button>
      </View>
    </View>
  );
};

export default FirstScreen;
