import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, Easing } from 'react-native';

interface CrabWalkBadgeProps {
  children: React.ReactNode;
}

const CrabWalkBadge: React.FC<CrabWalkBadgeProps> = ({ children }) => {
  const walkX = useRef(new Animated.Value(0)).current;
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const walk = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(walkX, {
            toValue: 10,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(rotation, {
            toValue: 1,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(walkX, {
            toValue: -10,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(rotation, {
            toValue: -1,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(walkX, {
            toValue: 0,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(rotation, {
            toValue: 0,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(2000),
      ])
    );

    walk.start();
    return () => walk.stop();
  }, []);

  const rotate = rotation.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-3deg', '3deg'],
  });

  return (
    <Animated.View
      style={{
        transform: [{ translateX: walkX }, { rotate }],
      }}
    >
      {children}
      <View style={styles.crabContainer}>
        <Animated.Text
          style={[
            styles.crab,
            {
              transform: [{ translateX: walkX }, { rotate }],
            },
          ]}
        >
          🦀
        </Animated.Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  crabContainer: {
    position: 'absolute',
    bottom: -12,
    right: -8,
  },
  crab: {
    fontSize: 20,
  },
});

export default CrabWalkBadge;
