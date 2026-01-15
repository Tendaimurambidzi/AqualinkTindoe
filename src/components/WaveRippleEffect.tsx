import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Ripple {
  id: number;
  x: number;
  y: number;
  anim: Animated.Value;
}

const WaveRippleEffect: React.FC = () => {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  useEffect(() => {
    // Create ripples from bottom at 15 minute intervals (900000ms)
    const interval = setInterval(() => {
      const x = Math.random() * 300 + 50;
      const y = SCREEN_HEIGHT; // Start from bottom
      addRipple(x, y);
    }, 900000); // 15 minutes

    return () => clearInterval(interval);
  }, []);

  const addRipple = (x: number, y: number) => {
    const anim = new Animated.Value(0);
    const id = Date.now();
    
    setRipples(prev => [...prev.slice(-4), { id, x, y, anim }]); // Keep last 5 ripples

    Animated.timing(anim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start(() => {
      // Remove ripple after animation
      setRipples(prev => prev.filter(r => r.id !== id));
    });
  };

  return (
    <View style={styles.container} pointerEvents="none">
      {ripples.map(ripple => {
        const scale = ripple.anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.5, 3.5],
        });
        const opacity = ripple.anim.interpolate({
          inputRange: [0, 0.3, 0.7, 1],
          outputRange: [0.8, 0.6, 0.3, 0],
        });

        return (
          <Animated.View
            key={ripple.id}
            style={[
              styles.ripple,
              {
                left: ripple.x - 40,
                top: ripple.y - 40,
                opacity,
                transform: [{ scale }],
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  ripple: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#00C2FF',
    backgroundColor: 'rgba(0, 194, 255, 0.15)',
  },
});

export default WaveRippleEffect;
