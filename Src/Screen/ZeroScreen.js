import React, { useRef, useEffect } from 'react';
import { Animated } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';

const ZeroScreen = ({ navigation }) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 5000,
          useNativeDriver: true,
        }),
        Animated.timing(translateAnim, {
          toValue: -100,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      navigation.replace('FirstScreen');
    });
  }, [rotateAnim, fadeAnim, translateAnim, navigation]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={{
        flex: 1,
        opacity: fadeAnim,
        transform: [{ translateY: translateAnim }],
      }}
    >
      <Surface style={{ flex: 1 }}>
        <LinearGradient
          colors={['#33E4DB', '#00BBD3']}
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Animated.Image
            source={require('../../assets/mediConnect.png')}
            style={{
              width: 250,
              height: 250,
              transform: [{ rotate: rotateInterpolate }],
            }}
            resizeMode="contain"
          />
          <Text
            variant="displayMedium"
            style={{
              fontWeight: 'bold',
              color: '#fff',
              marginTop: 10,
            }}
          >
            MediConnect
          </Text>
        </LinearGradient>
      </Surface>
    </Animated.View>
  );
};

export default ZeroScreen;
