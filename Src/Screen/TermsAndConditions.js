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
          Welcome to our Healthcare Application. This mobile application is designed to help you manage your health information, 
          schedule appointments, and communicate with healthcare providers securely.
        </Text>
        <Text style={styles.description}>
          By downloading, accessing, or using this application, you agree to be bound by these Terms and Conditions. 
          Please read them carefully before using our services. If you do not agree with any part of these terms, 
          you may not use our application.
        </Text>

        <Text style={styles.sectionTitle}>1. Healthcare Services</Text>
        <Text style={styles.terms}>
          1.1 Our application provides access to healthcare information and services but does not replace professional medical advice, 
          diagnosis, or treatment. Always consult with qualified healthcare professionals regarding your health concerns.
        </Text>
        <Text style={styles.terms}>
          1.2 The information provided through this application is for general informational purposes only and should not be 
          considered as medical advice or used for self-diagnosis.
        </Text>
        <Text style={styles.terms}>
          1.3 In case of medical emergency, contact emergency services immediately and do not rely solely on this application.
        </Text>

        <Text style={styles.sectionTitle}>2. User Responsibilities</Text>
        <Text style={styles.terms}>
          2.1 You are responsible for maintaining the confidentiality of your account information and password.
        </Text>
        <Text style={styles.terms}>
          2.2 You agree to provide accurate, current, and complete information during registration and to update such information 
          to keep it accurate, current, and complete.
        </Text>
        <Text style={styles.terms}>
          2.3 You are solely responsible for all activities that occur under your account.
        </Text>
        <Text style={styles.terms}>
          2.4 You agree not to use the application for any unlawful purpose or in any way that could damage, disable, or impair our services.
        </Text>

        <Text style={styles.sectionTitle}>3. Data Privacy</Text>
        <Text style={styles.terms}>
          3.1 We collect and process your personal and health information in accordance with our Privacy Policy and applicable 
          healthcare privacy laws, including HIPAA (Health Insurance Portability and Accountability Act) where applicable.
        </Text>
        <Text style={styles.terms}>
          3.2 We implement industry-standard security measures to protect your information, but we cannot guarantee its absolute security.
        </Text>
        <Text style={styles.terms}>
          3.3 You consent to the collection, use, and processing of your information as described in our Privacy Policy when you use our application.
        </Text>
        <Text style={styles.terms}>
          3.4 You have the right to access, correct, or delete your personal information as permitted by applicable laws.
        </Text>

        <Text style={styles.sectionTitle}>4. Liability Disclaimers</Text>
        <Text style={styles.terms}>
          4.1 The application and its content are provided "as is" and "as available" without warranties of any kind, either express or implied.
        </Text>
        <Text style={styles.terms}>
          4.2 We do not warrant that the application will be uninterrupted, timely, secure, or error-free, or that defects will be corrected.
        </Text>
        <Text style={styles.terms}>
          4.3 We are not liable for any direct, indirect, incidental, special, consequential, or punitive damages resulting from your use 
          or inability to use the application or its content.
        </Text>
        <Text style={styles.terms}>
          4.4 In no event shall our total liability exceed the amount paid by you, if any, for accessing our application.
        </Text>

        <Text style={styles.sectionTitle}>5. Intellectual Property</Text>
        <Text style={styles.terms}>
          5.1 All content, features, and functionality of the application, including but not limited to text, graphics, logos, and software, 
          are owned by us or our licensors and are protected by copyright, trademark, and other intellectual property laws.
        </Text>
        <Text style={styles.terms}>
          5.2 You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, 
          download, store, or transmit any of the material on our application without our prior written consent.
        </Text>

        <Text style={styles.sectionTitle}>6. Termination</Text>
        <Text style={styles.terms}>
          6.1 We may terminate or suspend your account and access to the application at any time, without prior notice or liability, 
          for any reason, including without limitation if you breach these Terms and Conditions.
        </Text>
        <Text style={styles.terms}>
          6.2 Upon termination, your right to use the application will immediately cease. All provisions of these Terms which by their 
          nature should survive termination shall survive, including without limitation ownership provisions, warranty disclaimers, 
          indemnity, and limitations of liability.
        </Text>

        <Text style={styles.sectionTitle}>7. Changes to Terms</Text>
        <Text style={styles.terms}>
          7.1 We reserve the right to modify these Terms and Conditions at any time. We will notify users of any material changes 
          through the application or via email.
        </Text>
        <Text style={styles.terms}>
          7.2 Your continued use of the application after such modifications constitutes your acceptance of the revised Terms and Conditions.
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
