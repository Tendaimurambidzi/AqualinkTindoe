import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, Dimensions, Animated, Easing, StyleSheet, Platform, ImageSourcePropType, Pressable } from 'react-native';
import TapSplashEffect, { TapSplashEffectHandle } from './TapSplashEffect';

// Try to use react-native-video for playing a short audio cue
let RNVideo: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  RNVideo = require('react-native-video').default;
} catch {}

type Props = { onDone: () => void };

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// Asset injection: pass local images/sound via props or drop files into Drift/assets and wire them up later.
// Avoid require() so the app runs even if assets are not present yet.
let UNUSED: unknown;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'black' },
  sky: { flex: 1, backgroundColor: '#070914' },
  ocean: { position: 'absolute', left: 0, right: 0, bottom: 0, height: Math.max(120, SCREEN_H * 0.32) },
  moon: { position: 'absolute' },
  falcon: { position: 'absolute' },
  hint: { position: 'absolute', bottom: 8, alignSelf: 'center', color: '#5b6a85', fontSize: 12 },
});

type AssetProps = {
  moonSource?: ImageSourcePropType;
  falconSource?: ImageSourcePropType;
  soundSource?: any; // react-native-video source
};

const SplashMoonFalcon: React.FC<Props & AssetProps> = ({ onDone, moonSource, falconSource, soundSource }) => {
  // Animation values
  const moonDiameter = SCREEN_W; // cover full width
  const moonX = 0;
  // When fully risen, center the moon vertically
  const moonYBase = (SCREEN_H - moonDiameter) / 2;
  // Start just below the bottom edge, then rise to center (translateY -> 0)
  const initialMoonTranslate = Math.max(0, SCREEN_H - moonYBase);
  const moonY = useRef(new Animated.Value(initialMoonTranslate)).current;
  const birdX = useRef(new Animated.Value(SCREEN_W * 0.6)).current;   // start off to the right
  const birdY = useRef(new Animated.Value(-SCREEN_H * 0.05)).current; // slight descent path
  const birdScale = useRef(new Animated.Value(0.85)).current;         // scale up a bit while flying in
  const [playSound, setPlaySound] = useState(false);
  const [showBird, setShowBird] = useState(false);
  const tapSplashRef = useRef<TapSplashEffectHandle>(null);

  useEffect(() => {
    // Sequence: moon rises to center (>=10s based on distance) -> reveal bird and fly in (6s)
    const baseSpeedPxPerSec = SCREEN_H / 10; // 1 screen height over 10s
    const computedMs = Math.round((initialMoonTranslate / baseSpeedPxPerSec) * 1000);
    const moonDurationMs = Math.max(10000, computedMs);
    Animated.timing(moonY, {
      toValue: 0,
      duration: moonDurationMs,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setShowBird(true);
      Animated.parallel([
        Animated.timing(birdX, { toValue: 0, duration: 6000, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(birdY, { toValue: 0, duration: 6000, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(birdScale, { toValue: 1, duration: 6000, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start(() => {
        // When bird animation finishes, play the sound.
        if (RNVideo && soundSource) setPlaySound(true);
        // If no sound, proceed immediately.
        else onDone();
      });
    });
  }, [birdScale, birdX, birdY, moonY, onDone]);

  // Sizes/positions
  const birdSize = Math.min(SCREEN_W * 0.62, SCREEN_H * 0.62); // slightly larger to partly obscure the moon
  const birdXBase = (SCREEN_W - birdSize) / 2; // center horizontally over the moon
  const birdYBase = moonYBase + (moonDiameter - birdSize) / 2; // center vertically over the moon

  return (
    <Pressable
      style={styles.root}
      onPress={(e) => {
        tapSplashRef.current?.spawnAt(e.nativeEvent.pageX, e.nativeEvent.pageY);
      }}
    >
      {/* Night sky */}
      <View style={styles.sky} />

      {/* Moon rising behind the ocean horizon: we use layering with an ocean bar masking the lower part */}
      <Animated.View style={{ position: 'absolute', left: moonX, top: moonYBase, transform: [{ translateY: moonY }], zIndex: 1 }}>
        {moonSource ? (
          <Image source={moonSource} style={{ width: moonDiameter, height: moonDiameter, resizeMode: 'cover' }} />
        ) : (
          <View style={{ width: moonDiameter, height: moonDiameter, borderRadius: moonDiameter / 2, backgroundColor: '#b20000' }} />
        )}
      </Animated.View>

      {/* Ocean removed as requested */}

      {/* Falcon flying in to center */}
      {showBird && (
      <Animated.View
        style={{
          position: 'absolute',
          left: birdXBase,
          top: birdYBase,
          transform: [
            { translateX: birdX },
            { translateY: birdY },
            { scale: birdScale },
          ],
          zIndex: 3, // ensure falcon sits above the moon to partly obscure it
        }}
      >
        {falconSource ? (
          <Image source={falconSource} style={{ width: birdSize, height: birdSize, resizeMode: 'contain' }} />
        ) : null}
      </Animated.View>
      )}

      {/* Play short landing sound once */}
      {RNVideo && soundSource && playSound ? (
        <RNVideo
          source={soundSource}
          audioOnly
          paused={!playSound}
          onEnd={() => {
            // Proceed to next screen as soon as sound finishes.
            onDone();
          }}
          style={{ width: 0, height: 0 }}
        />
      ) : null}

      {/* Hint if assets missing in dev */}
      {__DEV__ && (!moonSource || !falconSource) ? (
        <Text style={styles.hint}>Place moon.png, falcon.png and falcon.mp3 in Drift/assets and pass to SplashMoonFalcon</Text>
      ) : null}

      {/* Interactive tap effect overlay */}
      <TapSplashEffect ref={tapSplashRef} />
    </Pressable>
  );
};

export default SplashMoonFalcon;
