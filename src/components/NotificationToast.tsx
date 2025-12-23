import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Image, ImageSourcePropType, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  visible: boolean;
  message: string;
  kind: 'positive' | 'negative';
  logo?: ImageSourcePropType | { text: string; backgroundColor: string; color: string } | null;
};

const NotificationToast: React.FC<Props> = ({ visible, message, kind, logo }) => {
  const { width, height } = useWindowDimensions();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: visible ? 1 : 0,
      duration: 400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [visible, anim]);

  // Center vertically in the video space
  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-150, height / 2 - 40], // 40 is half toast height approx
  });

  const opacity = anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.5, 1],
  });

  const containerStyle = [
    styles.container,
    { transform: [{ translateY }], opacity, width: width - 32 },
    kind === 'positive' ? styles.positive : styles.negative,
  ];

  return (
    <Animated.View style={containerStyle} pointerEvents="box-none">
      {logo && (
        typeof logo === 'object' && 'text' in logo ? (
          // Text-based avatar (initials)
          <View style={[styles.logo, { backgroundColor: logo.backgroundColor, justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={[styles.initialsText, { color: logo.color }]}>{logo.text}</Text>
          </View>
        ) : (
          // Image-based avatar
          <Image source={logo as ImageSourcePropType} style={styles.logo} />
        )
      )}
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    zIndex: 9999,
  },
  positive: {
    backgroundColor: 'rgba(10, 20, 40, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(0, 194, 255, 0.5)',
  },
  negative: {
    backgroundColor: 'rgba(40, 10, 10, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 80, 80, 0.5)',
  },
  logo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  initialsText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  message: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
    flex: 1, // Allow text to wrap
  },
});

export default NotificationToast;