import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, Animated, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OceanDialogProps {
  visible: boolean;
  title: string;
  message: string;
  buttons?: Array<{ text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }>;
  onDismiss?: () => void;
}

const OceanDialog: React.FC<OceanDialogProps> = ({ visible, title, message, buttons = [], onDismiss }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const ripples = useRef([new Animated.Value(0), new Animated.Value(0)]).current;

  useEffect(() => {
    if (visible) {
      ripples.forEach(r => r.setValue(0));
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
      
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 80, useNativeDriver: true }),
      ]).start();

      // Background ripple animation
      Animated.loop(
        Animated.stagger(1200, [
          Animated.timing(ripples[0], { toValue: 1, duration: 2400, useNativeDriver: true }),
          Animated.timing(ripples[1], { toValue: 1, duration: 2400, useNativeDriver: true }),
        ])
      ).start();
    } else {
      ripples.forEach(r => r.setValue(0));
    }
  }, [visible]);

  const handleDismiss = () => {
    if (onDismiss) onDismiss();
  };

  const handleButtonPress = (onPress?: () => void) => {
    if (onPress) onPress();
    handleDismiss();
  };

  const defaultButtons = buttons.length > 0 ? buttons : [{ text: 'OK', onPress: handleDismiss }];

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleDismiss}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        {/* Animated ripples in background */}
        {ripples.map((ripple, i) => {
          const scale = ripple.interpolate({ inputRange: [0, 1], outputRange: [0.5, 2] });
          const opacity = ripple.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 0.15, 0] });
          return (
            <Animated.View
              key={i}
              style={[
                styles.ripple,
                {
                  transform: [{ scale }],
                  opacity,
                },
              ]}
            />
          );
        })}

        <Animated.View style={[styles.dialog, { transform: [{ scale: scaleAnim }] }]}>
          {/* Wave decoration at top */}
          <View style={styles.waveDecoration}>
            <Text style={styles.waveIcon}>〰️</Text>
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonContainer}>
            {defaultButtons.map((btn, idx) => (
              <Pressable
                key={idx}
                style={[
                  styles.button,
                  btn.style === 'cancel' && styles.cancelButton,
                  btn.style === 'destructive' && styles.destructiveButton,
                  defaultButtons.length === 1 && styles.singleButton,
                ]}
                onPress={() => handleButtonPress(btn.onPress)}
              >
                <Text
                  style={[
                    styles.buttonText,
                    btn.style === 'destructive' && styles.destructiveText,
                  ]}
                >
                  {btn.text}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 10, 20, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  ripple: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 2,
    borderColor: '#00C2FF',
  },
  dialog: {
    width: Math.min(SCREEN_WIDTH - 40, 320),
    backgroundColor: '#0A1929',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#00C2FF',
    shadowColor: '#00C2FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  waveDecoration: {
    alignItems: 'center',
    marginBottom: 12,
  },
  waveIcon: {
    fontSize: 24,
    opacity: 0.6,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00C2FF',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 194, 255, 0.5)',
    textShadowRadius: 8,
  },
  message: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 194, 255, 0.2)',
    borderWidth: 1,
    borderColor: '#00C2FF',
    alignItems: 'center',
  },
  singleButton: {
    flex: 0,
    minWidth: 120,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  destructiveButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    borderColor: '#FF3B30',
  },
  buttonText: {
    color: '#00C2FF',
    fontSize: 16,
    fontWeight: '600',
  },
  destructiveText: {
    color: '#FF6B6B',
  },
});

export default OceanDialog;
