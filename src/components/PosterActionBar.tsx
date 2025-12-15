// Import necessary components and hooks
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';

// Types for the component props
interface PosterActionBarProps {
  waveId: string;
  currentUserId: string;
  splashesCount: number;
  echoesCount: number;
  pearlsCount: number;
  isAnchored: boolean;
  isCasted: boolean;
  onSplash: () => void;
  onEcho: () => void;
  onPearl: () => void;
  onAnchor: () => void;
  onCast: () => void;
  creatorUserId: string;
}

// Main component
const PosterActionBar: React.FC<PosterActionBarProps> = ({
  waveId,
  currentUserId,
  splashesCount,
  echoesCount,
  pearlsCount,
  isAnchored,
  isCasted,
  onSplash,
  onEcho,
  onPearl,
  onAnchor,
  onCast,
  creatorUserId,
}) => {
  const [hasSplashed, setHasSplashed] = useState(false);
  const [hasEchoed, setHasEchoed] = useState(false);

  // Check if user has already interacted
  useEffect(() => {
    const checkInteractions = async () => {
      try {
        const splashDoc = await firestore()
          .collection(`waves/${waveId}/splashes`)
          .doc(currentUserId)
          .get();
        setHasSplashed(splashDoc.exists);

        const echoQuery = await firestore()
          .collection(`waves/${waveId}/echoes`)
          .where('userUid', '==', currentUserId)
          .limit(1)
          .get();
        setHasEchoed(!echoQuery.empty);
      } catch (error) {
        console.error('Error checking interactions:', error);
      }
    };
    checkInteractions();
  }, [waveId, currentUserId]);

  const handleSplash = async () => {
    try {
      if (hasSplashed) {
        // Remove splash
        await firestore()
          .collection(`waves/${waveId}/splashes`)
          .doc(currentUserId)
          .delete();
        setHasSplashed(false);
      } else {
        // Add splash
        await firestore()
          .collection(`waves/${waveId}/splashes`)
          .doc(currentUserId)
          .set({
            userUid: currentUserId,
            createdAt: firestore.FieldValue.serverTimestamp(),
          });
        setHasSplashed(true);
        // Send notification if not self
        if (currentUserId !== creatorUserId) {
          try {
            // Get user name
            let fromName = 'Someone';
            try {
              const userDoc = await firestore()
                .collection('users')
                .doc(currentUserId)
                .get();
              if (userDoc.exists) {
                const userData = userDoc.data();
                fromName = userData?.displayName || userData?.name || 'Someone';
              }
            } catch (e) {
              console.warn('Failed to get user name for notification:', e);
            }
            await functions().httpsCallable('addPing')({
              recipientUid: creatorUserId,
              type: 'hug',
              waveId: waveId,
              text: `${fromName} has hugged your vibe`,
              fromUid: currentUserId,
              fromName: fromName,
            });
          } catch (error) {
            console.error('Error sending hug notification:', error);
          }
        }
      }
      onSplash();
    } catch (error) {
      console.error('Error handling splash:', error);
    }
  };

  const handleEcho = () => {
    onEcho();
  };

  const handlePearl = () => {
    onPearl();
  };

  const handleAnchor = () => {
    onAnchor();
  };

  const handleCast = () => {
    onCast();
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.actionBar}>
      {/* Splashes Button */}
      <TouchableOpacity style={styles.actionButton} onPress={handleSplash} hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}>
        <Text style={[styles.actionText, splashesCount > 0 && styles.activeAction]}>
          🫂
        </Text>
        <Text style={styles.actionLabel}>Hugs</Text>
        <Text style={[styles.actionText, splashesCount > 0 && styles.activeAction]}>
          {splashesCount}
        </Text>
      </TouchableOpacity>

      {/* Echoes Button */}
      <TouchableOpacity style={styles.actionButton} onPress={handleEcho}>
        <Text style={[styles.actionText, echoesCount > 0 && styles.activeAction]}>
          📣
        </Text>
        <Text style={styles.actionLabel}>Echoes</Text>
        <Text style={[styles.actionText, echoesCount > 0 && styles.activeAction]}>
          {echoesCount}
        </Text>
      </TouchableOpacity>

      {/* Gems Button */}
      <TouchableOpacity style={styles.actionButton} onPress={handlePearl}>
        <Text style={[styles.actionText, pearlsCount > 0 && styles.activeAction]}>
          💎
        </Text>
        <Text style={styles.actionLabel}>Gems</Text>
      </TouchableOpacity>

      {/* Anchor Wave Button */}
      <TouchableOpacity style={styles.actionButton} onPress={handleAnchor}>
        <Text style={[styles.actionText, isAnchored && styles.activeAction]}>
          ⚓
        </Text>
        <Text style={styles.actionLabel}>Anchor</Text>
      </TouchableOpacity>

      {/* Cast Wave Button */}
      <TouchableOpacity style={styles.actionButton} onPress={handleCast}>
        <Text style={[styles.actionText, isCasted && styles.activeAction]}>
          📡
        </Text>
        <Text style={styles.actionLabel}>Cast</Text>
      </TouchableOpacity>

      {/* Placeholder Button 1 */}
      <TouchableOpacity style={styles.actionButton}>
        <Text style={styles.actionText}>🔱</Text>
        <Text style={styles.actionLabel}>Placeholder 1</Text>
      </TouchableOpacity>

      {/* Placeholder Button 2 */}
      <TouchableOpacity style={styles.actionButton}>
        <Text style={styles.actionText}>🐚</Text>
        <Text style={styles.actionLabel}>Placeholder 2</Text>
      </TouchableOpacity>

      {/* Placeholder Button 3 */}
      <TouchableOpacity style={styles.actionButton}>
        <Text style={styles.actionText}></Text>
        <Text style={styles.actionLabel}></Text>
      </TouchableOpacity>

      {/* Placeholder Button 4 */}
      <TouchableOpacity style={styles.actionButton}>
        <Text style={styles.actionText}></Text>
        <Text style={styles.actionLabel}></Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// Styles
const styles = StyleSheet.create({
  actionBar: {
    paddingVertical: 5,
    paddingHorizontal: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    marginHorizontal: 10,
    marginBottom: 10,
  },
  actionButton: {
    alignItems: 'center',
    padding: 5,
  },
  actionText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  activeAction: {
    color: '#00ff88', // Highlight active interactions
  },
  actionLabel: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 2,
  },
});

export default PosterActionBar;