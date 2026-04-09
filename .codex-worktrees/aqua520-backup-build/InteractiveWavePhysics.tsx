import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, PanResponder, Dimensions } from 'react-native';
import type { GestureResponderEvent, PanResponderGestureState } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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

interface InteractiveWavePhysicsProps {
  enabled?: boolean;
}

const InteractiveWavePhysics: React.FC<InteractiveWavePhysicsProps> = ({ enabled = true }) => {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const rippleIdRef = useRef(0);
  const bubbleIdRef = useRef(0);

  const createRipple = (x: number, y: number) => {
    if (!enabled) return;
    
    const anim = new Animated.Value(0);
    const id = rippleIdRef.current++;
    
    setRipples(prev => [...prev.slice(-4), { id, x, y, anim }]);
    
    Animated.timing(anim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    });
  };

  const createBubble = (x: number, y: number) => {
    if (!enabled) return;
    
    const anim = new Animated.Value(0);
    const id = bubbleIdRef.current++;
    
    setBubbles(prev => [...prev.slice(-8), { id, x, y, anim }]);
    
    Animated.timing(anim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start(() => {
      setBubbles(prev => prev.filter(b => b.id !== id));
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => enabled,
      onMoveShouldSetPanResponder: () => enabled,
      onPanResponderGrant: (evt: GestureResponderEvent) => {
        const { locationX, locationY } = evt.nativeEvent;
        createRipple(locationX, locationY);
        createBubble(locationX, locationY);
      },
      onPanResponderMove: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        const { moveX, moveY } = gestureState;
        createBubble(moveX, moveY);
      },
    })
  ).current;

  if (!enabled) return null;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {ripples.map(ripple => (
        <Animated.View
          key={ripple.id}
          style={[
            styles.ripple,
            {
              left: ripple.x - 50,
              top: ripple.y - 50,
              opacity: ripple.anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.6, 0],
              }),
              transform: [
                {
                  scale: ripple.anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 3],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
      {bubbles.map(bubble => (
        <Animated.View
          key={bubble.id}
          style={[
            styles.bubble,
            {
              left: bubble.x - 8,
              top: bubble.y - 8,
              opacity: bubble.anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 0],
              }),
              transform: [
                {
                  translateY: bubble.anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -100],
                  }),
                },
                {
                  scale: bubble.anim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.5, 1, 0.8],
                  }),
                },
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
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    pointerEvents: 'box-none',
  },
  ripple: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#00C2FF',
    backgroundColor: 'rgba(0, 194, 255, 0.25)',
  },
  bubble: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(173, 216, 230, 0.9)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
});

export default InteractiveWavePhysics;
