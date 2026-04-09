import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, Easing } from 'react-native';

const SwimmingFishLoader: React.FC = () => {
  const fish1X = useRef(new Animated.Value(-100)).current;
  const fish2X = useRef(new Animated.Value(-150)).current;
  const fish3X = useRef(new Animated.Value(-200)).current;
  
  const fish1Y = useRef(new Animated.Value(0)).current;
  const fish2Y = useRef(new Animated.Value(0)).current;
  const fish3Y = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const swimAcross = (fishX: Animated.Value, fishY: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(fishX, {
              toValue: 400,
              duration: 3000,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(fishY, {
                toValue: -20,
                duration: 750,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(fishY, {
                toValue: 20,
                duration: 1500,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(fishY, {
                toValue: 0,
                duration: 750,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
            ]),
          ]),
          Animated.timing(fishX, {
            toValue: -100,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const anim1 = swimAcross(fish1X, fish1Y, 0);
    const anim2 = swimAcross(fish2X, fish2Y, 800);
    const anim3 = swimAcross(fish3X, fish3Y, 1600);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Text
        style={[
          styles.fish,
          {
            transform: [
              { translateX: fish1X },
              { translateY: fish1Y },
              { scaleX: -1 },
            ],
          },
        ]}
      >
        🐠
      </Animated.Text>
      <Animated.Text
        style={[
          styles.fish,
          {
            transform: [
              { translateX: fish2X },
              { translateY: fish2Y },
              { scaleX: -1 },
            ],
          },
        ]}
      >
        🐟
      </Animated.Text>
      <Animated.Text
        style={[
          styles.fish,
          {
            transform: [
              { translateX: fish3X },
              { translateY: fish3Y },
              { scaleX: -1 },
            ],
          },
        ]}
      >
        🐡
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 300,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  fish: {
    fontSize: 32,
    position: 'absolute',
  },
});

export default SwimmingFishLoader;
