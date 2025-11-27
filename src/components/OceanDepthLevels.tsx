import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type DepthLevel = 'surface' | 'snorkeler' | 'scuba' | 'deepsea' | 'guardian';

interface OceanDepthLevelsProps {
  totalSplashes: number;
  userId: string;
}

interface DepthLevelInfo {
  level: DepthLevel;
  title: string;
  minSplashes: number;
  maxSplashes: number;
  emoji: string;
  color: string;
  benefits: string[];
}

const DEPTH_LEVELS: DepthLevelInfo[] = [
  {
    level: 'surface',
    title: 'Surface Dweller',
    minSplashes: 0,
    maxSplashes: 99,
    emoji: '🏖️',
    color: '#87CEEB',
    benefits: ['Basic filters', 'Post waves', 'Join crews'],
  },
  {
    level: 'snorkeler',
    title: 'Snorkeler',
    minSplashes: 100,
    maxSplashes: 499,
    emoji: '🤿',
    color: '#4169E1',
    benefits: ['Unlock stickers', 'Custom watermarks', 'Priority in feed'],
  },
  {
    level: 'scuba',
    title: 'Scuba Diver',
    minSplashes: 500,
    maxSplashes: 1999,
    emoji: '🌊',
    color: '#1E90FF',
    benefits: ['Host live streams', 'Advanced filters', 'Verified badge'],
  },
  {
    level: 'deepsea',
    title: 'Deep Sea Explorer',
    minSplashes: 2000,
    maxSplashes: 9999,
    emoji: '🐋',
    color: '#00008B',
    benefits: ['Exclusive effects', 'Custom badges', 'Early features'],
  },
  {
    level: 'guardian',
    title: 'Ocean Guardian',
    minSplashes: 10000,
    maxSplashes: Infinity,
    emoji: '👑',
    color: '#FFD700',
    benefits: ['All features', 'Moderation powers', 'Special watermark', 'Hall of Fame'],
  },
];

const OceanDepthLevels: React.FC<OceanDepthLevelsProps> = ({ totalSplashes, userId }) => {
  const [currentLevel, setCurrentLevel] = useState<DepthLevelInfo>(DEPTH_LEVELS[0]);
  const [nextLevel, setNextLevel] = useState<DepthLevelInfo | null>(DEPTH_LEVELS[1]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    calculateLevel();
  }, [totalSplashes]);

  const calculateLevel = async () => {
    const level = DEPTH_LEVELS.find(
      (l) => totalSplashes >= l.minSplashes && totalSplashes <= l.maxSplashes
    ) || DEPTH_LEVELS[0];

    const levelIndex = DEPTH_LEVELS.indexOf(level);
    const next = levelIndex < DEPTH_LEVELS.length - 1 ? DEPTH_LEVELS[levelIndex + 1] : null;

    setCurrentLevel(level);
    setNextLevel(next);

    // Calculate progress percentage
    if (next) {
      const rangeTotal = next.minSplashes - level.minSplashes;
      const currentProgress = totalSplashes - level.minSplashes;
      setProgress(Math.min((currentProgress / rangeTotal) * 100, 100));
    } else {
      setProgress(100);
    }

    // Check for level up
    const storedLevel = await AsyncStorage.getItem(`depth_level_${userId}`);
    if (storedLevel !== level.level) {
      await AsyncStorage.setItem(`depth_level_${userId}`, level.level);
      if (storedLevel) {
        // Level up notification
        console.log(`🎉 Level up to ${level.title}!`);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.levelBadge, { backgroundColor: currentLevel.color }]}>
        <Text style={styles.levelEmoji}>{currentLevel.emoji}</Text>
        <Text style={styles.levelTitle}>{currentLevel.title}</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progress}%`,
                backgroundColor: currentLevel.color,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {totalSplashes} / {nextLevel ? nextLevel.minSplashes : '∞'} splashes
        </Text>
      </View>

      {nextLevel && (
        <View style={styles.nextLevelInfo}>
          <Text style={styles.nextLevelLabel}>Next: {nextLevel.title}</Text>
          <Text style={styles.nextLevelEmoji}>{nextLevel.emoji}</Text>
        </View>
      )}
    </View>
  );
};

export const getDepthLevelForSplashes = (splashes: number): DepthLevelInfo => {
  return (
    DEPTH_LEVELS.find((l) => splashes >= l.minSplashes && splashes <= l.maxSplashes) ||
    DEPTH_LEVELS[0]
  );
};

export const canUserHostLive = (splashes: number): boolean => {
  const level = getDepthLevelForSplashes(splashes);
  return ['scuba', 'deepsea', 'guardian'].includes(level.level);
};

export const getUserBadgeEmoji = (splashes: number): string => {
  return getDepthLevelForSplashes(splashes).emoji;
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    marginVertical: 8,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 24,
    marginBottom: 12,
    gap: 8,
  },
  levelEmoji: {
    fontSize: 24,
  },
  levelTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    textAlign: 'center',
  },
  nextLevelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  nextLevelLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  nextLevelEmoji: {
    fontSize: 20,
  },
});

export default OceanDepthLevels;
