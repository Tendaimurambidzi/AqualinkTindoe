import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface WaterBubble {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
}

const FloatingWaterAnimation: React.FC = () => {
  const bubbles: WaterBubble[] = [
    { id: 1, x: 10, size: 40, duration: 4000, delay: 0 },
    { id: 2, x: 30, size: 25, duration: 5000, delay: 500 },
    { id: 3, x: 50, size: 35, duration: 4500, delay: 1000 },
    { id: 4, x: 70, size: 30, duration: 5500, delay: 1500 },
    { id: 5, x: 85, size: 20, duration: 4200, delay: 800 },
    { id: 6, x: 15, size: 28, duration: 4800, delay: 1200 },
    { id: 7, x: 60, size: 22, duration: 5200, delay: 600 },
    { id: 8, x: 40, size: 32, duration: 4600, delay: 1400 },
  ];

  return (
    <View style={styles.container} pointerEvents="none">
      {bubbles.map(bubble => (
        <BubbleAnimation key={bubble.id} bubble={bubble} />
      ))}
    </View>
  );
};

const BubbleAnimation: React.FC<{ bubble: WaterBubble }> = ({ bubble }) => {
  const animY = useRef(new Animated.Value(1)).current;
  const animX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      // Fade in
      Animated.timing(opacity, {
        toValue: 0.6,
        duration: 500,
        delay: bubble.delay,
        useNativeDriver: true,
      }).start();

      // Float up and sway
      Animated.loop(
        Animated.parallel([
          Animated.timing(animY, {
            toValue: 0,
            duration: bubble.duration,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(animX, {
              toValue: 1,
              duration: bubble.duration / 2,
              useNativeDriver: true,
            }),
            Animated.timing(animX, {
              toValue: -1,
              duration: bubble.duration / 2,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    };

    animate();
  }, []);

  return (
    <Animated.View
      style={[
        styles.bubble,
        {
          left: `${bubble.x}%`,
          width: bubble.size,
          height: bubble.size,
          borderRadius: bubble.size / 2,
          opacity,
          transform: [
            {
              translateY: animY.interpolate({
                inputRange: [0, 1],
                outputRange: [-800, 0],
              }),
            },
            {
              translateX: animX.interpolate({
                inputRange: [-1, 1],
                outputRange: [-20, 20],
              }),
            },
          ],
        },
      ]}
    />
  );
};



const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  bubble: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'rgba(178, 0, 0, 0.7)', // blood red
    borderWidth: 2,
    borderColor: 'rgba(120, 0, 0, 0.9)', // darker blood red
  },
});

export default FloatingWaterAnimation;
