import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import StackNavigator from './Navigations/StackNavigator';


const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(
      (currentUser) => {
        setUser(currentUser);
        setIsLoading(false);
      },
      (error) => {
        console.error('Auth Error:', error);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StackNavigator user={user} />
    </NavigationContainer>
  );
};

export default App;
