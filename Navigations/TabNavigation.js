import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import Home from '../Src/Screen/Home';
import MedicalHistory from '../Src/Screen/MedicalHistory';
import VitalSign from '../Src/Screen/VitalSign';
import Settings from '../Src/Screen/Settings';

const Tab = createBottomTabNavigator();

const TabNavigation = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Medical History" component={MedicalHistory} />
      <Tab.Screen name="Vital Sign" component={VitalSign} />
      <Tab.Screen name="Settings" component={Settings} />
    </Tab.Navigator>
  );
};

export default TabNavigation;
