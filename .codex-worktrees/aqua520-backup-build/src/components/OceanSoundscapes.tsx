// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import Video from 'react-native-video';

interface OceanSoundscapesProps {
  enabled: boolean;
  onToggle?: (enabled: boolean) => void;
}

type SoundType = 'waves' | 'seagulls' | 'whales' | 'bubbles' | 'dolphins' | 'bonfire';

interface SoundLayer {
  type: SoundType;
  volume: number;
  enabled: boolean;
}

const SOUND_SOURCES: Record<SoundType, number> = {
  waves: require('../../assets/downfall-3-208028.mp3'),
  seagulls: require('../../assets/falcon.mp3'),
  whales: require('../../assets/sci-fi-sound-effect-designed-circuits-hum-10-200831.mp3'),
  bubbles: require('../../assets/large-underwater-explosion-190270.mp3'),
  dolphins: require('../../assets/sci-fi-sound-effect-designed-circuits-hum-10-200831.mp3'),
  bonfire: require('../../assets/downfall-3-208028.mp3'),
};

const OceanSoundscapes: React.FC<OceanSoundscapesProps> = ({ enabled, onToggle }) => {
  const [expanded, setExpanded] = useState(false);
  const [soundLayers, setSoundLayers] = useState<SoundLayer[]>([
    { type: 'waves', volume: 0.6, enabled: true },
    { type: 'seagulls', volume: 0.3, enabled: false },
    { type: 'whales', volume: 0.4, enabled: false },
    { type: 'bubbles', volume: 0.5, enabled: false },
    { type: 'dolphins', volume: 0.4, enabled: false },
    { type: 'bonfire', volume: 0.3, enabled: false },
  ]);

  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: expanded ? 1 : 0,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [expanded]);

  useEffect(() => {
    if (!enabled) {
      // Stop all sounds
      console.log('Stopping all ocean soundscapes');
    } else {
      // Start enabled sounds
      soundLayers.forEach(layer => {
        if (layer.enabled) {
          console.log(`Playing ${layer.type} at volume ${layer.volume}`);
        }
      });
    }
  }, [enabled, soundLayers]);

  const toggleSound = (type: SoundType) => {
    setSoundLayers(prev =>
      prev.map(layer =>
        layer.type === type ? { ...layer, enabled: !layer.enabled } : layer
      )
    );
  };

  const getSoundEmoji = (type: SoundType) => {
    switch (type) {
      case 'waves': return '🌊';
      case 'seagulls': return '🦅';
      case 'whales': return '🐋';
      case 'bubbles': return '🫧';
      case 'dolphins': return '🐬';
      case 'bonfire': return '🔥';
      default: return '🔊';
    }
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [200, 0],
  });

  if (!enabled) return null;

  const activeSoundLayers = soundLayers.filter(layer => layer.enabled);

  return (
    <View style={styles.container}>
      {/* Toggle button */}
      <Pressable
        style={styles.toggleButton}
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={styles.toggleIcon}>🎵</Text>
      </Pressable>

      {/* Sound mixer panel */}
      <Animated.View
        style={[
          styles.mixerPanel,
          {
            transform: [{ translateY }],
          },
        ]}
      >
        <View style={styles.mixerHeader}>
          <Text style={styles.mixerTitle}>Ocean Soundscapes</Text>
          <Pressable onPress={() => setExpanded(false)}>
            <Text style={styles.closeButton}>✕</Text>
          </Pressable>
        </View>

        <View style={styles.soundList}>
          {soundLayers.map((layer) => (
            <Pressable
              key={layer.type}
              style={[
                styles.soundItem,
                layer.enabled && styles.soundItemActive,
              ]}
              onPress={() => toggleSound(layer.type)}
            >
              <Text style={styles.soundEmoji}>{getSoundEmoji(layer.type)}</Text>
              <Text style={styles.soundLabel}>
                {layer.type.charAt(0).toUpperCase() + layer.type.slice(1)}
              </Text>
              <View style={styles.volumeIndicator}>
                <View
                  style={[
                    styles.volumeBar,
                    {
                      width: `${layer.volume * 100}%`,
                      backgroundColor: layer.enabled ? '#00FFD1' : '#444',
                    },
                  ]}
                />
              </View>
            </Pressable>
          ))}
        </View>
      </Animated.View>
      {activeSoundLayers.map(layer => (
        <Video
          key={`ocean-sound-${layer.type}`}
          source={SOUND_SOURCES[layer.type]}
          audioOnly
          playInBackground
          ignoreSilentSwitch="ignore"
          repeat
          volume={layer.volume}
          style={styles.hiddenAudio}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    zIndex: 500,
  },
  toggleButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 194, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00C2FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  toggleIcon: {
    fontSize: 24,
  },
  mixerPanel: {
    position: 'absolute',
    bottom: 70,
    right: 0,
    width: 280,
    backgroundColor: 'rgba(10, 25, 41, 0.95)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#00C2FF',
    shadowColor: '#00C2FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  mixerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mixerTitle: {
    color: '#00C2FF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    color: 'white',
    fontSize: 20,
    paddingHorizontal: 8,
  },
  soundList: {
    gap: 8,
  },
  soundItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  soundItemActive: {
    backgroundColor: 'rgba(0, 194, 255, 0.2)',
    borderColor: '#00C2FF',
  },
  soundEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  soundLabel: {
    color: 'white',
    fontSize: 14,
    flex: 1,
  },
  volumeIndicator: {
    width: 60,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  volumeBar: {
    height: '100%',
    borderRadius: 2,
  },
  hiddenAudio: {
    width: 0,
    height: 0,
  },
});

export default OceanSoundscapes;
