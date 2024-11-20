import { Settings, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import VitalSign from '../Src/Screen/VitalSign'
import MedicalHistory from '../Src/Screen/MedicalHistory'


const Tab = createBottomTabNavigator()
const TabNavigation = () => {
  return (
   <Tab.Navigator>
    <Tab.Screen name="Home" component={Home} />
    <Tab.Screen name="Medicalhistory" component={MedicalHistoryS} />
    <Tab.Screen name="VitalSign" component={VitalSign} />
    <Tab.Screen name="Settings" component={Settings} />
   </Tab.Navigator>
  )
}

export default TabNavigation

const styles = StyleSheet.create({})