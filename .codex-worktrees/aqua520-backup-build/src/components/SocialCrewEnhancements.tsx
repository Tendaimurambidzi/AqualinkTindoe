import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Image } from 'react-native';
import firestore from '@react-native-firebase/firestore';

interface SocialCrewEnhancementsProps {
  crewId: string;
  userId: string;
  visible: boolean;
  onClose: () => void;
}

interface CrewBoat {
  id: string;
  type: 'sailboat' | 'yacht' | 'pirateship' | 'submarine';
  color: string;
  level: number;
}

interface FishingExpedition {
  id: string;
  title: string;
  description: string;
  targetCount: number;
  currentCount: number;
  reward: string;
  endTime: number;
}

const SocialCrewEnhancements: React.FC<SocialCrewEnhancementsProps> = ({ 
  crewId, 
  userId, 
  visible, 
  onClose 
}) => {
  const [crewBoat, setCrewBoat] = useState<CrewBoat | null>(null);
  const [activeExpeditions, setActiveExpeditions] = useState<FishingExpedition[]>([]);
  const [beaconActive, setBeaconActive] = useState(false);
  
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  const beaconAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 1 : 0,
      friction: 8,
      useNativeDriver: true,
    }).start();

    if (visible) {
      loadCrewData();
    }
  }, [visible, crewId]);

  useEffect(() => {
    if (beaconActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(beaconAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(beaconAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      beaconAnim.setValue(0);
    }
  }, [beaconActive]);

  const loadCrewData = async () => {
    try {
      // Load crew boat
      const boatDoc = await firestore()
        .collection('crews')
        .doc(crewId)
        .collection('boat')
        .doc('info')
        .get();

      if (boatDoc.exists()) {
        setCrewBoat(boatDoc.data() as CrewBoat);
      } else {
        // Create default boat
        const defaultBoat: CrewBoat = {
          id: crewId,
          type: 'sailboat',
          color: '#00C2FF',
          level: 1,
        };
        await firestore()
          .collection('crews')
          .doc(crewId)
          .collection('boat')
          .doc('info')
          .set(defaultBoat);
        setCrewBoat(defaultBoat);
      }

      // Load active expeditions
      const expeditionsSnap = await firestore()
        .collection('crews')
        .doc(crewId)
        .collection('expeditions')
        .where('endTime', '>', Date.now())
        .get();

      setActiveExpeditions(
        expeditionsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as FishingExpedition[]
      );
    } catch (error) {
      console.error('Error loading crew data:', error);
    }
  };

  const upgradeBoat = async () => {
    if (!crewBoat) return;

    const boatTypes: CrewBoat['type'][] = ['sailboat', 'yacht', 'pirateship', 'submarine'];
    const currentIndex = boatTypes.indexOf(crewBoat.type);
    const nextType = boatTypes[Math.min(currentIndex + 1, boatTypes.length - 1)];

    const updatedBoat = {
      ...crewBoat,
      type: nextType,
      level: crewBoat.level + 1,
    };

    try {
      await firestore()
        .collection('crews')
        .doc(crewId)
        .collection('boat')
        .doc('info')
        .update(updatedBoat);

      setCrewBoat(updatedBoat);
    } catch (error) {
      console.error('Error upgrading boat:', error);
    }
  };

  const sendLighthouseBeacon = async () => {
    setBeaconActive(true);

    try {
      await firestore()
        .collection('crews')
        .doc(crewId)
        .collection('beacons')
        .add({
          userId,
          timestamp: Date.now(),
          message: 'Crew rally signal!',
        });

      setTimeout(() => setBeaconActive(false), 5000);
    } catch (error) {
      console.error('Error sending beacon:', error);
    }
  };

  const getBoatEmoji = (type: CrewBoat['type']) => {
    switch (type) {
      case 'sailboat': return '⛵';
      case 'yacht': return '🛥️';
      case 'pirateship': return '🏴‍☠️';
      case 'submarine': return '🚢';
      default: return '⛵';
    }
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  const beaconScale = beaconAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.5],
  });

  const beaconOpacity = beaconAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>⚓ Crew Command</Text>
        <Pressable onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
      </View>

      {/* Crew Boat */}
      {crewBoat && (
        <View style={styles.boatSection}>
          <Text style={styles.sectionTitle}>🚢 Crew Boat</Text>
          <View style={[styles.boatCard, { borderColor: crewBoat.color }]}>
            <Text style={styles.boatEmoji}>{getBoatEmoji(crewBoat.type)}</Text>
            <Text style={styles.boatType}>
              {crewBoat.type.charAt(0).toUpperCase() + crewBoat.type.slice(1)}
            </Text>
            <Text style={styles.boatLevel}>Level {crewBoat.level}</Text>
            <Pressable style={styles.upgradeButton} onPress={upgradeBoat}>
              <Text style={styles.upgradeButtonText}>⬆️ Upgrade</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Fishing Expeditions */}
      <View style={styles.expeditionsSection}>
        <Text style={styles.sectionTitle}>🎣 Fishing Expeditions</Text>
        {activeExpeditions.length === 0 ? (
          <Text style={styles.emptyText}>No active expeditions</Text>
        ) : (
          activeExpeditions.map((exp) => (
            <View key={exp.id} style={styles.expeditionCard}>
              <Text style={styles.expeditionTitle}>{exp.title}</Text>
              <Text style={styles.expeditionDesc}>{exp.description}</Text>
              <View style={styles.expeditionProgress}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${(exp.currentCount / exp.targetCount) * 100}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {exp.currentCount} / {exp.targetCount}
                </Text>
              </View>
              <Text style={styles.expeditionReward}>🏆 {exp.reward}</Text>
            </View>
          ))
        )}
      </View>

      {/* Lighthouse Beacon */}
      <View style={styles.beaconSection}>
        <Text style={styles.sectionTitle}>🗼 Lighthouse Beacon</Text>
        <Pressable
          style={[styles.beaconButton, beaconActive && styles.beaconButtonActive]}
          onPress={sendLighthouseBeacon}
          disabled={beaconActive}
        >
          <Animated.Text
            style={[
              styles.beaconEmoji,
              {
                transform: [{ scale: beaconScale }],
                opacity: beaconActive ? beaconOpacity : 1,
              },
            ]}
          >
            🗼
          </Animated.Text>
          <Text style={styles.beaconText}>
            {beaconActive ? 'Signal Sent!' : 'Rally Crew'}
          </Text>
        </Pressable>
      </View>

      {/* Port Gatherings */}
      <View style={styles.portSection}>
        <Text style={styles.sectionTitle}>⚓ Port Gatherings</Text>
        <Text style={styles.portText}>
          Coordinate meetups at your local beach or marina
        </Text>
        <Pressable style={styles.portButton}>
          <Text style={styles.portButtonText}>📍 Find Nearby Ports</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '85%',
    backgroundColor: 'rgba(10, 25, 41, 0.98)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 2,
    borderColor: '#00C2FF',
    padding: 20,
    zIndex: 1000,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#00C2FF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    color: 'white',
    fontSize: 24,
  },
  sectionTitle: {
    color: '#00FFD1',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  boatSection: {
    marginBottom: 20,
  },
  boatCard: {
    backgroundColor: 'rgba(0, 194, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
  },
  boatEmoji: {
    fontSize: 64,
    marginBottom: 8,
  },
  boatType: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  boatLevel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 12,
  },
  upgradeButton: {
    backgroundColor: '#00C2FF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  upgradeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  expeditionsSection: {
    marginBottom: 20,
  },
  expeditionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  expeditionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  expeditionDesc: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    marginBottom: 12,
  },
  expeditionProgress: {
    marginBottom: 8,
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
    backgroundColor: '#00FFD1',
    borderRadius: 4,
  },
  progressText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    textAlign: 'right',
  },
  expeditionReward: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  beaconSection: {
    marginBottom: 20,
  },
  beaconButton: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  beaconButtonActive: {
    backgroundColor: 'rgba(255, 215, 0, 0.4)',
  },
  beaconEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  beaconText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  portSection: {
    marginBottom: 20,
  },
  portText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginBottom: 12,
  },
  portButton: {
    backgroundColor: 'rgba(0, 194, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00C2FF',
  },
  portButtonText: {
    color: '#00C2FF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SocialCrewEnhancements;
