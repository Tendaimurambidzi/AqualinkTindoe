import React, { useRef, useEffect, useState } from 'react';
import { Pressable, Animated, StyleSheet, ViewStyle } from 'react-native';

interface WaveButtonProps {
  onPress: () => void | Promise<void>;
  style?: ViewStyle | ViewStyle[];
  children: React.ReactNode;
  hitSlop?: number | { top?: number; bottom?: number; left?: number; right?: number };
}

const WaveButton: React.FC<WaveButtonProps> = ({ onPress, style, children, hitSlop }) => {
  const ripple1 = useRef(new Animated.Value(0)).current;
  const ripple2 = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePressIn = () => {
    // Scale down slightly
    Animated.spring(scale, {
      toValue: 0.95,
      friction: 3,
      useNativeDriver: true,
    }).start();

    // Ripple effect
    ripple1.setValue(0);
    ripple2.setValue(0);
    Animated.stagger(100, [
      Animated.timing(ripple1, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(ripple2, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    // Scale back to normal
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const getRippleStyle = (rippleAnim: Animated.Value) => {
    const rippleScale = rippleAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 2],
    });
    const rippleOpacity = rippleAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.5, 0.3, 0],
    });

    return {
      transform: [{ scale: rippleScale }],
      opacity: rippleOpacity,
    };
  };

  const handlePress = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await Promise.resolve(onPress());
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Pressable
      onPress={() => {
        void handlePress();
      }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isProcessing}
      hitSlop={hitSlop}
      style={style}
    >
      <Animated.View
        style={{
          transform: [{ scale }],
          position: 'relative',
          opacity: isProcessing ? 0.7 : 1,
        }}
      >
        {children}
        {/* Ripple effects */}
        <Animated.View style={[styles.ripple, getRippleStyle(ripple1)]} pointerEvents="none" />
        <Animated.View style={[styles.ripple, getRippleStyle(ripple2)]} pointerEvents="none" />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  ripple: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 20,
    height: 20,
    borderRadius: 10,
    marginLeft: -10,
    marginTop: -10,
    borderWidth: 2,
    borderColor: '#00C2FF',
    backgroundColor: 'transparent',
  },
});

export default WaveButton;
