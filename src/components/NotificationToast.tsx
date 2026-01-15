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
  const insets = useSafeAreaInsets();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: visible ? 1 : 0,
      duration: 400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [visible, anim]);

  // Position at top like Android notification bar/message inbox
  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, insets.top + 10], // Position below status bar
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
          // Text-based avatar (initials) - larger for inbox style
          <View style={[styles.avatar, { backgroundColor: logo.backgroundColor, justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={[styles.initialsText, { color: logo.color }]}>{logo.text}</Text>
          </View>
        ) : (
          // Image-based avatar - larger for inbox style
          <Image source={logo as ImageSourcePropType} style={styles.avatar} />
        )
      )}
      <View style={styles.messageContainer}>
        <Text style={styles.message} numberOfLines={2}>{message}</Text>
      </View>
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
    borderRadius: 8, // Less rounded for inbox style
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 9999,
  },
  positive: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // Light background like Gmail
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  negative: {
    backgroundColor: 'rgba(255, 248, 248, 0.95)', // Light red tint for errors
    borderWidth: 1,
    borderColor: 'rgba(255, 80, 80, 0.3)',
  },
  avatar: {
    width: 40, // Larger avatar like inbox style
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  initialsText: {
    fontSize: 14, // Larger text for bigger avatar
    fontWeight: 'bold',
  },
  message: {
    color: '#333', // Dark text on light background
    fontWeight: '500', // Medium weight like inbox items
    fontSize: 14,
    lineHeight: 18,
  },
});

export default NotificationToast;