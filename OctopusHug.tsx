import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Animated, Text, Pressable } from 'react-native';

interface OctopusHugProps {
  enabled?: boolean;
}

const OctopusHug: React.FC<OctopusHugProps> = ({ enabled = true }) => {
  const [isHugging, setIsHugging] = useState(false);
  const [tentacleAnims] = useState(() => 
    Array.from({ length: 8 }, () => new Animated.Value(0))
  );
  const [octopusScale] = useState(new Animated.Value(0));

  const startHug = () => {
    setIsHugging(true);
    
    // Octopus appears
    Animated.spring(octopusScale, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Animate tentacles wrapping around screen
    const tentacleAnimations = tentacleAnims.map((anim, index) =>
      Animated.sequence([
        Animated.delay(index * 100),
        Animated.spring(anim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ])
    );

    Animated.parallel(tentacleAnimations).start(() => {
      // Hold for 2 seconds then release
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(octopusScale, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          ...tentacleAnims.map(anim =>
            Animated.timing(anim, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            })
          ),
        ]).start(() => {
          setIsHugging(false);
        });
      }, 2000);
    });
  };

  if (!enabled) return null;

  return (
    <>
      {/* Octopus hug button */}
      {!isHugging && (
        <Pressable
          onPress={startHug}
          style={styles.hugButton}
        >
          <Text style={styles.hugButtonText}>🐙</Text>
        </Pressable>
      )}

      {/* Octopus and tentacles */}
      {isHugging && (
        <View style={styles.container} pointerEvents="none">
          {/* Octopus body */}
          <Animated.View
            style={[
              styles.octopusBody,
              {
                transform: [{ scale: octopusScale }],
              },
            ]}
          >
            <Text style={styles.octopusEmoji}>🐙</Text>
          </Animated.View>

          {/* Tentacles */}
          {tentacleAnims.map((anim, index) => (
            <Animated.View
              key={index}
              style={[
                styles.tentacle,
                {
                  transform: [
                    {
                      translateX: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, getTentacleX(index)],
                      }),
                    },
                    {
                      translateY: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, getTentacleY(index)],
                      }),
                    },
                    {
                      rotate: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', `${getTentacleRotation(index)}deg`],
                      }),
                    },
                  ],
                  opacity: anim,
                },
              ]}
            />
          ))}
        </View>
      )}
    </>
  );
};

// Helper functions for tentacle positions
const getTentacleX = (index: number) => {
  const angle = (index / 8) * Math.PI * 2;
  return Math.cos(angle) * 150;
};

const getTentacleY = (index: number) => {
  const angle = (index / 8) * Math.PI * 2;
  return Math.sin(angle) * 150;
};

const getTentacleRotation = (index: number) => {
  return (index / 8) * 360;
};

const styles = StyleSheet.create({
  hugButton: {
    position: 'absolute',
    bottom: 140,
    left: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(138, 43, 226, 0.2)',
    borderWidth: 2,
    borderColor: '#8A2BE2',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
  },
  hugButtonText: {
    fontSize: 32,
  },
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  octopusBody: {
    position: 'absolute',
  },
  octopusEmoji: {
    fontSize: 100,
  },
  tentacle: {
    position: 'absolute',
    width: 30,
    height: 120,
    backgroundColor: 'rgba(138, 43, 226, 0.6)',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(186, 85, 211, 0.8)',
  },
});

export default OctopusHug;
