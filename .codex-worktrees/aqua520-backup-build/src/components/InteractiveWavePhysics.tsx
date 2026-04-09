// @ts-nocheck
import React, { useRef, useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Animated, 
  PanResponder, 
  Dimensions,
  DeviceEventEmitter,
  Vibration,
} from 'react-native';
import { accelerometer, setUpdateIntervalForType, SensorTypes } from 'react-native-sensors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface InteractiveWavePhysicsProps {
  enabled: boolean;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
  anim: Animated.Value;
}

interface Bubble {
  id: number;
  x: number;
  y: number;
  anim: Animated.Value;
}

const InteractiveWavePhysics: React.FC<InteractiveWavePhysicsProps> = ({ enabled }) => {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [stormActive, setStormActive] = useState(false);
  const stormAnim = useRef(new Animated.Value(0)).current;
  const driftX = useRef(new Animated.Value(0)).current;
  const driftY = useRef(new Animated.Value(0)).current;

  // Shake detection for storms
  useEffect(() => {
    if (!enabled) return;

    let subscription: any;
    try {
      setUpdateIntervalForType(SensorTypes.accelerometer, 100);
      subscription = accelerometer.subscribe(({ x, y, z }) => {
        const acceleration = Math.sqrt(x * x + y * y + z * z);
        if (acceleration > 20) {
          triggerStorm();
        }
      });
    } catch (e) {
      console.log('Accelerometer not available');
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [enabled]);

  // Tilt to drift
  useEffect(() => {
    if (!enabled) return;

    let subscription: any;
    try {
      subscription = accelerometer.subscribe(({ x, y }) => {
        Animated.spring(driftX, {
          toValue: x * 10,
          friction: 5,
          useNativeDriver: true,
        }).start();

        Animated.spring(driftY, {
          toValue: y * 10,
          friction: 5,
          useNativeDriver: true,
        }).start();
      });
    } catch (e) {
      console.log('Tilt sensor not available');
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [enabled]);

  const triggerStorm = () => {
    if (stormActive) return;
    
    setStormActive(true);
    Vibration.vibrate([0, 100, 50, 100, 50, 200]);

    Animated.sequence([
      Animated.timing(stormAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(stormAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setStormActive(false));

    // Create lightning effect
    DeviceEventEmitter.emit('storm-triggered');
  };

  const createRipple = (x: number, y: number) => {
    const newRipple: Ripple = {
      id: Date.now() + Math.random(),
      x,
      y,
      anim: new Animated.Value(0),
    };

    setRipples((prev) => [...prev, newRipple]);

    Animated.timing(newRipple.anim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    });

    Vibration.vibrate(10);
  };

  const createBubble = (x: number, y: number) => {
    const newBubble: Bubble = {
      id: Date.now() + Math.random(),
      x,
      y,
      anim: new Animated.Value(0),
    };

    setBubbles((prev) => [...prev, newBubble]);

    Animated.timing(newBubble.anim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start(() => {
      setBubbles((prev) => prev.filter((b) => b.id !== newBubble.id));
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => enabled,
      onMoveShouldSetPanResponder: () => enabled,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        createRipple(locationX, locationY);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        createBubble(locationX, locationY);
      },
    })
  ).current;

  if (!enabled) return null;

  const stormOpacity = stormAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3],
  });

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {/* Storm overlay */}
      {stormActive && (
        <Animated.View 
          style={[
            styles.stormOverlay,
            { opacity: stormOpacity, backgroundColor: '#FFFFFF' },
          ]} 
        />
      )}

      {/* Drift container */}
      <Animated.View
        style={[
          styles.driftContainer,
          {
            transform: [
              { translateX: driftX },
              { translateY: driftY },
            ],
          },
        ]}
      >
        {/* Ripples */}
        {ripples.map((ripple) => {
          const scale = ripple.anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 3],
          });

          const opacity = ripple.anim.interpolate({
            inputRange: [0, 0.2, 1],
            outputRange: [0.8, 0.6, 0],
          });

          return (
            <Animated.View
              key={ripple.id}
              style={[
                styles.ripple,
                {
                  left: ripple.x - 50,
                  top: ripple.y - 50,
                  transform: [{ scale }],
                  opacity,
                },
              ]}
            />
          );
        })}

        {/* Bubbles */}
        {bubbles.map((bubble) => {
          const translateY = bubble.anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -200],
          });

          const opacity = bubble.anim.interpolate({
            inputRange: [0, 0.8, 1],
            outputRange: [0.6, 0.6, 0],
          });

          const scale = bubble.anim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0.5, 1, 1.2],
          });

          return (
            <Animated.View
              key={bubble.id}
              style={[
                styles.bubble,
                {
                  left: bubble.x - 10,
                  top: bubble.y - 10,
                  transform: [{ translateY }, { scale }],
                  opacity,
                },
              ]}
            />
          );
        })}
      </Animated.View>
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
    zIndex: 100,
  },
  stormOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 200,
  },
  driftContainer: {
    flex: 1,
  },
  ripple: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#00C2FF',
    backgroundColor: 'transparent',
  },
  bubble: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 194, 255, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
});

export default InteractiveWavePhysics;
