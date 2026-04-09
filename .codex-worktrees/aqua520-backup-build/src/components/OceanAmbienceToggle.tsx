import React, { useRef, useEffect } from 'react';
import { View, Pressable, Text, StyleSheet, Animated, Easing } from 'react-native';

interface OceanAmbienceToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

const OceanAmbienceToggle: React.FC<OceanAmbienceToggleProps> = ({ enabled, onToggle }) => {
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (enabled) {
      // Animate wave pulsing when enabled
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(waveAnim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      waveAnim.setValue(0);
    }
  }, [enabled]);

  const scale = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  return (
    <View style={styles.container}>
      <Pressable
        style={[
          styles.button,
          enabled && styles.buttonActive,
        ]}
        onPress={() => onToggle(!enabled)}
      >
        <Animated.Text
          style={[
            styles.icon,
            {
              transform: [{ scale }],
            },
          ]}
        >
          {enabled ? '🌊' : '🔇'}
        </Animated.Text>
        <Text style={[styles.label, enabled && { color: '#00FFFF' }]}>
          {enabled ? 'Waves On' : 'Silent'}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 140,
    right: 16,
    zIndex: 500,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
     backgroundColor: '#8B0000', // deep red
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
     borderColor: '#5A0000', // deeper red
  },
  buttonActive: {
     backgroundColor: '#8B0000', // deep red
     borderColor: '#5A0000', // deeper red
     shadowColor: '#8B0000', // deep red
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  icon: {
    fontSize: 24,
  },
  label: {
    position: 'absolute',
    bottom: -20,
    fontSize: 9,
    color: '#00C2FF',
    fontWeight: '600',
  },
});

export default OceanAmbienceToggle;
