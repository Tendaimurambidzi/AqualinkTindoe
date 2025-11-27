import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';

interface BioluminescentTapEffectProps {
  x: number;
  y: number;
  onComplete: () => void;
}

const BioluminescentTapEffect: React.FC<BioluminescentTapEffectProps> = ({ x, y, onComplete }) => {
  const particles = useRef(
    Array.from({ length: 12 }, () => ({
      opacity: new Animated.Value(1),
      scale: new Animated.Value(0.3),
      translateX: new Animated.Value(0),
      translateY: new Animated.Value(0),
      angle: Math.random() * Math.PI * 2,
    }))
  ).current;

  useEffect(() => {
    const animations = particles.map((particle, i) => {
      const distance = 40 + Math.random() * 60;
      return Animated.parallel([
        Animated.timing(particle.opacity, {
          toValue: 0,
          duration: 800 + Math.random() * 400,
          useNativeDriver: true,
        }),
        Animated.timing(particle.scale, {
          toValue: 1 + Math.random() * 0.5,
          duration: 800 + Math.random() * 400,
          useNativeDriver: true,
        }),
        Animated.timing(particle.translateX, {
          toValue: Math.cos(particle.angle) * distance,
          duration: 800 + Math.random() * 400,
          useNativeDriver: true,
        }),
        Animated.timing(particle.translateY, {
          toValue: Math.sin(particle.angle) * distance,
          duration: 800 + Math.random() * 400,
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.parallel(animations).start(onComplete);
  }, []);

  return (
    <View style={[styles.container, { left: x - 6, top: y - 6 }]} pointerEvents="none">
      {particles.map((particle, i) => (
        <Animated.View
          key={i}
          style={[
            styles.particle,
            {
              opacity: particle.opacity,
              transform: [
                { translateX: particle.translateX },
                { translateY: particle.translateY },
                { scale: particle.scale },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 12,
    height: 12,
    zIndex: 9999,
  },
  particle: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00FFE6',
    shadowColor: '#00FFE6',
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 5,
  },
});

export default BioluminescentTapEffect;
