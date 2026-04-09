import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';

interface OceanLoadingProps {
  size?: number;
  color?: string;
}

const OceanLoading: React.FC<OceanLoadingProps> = ({ size = 60, color = '#00C2FF' }) => {
  const wave1 = useRef(new Animated.Value(0)).current;
  const wave2 = useRef(new Animated.Value(0)).current;
  const wave3 = useRef(new Animated.Value(0)).current;
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Wave animations
    const waveAnimation = Animated.loop(
      Animated.stagger(200, [
        Animated.sequence([
          Animated.timing(wave1, {
            toValue: 1,
            duration: 800,
            easing: Easing.bezier(0.45, 0.05, 0.55, 0.95),
            useNativeDriver: true,
          }),
          Animated.timing(wave1, {
            toValue: 0,
            duration: 800,
            easing: Easing.bezier(0.45, 0.05, 0.55, 0.95),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(wave2, {
            toValue: 1,
            duration: 800,
            easing: Easing.bezier(0.45, 0.05, 0.55, 0.95),
            useNativeDriver: true,
          }),
          Animated.timing(wave2, {
            toValue: 0,
            duration: 800,
            easing: Easing.bezier(0.45, 0.05, 0.55, 0.95),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(wave3, {
            toValue: 1,
            duration: 800,
            easing: Easing.bezier(0.45, 0.05, 0.55, 0.95),
            useNativeDriver: true,
          }),
          Animated.timing(wave3, {
            toValue: 0,
            duration: 800,
            easing: Easing.bezier(0.45, 0.05, 0.55, 0.95),
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    // Rotation animation
    const rotateAnimation = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    waveAnimation.start();
    rotateAnimation.start();

    return () => {
      waveAnimation.stop();
      rotateAnimation.stop();
    };
  }, []);

  const getWaveStyle = (animValue: Animated.Value) => {
    const translateY = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -size * 0.3],
    });
    const opacity = animValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.4, 1, 0.4],
    });

    return {
      transform: [{ translateY }],
      opacity,
    };
  };

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Rotating outer ring */}
      <Animated.View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: color,
            transform: [{ rotate }],
          },
        ]}
      />

      {/* Wave dots */}
      <View style={styles.wavesContainer}>
        <Animated.View
          style={[
            styles.waveDot,
            {
              backgroundColor: color,
              width: size * 0.15,
              height: size * 0.15,
              borderRadius: size * 0.075,
            },
            getWaveStyle(wave1),
          ]}
        />
        <Animated.View
          style={[
            styles.waveDot,
            {
              backgroundColor: color,
              width: size * 0.15,
              height: size * 0.15,
              borderRadius: size * 0.075,
            },
            getWaveStyle(wave2),
          ]}
        />
        <Animated.View
          style={[
            styles.waveDot,
            {
              backgroundColor: color,
              width: size * 0.15,
              height: size * 0.15,
              borderRadius: size * 0.075,
            },
            getWaveStyle(wave3),
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 2,
    opacity: 0.3,
  },
  wavesContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  waveDot: {
    shadowColor: '#00C2FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
});

export default OceanLoading;
