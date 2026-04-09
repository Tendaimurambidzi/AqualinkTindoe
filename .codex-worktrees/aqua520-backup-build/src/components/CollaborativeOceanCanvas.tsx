import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView, Animated, Vibration } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

interface CollaborativeOceanCanvasProps {
  visible: boolean;
  onClose: () => void;
}

interface BeachGraffiti {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  userId: string;
  timestamp: number;
}

interface CoralPiece {
  id: string;
  waveId: string;
  color: string;
  shape: number;
  userId: string;
}

interface MessageBottle {
  id: string;
  message: string;
  fromUserId: string;
  toUserId?: string;
  opened: boolean;
  timestamp: number;
}

const CollaborativeOceanCanvas: React.FC<CollaborativeOceanCanvasProps> = ({ visible, onClose }) => {
  const [activeTab, setActiveTab] = useState<'graffiti' | 'coral' | 'bottles' | 'sandcastle'>('graffiti');
  const [graffiti, setGraffiti] = useState<BeachGraffiti[]>([]);
  const [coralReef, setCoralReef] = useState<CoralPiece[]>([]);
  const [bottles, setBottles] = useState<MessageBottle[]>([]);
  const [newGraffitiText, setNewGraffitiText] = useState('');
  const [newBottleMessage, setNewBottleMessage] = useState('');
  
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 1 : 0,
      friction: 8,
      useNativeDriver: true,
    }).start();

    if (visible) {
      loadCanvasData();
    }
  }, [visible]);

  const loadCanvasData = async () => {
    try {
      // Load beach graffiti
      const graffitiSnap = await firestore()
        .collection('ocean_canvas')
        .doc('beach_graffiti')
        .collection('messages')
        .orderBy('timestamp', 'desc')
        .limit(50)
        .get();

      setGraffiti(
        graffitiSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as BeachGraffiti[]
      );

      // Load coral reef
      const coralSnap = await firestore()
        .collection('ocean_canvas')
        .doc('coral_reef')
        .collection('pieces')
        .limit(100)
        .get();

      setCoralReef(
        coralSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as CoralPiece[]
      );

      // Load message bottles
      const user = auth().currentUser;
      if (user) {
        const bottlesSnap = await firestore()
          .collection('ocean_canvas')
          .doc('message_bottles')
          .collection('bottles')
          .where('toUserId', 'in', [user.uid, null])
          .orderBy('timestamp', 'desc')
          .limit(20)
          .get();

        setBottles(
          bottlesSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as MessageBottle[]
        );
      }
    } catch (error) {
      console.error('Error loading canvas data:', error);
    }
  };

  const addGraffiti = async () => {
    if (!newGraffitiText.trim()) return;

    const user = auth().currentUser;
    if (!user) return;

    try {
      const graffitiData: Omit<BeachGraffiti, 'id'> = {
        text: newGraffitiText.trim(),
        x: Math.random() * 300,
        y: Math.random() * 400,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        userId: user.uid,
        timestamp: Date.now(),
      };

      await firestore()
        .collection('ocean_canvas')
        .doc('beach_graffiti')
        .collection('messages')
        .add(graffitiData);

      setNewGraffitiText('');
      loadCanvasData();
      Vibration.vibrate(30);
    } catch (error) {
      console.error('Error adding graffiti:', error);
    }
  };

  const addCoralPiece = async (waveId: string) => {
    const user = auth().currentUser;
    if (!user) return;

    try {
      const coralData: Omit<CoralPiece, 'id'> = {
        waveId,
        color: `hsl(${Math.random() * 60 + 180}, 80%, 50%)`,
        shape: Math.floor(Math.random() * 5),
        userId: user.uid,
      };

      await firestore()
        .collection('ocean_canvas')
        .doc('coral_reef')
        .collection('pieces')
        .add(coralData);

      loadCanvasData();
      Vibration.vibrate([0, 50, 50, 50]);
    } catch (error) {
      console.error('Error adding coral:', error);
    }
  };

  const sendMessageBottle = async () => {
    if (!newBottleMessage.trim()) return;

    const user = auth().currentUser;
    if (!user) return;

    try {
      const bottleData: Omit<MessageBottle, 'id'> = {
        message: newBottleMessage.trim(),
        fromUserId: user.uid,
        toUserId: undefined, // Random recipient
        opened: false,
        timestamp: Date.now(),
      };

      await firestore()
        .collection('ocean_canvas')
        .doc('message_bottles')
        .collection('bottles')
        .add(bottleData);

      setNewBottleMessage('');
      Vibration.vibrate([0, 30, 30, 30]);
    } catch (error) {
      console.error('Error sending bottle:', error);
    }
  };

  const openBottle = async (bottleId: string) => {
    try {
      await firestore()
        .collection('ocean_canvas')
        .doc('message_bottles')
        .collection('bottles')
        .doc(bottleId)
        .update({ opened: true });

      loadCanvasData();
      Vibration.vibrate(50);
    } catch (error) {
      console.error('Error opening bottle:', error);
    }
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [800, 0],
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
        <Text style={styles.title}>🌊 Ocean Canvas</Text>
        <Pressable onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, activeTab === 'graffiti' && styles.tabActive]}
          onPress={() => setActiveTab('graffiti')}
        >
          <Text style={styles.tabEmoji}>✍️</Text>
          <Text style={styles.tabText}>Graffiti</Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'coral' && styles.tabActive]}
          onPress={() => setActiveTab('coral')}
        >
          <Text style={styles.tabEmoji}>🪸</Text>
          <Text style={styles.tabText}>Coral</Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'bottles' && styles.tabActive]}
          onPress={() => setActiveTab('bottles')}
        >
          <Text style={styles.tabEmoji}>🍾</Text>
          <Text style={styles.tabText}>Bottles</Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'sandcastle' && styles.tabActive]}
          onPress={() => setActiveTab('sandcastle')}
        >
          <Text style={styles.tabEmoji}>🏰</Text>
          <Text style={styles.tabText}>Castle</Text>
        </Pressable>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {activeTab === 'graffiti' && (
          <View style={styles.graffitiContainer}>
            <Text style={styles.sectionTitle}>Beach Graffiti Wall</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Write on the beach..."
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={newGraffitiText}
                onChangeText={setNewGraffitiText}
                maxLength={50}
              />
              <Pressable style={styles.sendButton} onPress={addGraffiti}>
                <Text style={styles.sendButtonText}>✏️ Write</Text>
              </Pressable>
            </View>
            <View style={styles.graffitiWall}>
              {graffiti.map((g) => (
                <Text
                  key={g.id}
                  style={[
                    styles.graffitiText,
                    {
                      left: g.x,
                      top: g.y,
                      color: g.color,
                      transform: [{ rotate: `${Math.random() * 20 - 10}deg` }],
                    },
                  ]}
                >
                  {g.text}
                </Text>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'coral' && (
          <View style={styles.coralContainer}>
            <Text style={styles.sectionTitle}>Community Coral Reef</Text>
            <Text style={styles.sectionDesc}>Post waves to grow the reef!</Text>
            <View style={styles.coralReef}>
              {coralReef.map((coral) => (
                <View
                  key={coral.id}
                  style={[
                    styles.coral,
                    {
                      backgroundColor: coral.color,
                      borderRadius: coral.shape * 4,
                    },
                  ]}
                />
              ))}
            </View>
            <Text style={styles.coralCount}>🪸 {coralReef.length} coral pieces</Text>
          </View>
        )}

        {activeTab === 'bottles' && (
          <View style={styles.bottlesContainer}>
            <Text style={styles.sectionTitle}>Messages in Bottles</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Write a secret message..."
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={newBottleMessage}
                onChangeText={setNewBottleMessage}
                maxLength={100}
                multiline
              />
              <Pressable style={styles.sendButton} onPress={sendMessageBottle}>
                <Text style={styles.sendButtonText}>🍾 Send</Text>
              </Pressable>
            </View>
            <View style={styles.bottlesList}>
              {bottles.map((bottle) => (
                <Pressable
                  key={bottle.id}
                  style={[styles.bottle, bottle.opened && styles.bottleOpened]}
                  onPress={() => !bottle.opened && openBottle(bottle.id)}
                >
                  <Text style={styles.bottleEmoji}>{bottle.opened ? '📜' : '🍾'}</Text>
                  {bottle.opened && (
                    <Text style={styles.bottleMessage}>{bottle.message}</Text>
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'sandcastle' && (
          <View style={styles.sandcastleContainer}>
            <Text style={styles.sectionTitle}>🏰 Collaborative Sandcastle</Text>
            <Text style={styles.sectionDesc}>Coming soon: Build together in AR!</Text>
            <View style={styles.sandcastlePreview}>
              <Text style={styles.sandcastleEmoji}>🏰</Text>
              <Text style={styles.sandcastleText}>Under construction...</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '80%',
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
  tabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabActive: {
    backgroundColor: 'rgba(0, 194, 255, 0.3)',
    borderWidth: 1,
    borderColor: '#00C2FF',
  },
  tabEmoji: {
    fontSize: 20,
  },
  tabText: {
    color: 'white',
    fontSize: 11,
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    color: '#00FFD1',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDesc: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    color: 'white',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  sendButton: {
    backgroundColor: '#00C2FF',
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  graffitiContainer: {
    flex: 1,
  },
  graffitiWall: {
    height: 400,
    backgroundColor: 'rgba(194, 178, 128, 0.2)',
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  graffitiText: {
    position: 'absolute',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  coralContainer: {
    flex: 1,
  },
  coralReef: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 16,
    backgroundColor: 'rgba(0, 100, 150, 0.3)',
    borderRadius: 16,
    minHeight: 300,
  },
  coral: {
    width: 40,
    height: 40,
    opacity: 0.8,
  },
  coralCount: {
    color: 'white',
    textAlign: 'center',
    marginTop: 12,
    fontSize: 16,
  },
  bottlesContainer: {
    flex: 1,
  },
  bottlesList: {
    gap: 12,
  },
  bottle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(100, 149, 237, 0.2)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    gap: 12,
  },
  bottleOpened: {
    backgroundColor: 'rgba(0, 194, 255, 0.2)',
    borderColor: '#00C2FF',
  },
  bottleEmoji: {
    fontSize: 32,
  },
  bottleMessage: {
    flex: 1,
    color: 'white',
    fontSize: 14,
  },
  sandcastleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  sandcastlePreview: {
    alignItems: 'center',
    marginTop: 40,
  },
  sandcastleEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  sandcastleText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
  },
});

export default CollaborativeOceanCanvas;
