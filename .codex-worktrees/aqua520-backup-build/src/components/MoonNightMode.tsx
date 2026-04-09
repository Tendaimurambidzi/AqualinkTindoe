import React, { useEffect, useState, useRef } from 'react';
import { Animated, View, StyleSheet, Dimensions, Text } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const MoonNightMode: React.FC = () => {
  const [isNight, setIsNight] = useState(false);
  const moonOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Check time of day - simplified to avoid crashes
    try {
      const hour = new Date().getHours();
      const shouldBeNight = hour >= 19 || hour < 6; // 7pm to 6am
      setIsNight(shouldBeNight);
      
      Animated.timing(moonOpacity, {
        toValue: shouldBeNight ? 0.8 : 0,
        duration: 2000,
        useNativeDriver: true,
      }).start();
    } catch (err) {
      console.log('Night mode check error:', err);
    }
  }, []);

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Moon */}
      <Animated.View style={[styles.moonContainer, { opacity: moonOpacity }]}>
        <Text style={styles.moon}>🌙</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  moonContainer: {
    position: 'absolute',
    top: 60,
    right: 40,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moon: {
    fontSize: 60,
  },
});

export default MoonNightMode;
