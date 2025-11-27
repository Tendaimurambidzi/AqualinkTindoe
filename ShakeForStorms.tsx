// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { accelerometer, setUpdateIntervalForType, SensorTypes } from 'react-native-sensors';

interface Raindrop {
  id: number;
  x: number;
  anim: Animated.Value;
  delay: number;
}

interface ShakeForStormsProps {
  enabled?: boolean;
}

const ShakeForStorms: React.FC<ShakeForStormsProps> = ({ enabled = true }) => {
  const [stormStrength, setStormStrength] = useState(0);
  const [raindrops, setRaindrops] = useState<Raindrop[]>([]);
  const raindropIdRef = useRef(0);
  const stormTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) return;

    try {
      setUpdateIntervalForType(SensorTypes.accelerometer, 100);

      const subscription = accelerometer.subscribe(({ x, y, z }) => {
        const acceleration = Math.sqrt(x * x + y * y + z * z);
        const base = 9;
        const peak = 35;
        const strength = Math.max(0, Math.min(1, (acceleration - base) / (peak - base)));
        if (strength > 0) {
          setStormStrength(strength);
          if (stormTimeoutRef.current) {
            clearTimeout(stormTimeoutRef.current);
          }
          stormTimeoutRef.current = setTimeout(() => {
            setStormStrength(0);
          }, 2000);
        }
      });

      return () => {
        subscription.unsubscribe();
        if (stormTimeoutRef.current) {
          clearTimeout(stormTimeoutRef.current);
        }
      };
    } catch (error) {
      console.log('Shake sensor not available');
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled || stormStrength <= 0) {
      setRaindrops([]);
      return;
    }

    const intervalDuration = Math.max(100, 420 - stormStrength * 260);
    const interval = setInterval(() => {
      const dropCount = Math.max(4, Math.round(12 * stormStrength));
      const newDrops: Raindrop[] = [];
      for (let i = 0; i < dropCount; i++) {
        const anim = new Animated.Value(0);
        const id = raindropIdRef.current++;
        const delay = Math.random() * 200;
        newDrops.push({
          id,
          x: Math.random() * 100,
          anim,
          delay,
        });

        Animated.timing(anim, {
          toValue: 1,
          duration: Math.max(600, 1200 - stormStrength * 400),
          delay,
          useNativeDriver: true,
        }).start();
      }

      setRaindrops(prev => [...prev.slice(-60), ...newDrops]);
    }, intervalDuration);

    return () => clearInterval(interval);
  }, [stormStrength, enabled]);

  if (!enabled) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {stormStrength > 0 && (
        <>
          {raindrops.map(drop => (
            <Animated.View
              key={drop.id}
              style={[
                styles.raindrop,
                {
                  left: `${drop.x}%`,
                  opacity: drop.anim.interpolate({
                    inputRange: [0, 0.1, 0.9, 1],
                    outputRange: [0, 0.6, 0.6, 0],
                  }),
                  transform: [
                    {
                      translateY: drop.anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-20, 800],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 150,
  },
  raindrop: {
    position: 'absolute',
    width: 3,
    height: 25,
    backgroundColor: 'rgba(173, 216, 230, 0.8)',
    borderRadius: 2,
    top: -20,
  },
});

export default ShakeForStorms;
