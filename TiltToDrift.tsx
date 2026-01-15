// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';
import { gyroscope, setUpdateIntervalForType, SensorTypes } from 'react-native-sensors';

interface TiltToDriftProps {
  enabled?: boolean;
}

const TiltToDrift: React.FC<TiltToDriftProps> = ({ enabled = true }) => {
  const [offsetX] = useState(new Animated.Value(0));
  const [offsetY] = useState(new Animated.Value(0));

  useEffect(() => {
    if (!enabled) return;

    try {
      setUpdateIntervalForType(SensorTypes.gyroscope, 50);

      const subscription = gyroscope.subscribe(({ x, y }) => {
        Animated.parallel([
          Animated.timing(offsetX, {
            toValue: Math.max(-30, Math.min(30, y * 50)),
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(offsetY, {
            toValue: Math.max(-30, Math.min(30, x * 50)),
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();
      });

      return () => subscription.unsubscribe();
    } catch (error) {
      console.log('Gyroscope not available');
    }
  }, [enabled, offsetX, offsetY]);

  if (!enabled) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateX: offsetX },
            { translateY: offsetY },
          ],
        },
      ]}
      pointerEvents="none"
    >
      <View style={styles.oceanFloor}>
        <Text style={styles.coral}>🪸</Text>
        <Text style={[styles.coral, styles.coral2]}>🪸</Text>
        <Text style={styles.shell}>🐚</Text>
        <Text style={[styles.shell, styles.shell2]}>🐚</Text>
        <Text style={styles.starfish}>⭐</Text>
        <Text style={[styles.starfish, styles.starfish2]}>⭐</Text>
        <Text style={styles.seaweed}>🌿</Text>
        <Text style={[styles.seaweed, styles.seaweed2]}>🌿</Text>
        <Text style={[styles.seaweed, styles.seaweed3]}>🌿</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  oceanFloor: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
    backgroundColor: 'rgba(0, 50, 100, 0.15)',
  },
  coral: {
    position: 'absolute',
    fontSize: 40,
    bottom: 20,
    left: '10%',
  },
  coral2: {
    left: '70%',
    bottom: 30,
    fontSize: 35,
  },
  shell: {
    position: 'absolute',
    fontSize: 25,
    bottom: 15,
    left: '30%',
  },
  shell2: {
    left: '85%',
    bottom: 10,
    fontSize: 30,
  },
  starfish: {
    position: 'absolute',
    fontSize: 30,
    bottom: 25,
    left: '50%',
  },
  starfish2: {
    left: '90%',
    bottom: 35,
    fontSize: 25,
  },
  seaweed: {
    position: 'absolute',
    fontSize: 45,
    bottom: 0,
    left: '20%',
    opacity: 0.7,
  },
  seaweed2: {
    left: '60%',
    fontSize: 50,
  },
  seaweed3: {
    left: '80%',
    fontSize: 40,
  },
});

export default TiltToDrift;
