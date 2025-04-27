import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';

const TermsAndConditions = ({ navigation }) => {
  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Terms & Conditions', // Centered title
      headerTitleAlign: 'center',
      headerStyle: {
        backgroundColor: '#00C2D4', // Gradient-like color
      },
      headerTintColor: '#fff',
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
            source={require('../../assets/custom-arrow.png')} // Add your custom arrow image
            style={{ width: 20, height: 20, resizeMode: 'contain' }}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Content */}
      <ScrollView style={styles.content}>
        <Text style={styles.lastUpdate}>Last Update: 1/01/2025</Text>
        <Text style={styles.description}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent pellentesque congue lorem,
          vel tincidunt tortor placerat a. Proin ac diam quam. Aenean in sagittis magna, ut feugiat diam.
        </Text>
        <Text style={styles.description}>
          Nunc auctor tortor in dolor luctus, quis euismod urna tincidunt. Vestibulum lobortis enim vel neque
          auctor, a ultrices ex placerat. Mauris ut lacinia justo, sed suscipit tortor.
        </Text>

        <Text style={styles.sectionTitle}>Terms & Conditions</Text>
        <Text style={styles.terms}>
          1. Ut lacinia justo sit amet lorem sodales accumsan. Proin malesuada eleifend fermentum.
        </Text>
        <Text style={styles.terms}>
          2. Donec condimentum, nunc at rhoncus faucibus, ex nisi laoreet ipsum, eu pharetra eros est vitae orci.
        </Text>
        <Text style={styles.terms}>
          3. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin ac diam quam.
        </Text>
        <Text style={styles.terms}>
          4. Vestibulum lobortis enim vel neque auctor, a ultrices ex placerat.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  lastUpdate: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#00BBD3',
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  terms: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
    lineHeight: 20,
  },
});

export default TermsAndConditions;