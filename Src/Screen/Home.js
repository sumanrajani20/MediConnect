import React from 'react';
import { SafeAreaView, View, Text } from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import CategoryCard from './CategoryCard';

const Home = ({ navigation }) => {
  const categories = [
    { id: 1, title: 'Medical History', screen: 'MedicalHistory', icon: <Entypo name="text-document" size={40} color="#FFFFFF" /> },
    { id: 2, title: 'Allergies', screen: 'Allergies', icon: <Entypo name="feather" size={40} color="#FFFFFF" /> },
    { id: 3, title: 'Lab Result', screen: 'LabResult', icon: <Entypo name="lab-flask" size={40} color="#FFFFFF" /> },
    { id: 4, title: 'Radiology', screen: 'Radiology', icon: <Entypo name="image" size={40} color="#FFFFFF" /> },
    { id: 5, title: 'Reminders', screen: 'Reminders', icon: <Entypo name="bell" size={40} color="#FFFFFF" /> },
    { id: 6, title: 'Vital Sign', screen: 'VitalSign', icon: <Entypo name="heart" size={40} color="#FFFFFF" /> },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#F4F8FB]">
      <View className="flex-row flex-wrap justify-between p-4">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            title={category.title}
            icon={category.icon}
            onPress={() => navigation.navigate(category.screen)}
          />
        ))}
      </View>
    </SafeAreaView>
  );
};

export default Home;
