import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { View, Animated, Easing, StyleSheet, Dimensions, Text } from 'react-native';

type Particle = {
  id: number;
  x: number;
  y: number;
  kind: 'bubble' | 'shell';
  scale: Animated.Value;
  opacity: Animated.Value;
  translateY: Animated.Value;
  translateX: Animated.Value;
  rotate: Animated.Value;
};

export type TapSplashEffectHandle = {
  spawnAt: (x: number, y: number) => void;
};

const { width, height } = Dimensions.get('window');

function makeParticle(kind: Particle['kind'], x: number, y: number, id: number): Particle {
  return {
    id,
    x,
    y,
    kind,
    scale: new Animated.Value(kind === 'bubble' ? 0.8 : 0.6),
    opacity: new Animated.Value(0.9),
    translateY: new Animated.Value(0),
    translateX: new Animated.Value(0),
    rotate: new Animated.Value((Math.random() * 2 - 1) * 0.6),
  };
}

function animateParticle(p: Particle, onEnd: () => void) {
  const floatUp = -60 - Math.random() * 60;
  const driftX = (Math.random() * 2 - 1) * 30;
  const dur = 900 + Math.random() * 500;

  Animated.parallel([
    Animated.timing(p.translateY, { toValue: floatUp, duration: dur, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    Animated.timing(p.translateX, { toValue: driftX, duration: dur, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    Animated.sequence([
      Animated.timing(p.scale, { toValue: 1.1, duration: dur * 0.3, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(p.scale, { toValue: 0.9, duration: dur * 0.4, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]),
    Animated.timing(p.opacity, { toValue: 0, duration: dur, delay: 100, easing: Easing.out(Easing.quad), useNativeDriver: true }),
  ]).start(() => onEnd());
}

const TapSplashEffect = forwardRef<TapSplashEffectHandle, { maxParticles?: number }>((props, ref) => {
  const { maxParticles = 80 } = props;
  const [particles, setParticles] = useState<Particle[]>([]);
  const idRef = useRef(0);

  const cleanup = useCallback((id: number) => {
    setParticles((prev) => prev.filter((pp) => pp.id !== id));
  }, []);

  const spawnAt = useCallback(
    (x: number, y: number) => {
      setParticles((prev) => {
        if (prev.length > maxParticles) return prev;
        const next: Particle[] = [...prev];
        // 3–5 bubbles
        const bubbleCount = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < bubbleCount; i++) {
          const pid = ++idRef.current;
          const px = x + (Math.random() * 2 - 1) * 10;
          const py = y + (Math.random() * 2 - 1) * 6;
          const p = makeParticle('bubble', px, py, pid);
          next.push(p);
          requestAnimationFrame(() => animateParticle(p, () => cleanup(pid)));
        }
        // 30% chance shell glint
        if (Math.random() < 0.3) {
          const pid = ++idRef.current;
          const p = makeParticle('shell', x, y, pid);
          next.push(p);
          requestAnimationFrame(() => animateParticle(p, () => cleanup(pid)));
        }
        return next;
      });
    },
    [cleanup, maxParticles]
  );

  useImperativeHandle(ref, () => ({ spawnAt }), [spawnAt]);

  return (
    <View pointerEvents="none" style={styles.fill}>
      {particles.map((p) => {
        const rotateDeg = p.rotate.interpolate({ inputRange: [-1, 1], outputRange: ['-25deg', '25deg'] });
        return (
          <Animated.View
            key={p.id}
            style={[
              styles.particle,
              {
                left: p.x,
                top: p.y,
                transform: [
                  { translateX: p.translateX },
                  { translateY: p.translateY },
                  { rotate: rotateDeg },
                  { scale: p.scale },
                ],
                opacity: p.opacity,
              },
            ]}
          >
            {p.kind === 'bubble' ? (
              <View style={styles.bubble} />
            ) : (
              <Text style={styles.shell}>🐚</Text>
            )}
          </Animated.View>
        );
      })}
    </View>
  );
});

export default TapSplashEffect;

const styles = StyleSheet.create({
  fill: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  particle: { position: 'absolute' },
  bubble: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(233,245,255,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(0,200,255,0.5)',
  },
  shell: { fontSize: 18, textShadowColor: 'rgba(10,30,47,0.35)', textShadowRadius: 4 },
});
