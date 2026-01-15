import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, StyleSheet, Dimensions, Text, Vibration } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type ReactionType = 'fish' | 'octopus' | 'shell' | 'crab' | 'whale';

interface MarineLifeReactionsProps {
  reactionType: ReactionType;
  count: number;
  onAnimationComplete?: () => void;
}

const MarineLifeReactions: React.FC<MarineLifeReactionsProps> = ({ 
  reactionType, 
  count,
  onAnimationComplete 
}) => {
  const [creatures, setCreatures] = useState<Array<{ id: number; anim: Animated.Value }>>([]);

  useEffect(() => {
    // Generate creatures based on count
    const newCreatures = Array.from({ length: Math.min(count, 20) }, (_, i) => ({
      id: Date.now() + i,
      anim: new Animated.Value(0),
    }));

    setCreatures(newCreatures);

    // Animate each creature
    newCreatures.forEach((creature, index) => {
      Animated.timing(creature.anim, {
        toValue: 1,
        duration: 2000 + Math.random() * 1000,
        delay: index * 100,
        useNativeDriver: true,
      }).start(() => {
        if (index === newCreatures.length - 1) {
          onAnimationComplete?.();
          setTimeout(() => setCreatures([]), 500);
        }
      });
    });

    // Haptic feedback
    if (reactionType === 'whale') {
      Vibration.vibrate([0, 100, 50, 100]);
    } else if (reactionType === 'octopus') {
      Vibration.vibrate([0, 30, 30, 30, 30, 30]);
    } else {
      Vibration.vibrate(20);
    }
  }, [count, reactionType]);

  const getCreatureEmoji = () => {
    switch (reactionType) {
      case 'fish': return '🐠';
      case 'octopus': return '🐙';
      case 'shell': return '🐚';
      case 'crab': return '🦀';
      case 'whale': return '🐳';
      default: return '🐠';
    }
  };

  const getAnimationStyle = (creature: { id: number; anim: Animated.Value }, index: number) => {
    const startX = reactionType === 'crab' ? -50 : Math.random() * SCREEN_WIDTH;
    const endX = reactionType === 'crab' ? SCREEN_WIDTH + 50 : Math.random() * SCREEN_WIDTH;
    const startY = reactionType === 'whale' ? SCREEN_HEIGHT : Math.random() * SCREEN_HEIGHT * 0.6;
    const endY = reactionType === 'whale' ? -100 : Math.random() * SCREEN_HEIGHT * 0.4;

    const translateX = creature.anim.interpolate({
      inputRange: [0, 1],
      outputRange: [startX, endX],
    });

    const translateY = creature.anim.interpolate({
      inputRange: [0, 1],
      outputRange: [startY, endY],
    });

    const opacity = creature.anim.interpolate({
      inputRange: [0, 0.1, 0.9, 1],
      outputRange: [0, 1, 1, 0],
    });

    const scale = creature.anim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.5, 1.2, 0.8],
    });

    const rotate = creature.anim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', reactionType === 'fish' ? '360deg' : '0deg'],
    });

    return {
      transform: [
        { translateX },
        { translateY },
        { scale },
        { rotate },
      ],
      opacity,
    };
  };

  return (
    <View style={styles.container} pointerEvents="none">
      {creatures.map((creature, index) => (
        <Animated.Text
          key={creature.id}
          style={[
            styles.creature,
            getAnimationStyle(creature, index),
            { fontSize: reactionType === 'whale' ? 48 : 32 },
          ]}
        >
          {getCreatureEmoji()}
        </Animated.Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  creature: {
    position: 'absolute',
    fontSize: 32,
  },
});

export default MarineLifeReactions;
