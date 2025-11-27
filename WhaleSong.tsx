import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Animated, Text, Pressable } from 'react-native';

// Try to use react-native-video for whale song sound
let RNVideo: any = null;
try {
  RNVideo = require('react-native-video').default;
} catch {}

// Whale song sound (using hawk sound as placeholder - replace with whale.mp3 when available)
let whaleSound: any = null;
try {
  whaleSound = require('./assets/hawk-call-sound-effect-hawk-cry-364472.mp3');
} catch {}

interface WhaleSongProps {
  enabled?: boolean;
}

const WhaleSong: React.FC<WhaleSongProps> = ({ enabled = true }) => {
  const [isSinging, setIsSinging] = useState(false);
  const [soundWaves, setSoundWaves] = useState<Array<{ id: number; anim: Animated.Value }>>([]);
  const [whaleAnim] = useState(new Animated.Value(0));
  const [playSound, setPlaySound] = useState(false);
  const waveIdRef = React.useRef(0);

  const startSong = () => {
    setIsSinging(true);
    setPlaySound(true); // Start playing whale song
    
    // Whale swims in
    Animated.timing(whaleAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Create sound waves
    const waveInterval = setInterval(() => {
      const newWave = {
        id: waveIdRef.current++,
        anim: new Animated.Value(0),
      };

      setSoundWaves(prev => [...prev.slice(-3), newWave]);

      Animated.timing(newWave.anim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }).start(() => {
        setSoundWaves(prev => prev.filter(w => w.id !== newWave.id));
      });
    }, 500);

    // Stop after 4 seconds
    setTimeout(() => {
      clearInterval(waveInterval);
      Animated.timing(whaleAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start(() => {
        setIsSinging(false);
        setSoundWaves([]);
        setPlaySound(false); // Stop whale song
      });
    }, 4000);
  };

  if (!enabled) return null;

  return (
    <>
      {/* Whale song button */}
      {!isSinging && (
        <Pressable
          onPress={startSong}
          style={styles.songButton}
        >
          <Text style={styles.songButtonText}>🐋</Text>
        </Pressable>
      )}

      {/* Whale and sound waves */}
      {isSinging && (
        <View style={styles.container} pointerEvents="none">
          {/* Whale */}
          <Animated.View
            style={[
              styles.whale,
              {
                opacity: whaleAnim,
                transform: [
                  {
                    translateX: whaleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-200, 0],
                    }),
                  },
                  {
                    scale: whaleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.whaleEmoji}>🐋</Text>
          </Animated.View>

          {/* Sound waves */}
          {soundWaves.map((wave, index) => (
            <Animated.View
              key={wave.id}
              style={[
                styles.soundWave,
                {
                  opacity: wave.anim.interpolate({
                    inputRange: [0, 0.2, 1],
                    outputRange: [0, 0.8, 0],
                  }),
                  transform: [
                    {
                      scale: wave.anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 3],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.noteEmoji}>🎵</Text>
            </Animated.View>
          ))}
        </View>
      )}

      {/* Whale song audio */}
      {RNVideo && whaleSound && playSound && (
        <RNVideo
          source={whaleSound}
          audioOnly
          paused={!playSound}
          volume={1.0}
          ignoreSilentSwitch="ignore"
          style={{ width: 0, height: 0 }}
          onEnd={() => setPlaySound(false)}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  songButton: {
    position: 'absolute',
    bottom: 200,
    left: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 119, 190, 0.2)',
    borderWidth: 2,
    borderColor: '#0077BE',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
  },
  songButtonText: {
    fontSize: 32,
  },
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 170,
    justifyContent: 'center',
    alignItems: 'center',
  },
  whale: {
    position: 'absolute',
    left: '20%',
  },
  whaleEmoji: {
    fontSize: 120,
  },
  soundWave: {
    position: 'absolute',
    left: '40%',
  },
  noteEmoji: {
    fontSize: 50,
  },
});

export default WhaleSong;
