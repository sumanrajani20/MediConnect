import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Entypo from 'react-native-vector-icons/Entypo';

// Import all screens
import LoginScreen from '../Src/Screen/LoginScreen';
import SignupScreen from '../Src/Screen/SignupScreen';
import FirstScreen from '../Src/Screen/FirstScreen';
import Home from '../Src/Screen/Home';
import MedicalHistory from '../Src/Screen/MedicalHistory';
import VitalSign from '../Src/Screen/VitalSign';
//import Profile from '../Src/Screen/Profile';
import Settings from '../Src/Screen/Settings';
import Allergies from '../Src/Screen/Allergies';
import Reminders from '../Src/Screen/Reminders';
import LabResult from '../Src/Screen/LabResult';
import Radiology from '../Src/Screen/Radiology';
import ForgotPasswordScreen from '../Src/Screen/ForgotPasswordScreen';
import TermsAndConditions from '../Src/Screen/TermsAndConditions';
import ZeroScreen from '../Src/Screen/ZeroScreen';
import CategoryCard from '../Src/Screen/CategoryCard';
import BloodPressureScreen from '../Src/Screen/BloodPressureScreen';
import GlucoseLevelScreen from '../Src/Screen/GlucoseLevelScreen';
import TemperatureScreen from '../Src/Screen/TemperatureScreen';
import HeartRateScreen from '../Src/Screen/HeartRateScreen';


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// ✅ **Tab Navigator**
const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: '#4FE5E7',
      tabBarInactiveTintColor: '#B0BEC5',
      tabBarStyle: {
        backgroundColor: "#F8FCFF",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: 70,
      },
      tabBarLabelStyle: "text-xs font-bold",
      tabBarIcon: ({ focused, size }) => {
        let iconName;
        let IconComponent;

        if (route.name === 'Home') {
          iconName = 'home';
          IconComponent = Entypo;
        } else if (route.name === 'MedicalHistory') {
          iconName = 'text-document';
          IconComponent = Entypo;
        } else if (route.name === 'VitalSign') {
          iconName = 'heartbeat';
          IconComponent = FontAwesome;
        } else if (route.name === 'Profile') {
          iconName = 'user';
          IconComponent = FontAwesome;
        } else if (route.name === 'Settings') {
          iconName = 'cog';
          IconComponent = Entypo;
        }

        return <IconComponent name={iconName} size={size} color={focused ? '#4FE5E7' : '#B0BEC5'} />;
      },
    })}
  >
    <Tab.Screen name="Home" component={Home} />
    <Tab.Screen name="MedicalHistory" component={MedicalHistory} />
    <Tab.Screen name="VitalSign" component={VitalSign} />
    {/* <Tab.Screen name="Profile" component={Profile} /> */}
    <Tab.Screen name="Settings" component={Settings} />
  </Tab.Navigator>
);

// ✅ **Stack Navigator**
const StackNavigator = ({ user }) => {
  return (
    <Stack.Navigator>
      {!user ? (
        <>
          <Stack.Screen name="ZeroScreen" component={ZeroScreen} options={{ headerShown: false }} />
          <Stack.Screen name="FirstScreen" component={FirstScreen} options={{ headerShown: false }} />
          <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ title: 'Login' }} />
          <Stack.Screen name="SignupScreen" component={SignupScreen} options={{ title: 'Sign Up' }} />
          <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} options={{ title: 'ForgotPasswordScreen' }} />
          {/* <Stack.Screen name="QRScannerScreen" component={QRScannerScreen} options={{ title: 'Scan QR' }} /> */}
          {/* <Stack.Screen name="UserDataViewer" component={UserDataViewer} options={{ title: 'User Data' }} /> */}
        </>
        
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} />
          <Stack.Screen name="Allergies" component={Allergies} options={{ title: 'Allergies' }} />
          <Stack.Screen name="Reminders" component={Reminders} options={{ title: 'Reminders' }} />
          <Stack.Screen name="LabResult" component={LabResult} options={{ title: 'Lab Results' }} />
          <Stack.Screen name="Radiology" component={Radiology} options={{ title: 'Radiology' }} />
          {/* <Stack.Screen name="CustomMedicationReminder" component={CustomMedicationReminder} options={{ title: 'Medication Reminder' }} /> */}
          
     
          
          
          {/* Vital Sign Detail Screens */}
          <Stack.Screen 
            name="BloodPressureScreen" 
            component={BloodPressureScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="GlucoseLevelScreen" 
            component={GlucoseLevelScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="TemperatureScreen" 
            component={TemperatureScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="HeartRateScreen" 
            component={HeartRateScreen} 
            options={{ headerShown: false }} 
          />

          <Stack.Screen
            name="CategoryScreen"
            component={CategoryCard}
            options={{
              headerTitle: 'Categories',
              headerTitleAlign: 'center',
              headerStyle: { backgroundColor: '#00BBD3' },
              headerTintColor: '#fff',
              headerShadowVisible: false, 
            }}
          />
          <Stack.Screen
            name="MedicalHistory"
            component={MedicalHistory}
            options={{
              title: 'Medical Record',
              headerStyle: { backgroundColor: '#00C2D4' },
              headerTintColor: '#fff',
              headerTitleAlign: 'center',
            }}
          />
          <Stack.Screen name="TermsAndConditions" component={TermsAndConditions} options={{ title: 'Terms & Conditions' }} /> 
         
        </>
        
      )}
    </Stack.Navigator>
  );
};

export default StackNavigator;