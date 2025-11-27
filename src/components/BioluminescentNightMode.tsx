import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Plankton {
  id: number;
  x: number;
  y: number;
  anim: Animated.Value;
  size: number;
}

interface BioluminescentNightModeProps {
  enabled?: boolean;
}

const BioluminescentNightMode: React.FC<BioluminescentNightModeProps> = ({ enabled }) => {
  const [isNightTime, setIsNightTime] = useState(false);
  const [planktons, setPlanktons] = useState<Plankton[]>([]);
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const checkNightTime = () => {
      const hour = new Date().getHours();
      // Night time: 8pm (20:00) to 6am (6:00)
      const isNight = hour >= 20 || hour < 6;
      setIsNightTime(isNight && enabled !== false);
    };

    checkNightTime();
    const interval = setInterval(checkNightTime, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [enabled]);

  useEffect(() => {
    if (isNightTime) {
      // Create plankton particles
      const newPlanktons: Plankton[] = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * SCREEN_WIDTH,
        y: Math.random() * SCREEN_HEIGHT,
        anim: new Animated.Value(0),
        size: 2 + Math.random() * 4,
      }));

      setPlanktons(newPlanktons);

      // Animate planktons
      newPlanktons.forEach((plankton, index) => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(plankton.anim, {
              toValue: 1,
              duration: 1000 + Math.random() * 2000,
              delay: index * 100,
              useNativeDriver: true,
            }),
            Animated.timing(plankton.anim, {
              toValue: 0,
              duration: 1000 + Math.random() * 2000,
              useNativeDriver: true,
            }),
          ])
        ).start();
      });

      // Global glow animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    return () => {
      setPlanktons([]);
    };
  }, [isNightTime]);

  if (!isNightTime) return null;

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.05, 0.15],
  });

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Global bioluminescent glow */}
      <Animated.View
        style={[
          styles.globalGlow,
          {
            opacity: glowOpacity,
            backgroundColor: '#00FFD1',
          },
        ]}
      />

      {/* Plankton particles */}
      {planktons.map((plankton) => {
        const opacity = plankton.anim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.2, 1, 0.2],
        });

        const scale = plankton.anim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.8, 1.2, 0.8],
        });

        return (
          <Animated.View
            key={plankton.id}
            style={[
              styles.plankton,
              {
                left: plankton.x,
                top: plankton.y,
                width: plankton.size,
                height: plankton.size,
                borderRadius: plankton.size / 2,
                opacity,
                transform: [{ scale }],
              },
            ]}
          />
        );
      })}

      {/* Edge glow effect */}
      <View style={styles.edgeGlow} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
  },
  globalGlow: {
    ...StyleSheet.absoluteFillObject,
  },
  plankton: {
    position: 'absolute',
    backgroundColor: '#00FFD1',
    shadowColor: '#00FFD1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 5,
  },
  edgeGlow: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderColor: 'rgba(0, 255, 209, 0.3)',
    borderRadius: 0,
  },
});

export default BioluminescentNightMode;
