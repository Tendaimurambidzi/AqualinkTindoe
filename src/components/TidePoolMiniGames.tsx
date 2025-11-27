import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Vibration } from 'react-native';

type GameType = 'starfish' | 'hermitcrab' | 'wavememory';

interface TidePoolMiniGamesProps {
  visible: boolean;
  onComplete: (earnedCoins: number) => void;
  onClose: () => void;
}

const TidePoolMiniGames: React.FC<TidePoolMiniGamesProps> = ({ visible, onComplete, onClose }) => {
  const [currentGame, setCurrentGame] = useState<GameType>('starfish');
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);

  // Starfish Catch Game
  const [starfishPositions, setStarfishPositions] = useState<Array<{ id: number; x: number; y: number; caught: boolean }>>([]);
  const starfishTimer = useRef<any>(null);

  // Hermit Crab Find Game
  const [shells, setShells] = useState<Array<{ id: number; hasCrab: boolean; revealed: boolean }>>([]);

  // Wave Memory Game
  const [wavePattern, setWavePattern] = useState<number[]>([]);
  const [userPattern, setUserPattern] = useState<number[]>([]);
  const [showingPattern, setShowingPattern] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 1 : 0,
      friction: 8,
      useNativeDriver: true,
    }).start();

    if (visible) {
      startGame(currentGame);
    } else {
      cleanupGame();
    }
  }, [visible, currentGame]);

  const startGame = (game: GameType) => {
    setGameActive(true);
    setScore(0);

    if (game === 'starfish') {
      startStarfishGame();
    } else if (game === 'hermitcrab') {
      startHermitCrabGame();
    } else if (game === 'wavememory') {
      startWaveMemoryGame();
    }
  };

  const startStarfishGame = () => {
    const spawnStarfish = () => {
      const newStarfish = {
        id: Date.now() + Math.random(),
        x: Math.random() * 220,
        y: Math.random() * 300,
        caught: false,
      };
      setStarfishPositions(prev => [...prev.filter(s => !s.caught).slice(-4), newStarfish]);
    };

    spawnStarfish();
    starfishTimer.current = setInterval(spawnStarfish, 1500);

    setTimeout(() => {
      cleanupGame();
      setGameActive(false);
      const coins = Math.floor(score / 2);
      onComplete(coins);
    }, 20000);
  };

  const catchStarfish = (id: number) => {
    setStarfishPositions(prev =>
      prev.map(s => s.id === id ? { ...s, caught: true } : s)
    );
    setScore(prev => prev + 1);
    Vibration.vibrate(20);
  };

  const startHermitCrabGame = () => {
    const newShells = Array.from({ length: 9 }, (_, i) => ({
      id: i,
      hasCrab: i === Math.floor(Math.random() * 9),
      revealed: false,
    }));
    setShells(newShells);
  };

  const revealShell = (id: number) => {
    const shell = shells.find(s => s.id === id);
    if (!shell || shell.revealed) return;

    setShells(prev =>
      prev.map(s => s.id === id ? { ...s, revealed: true } : s)
    );

    if (shell.hasCrab) {
      setScore(prev => prev + 10);
      Vibration.vibrate([0, 50, 50, 50]);
      setTimeout(() => {
        setGameActive(false);
        onComplete(10);
      }, 1000);
    } else {
      Vibration.vibrate(100);
    }
  };

  const startWaveMemoryGame = () => {
    const pattern = Array.from({ length: 4 }, () => Math.floor(Math.random() * 4));
    setWavePattern(pattern);
    setUserPattern([]);
    setShowingPattern(true);

    // Show pattern with delays
    pattern.forEach((wave, index) => {
      setTimeout(() => {
        Vibration.vibrate(50);
      }, index * 600);
    });

    setTimeout(() => {
      setShowingPattern(false);
    }, pattern.length * 600 + 500);
  };

  const addToUserPattern = (wave: number) => {
    const newPattern = [...userPattern, wave];
    setUserPattern(newPattern);
    Vibration.vibrate(30);

    if (newPattern.length === wavePattern.length) {
      const correct = newPattern.every((w, i) => w === wavePattern[i]);
      if (correct) {
        setScore(prev => prev + 20);
        Vibration.vibrate([0, 50, 50, 50, 50, 50]);
        setTimeout(() => {
          setGameActive(false);
          onComplete(20);
        }, 1000);
      } else {
        Vibration.vibrate([0, 200, 100, 200]);
        setTimeout(() => {
          setGameActive(false);
          onComplete(0);
        }, 1000);
      }
    }
  };

  const cleanupGame = () => {
    if (starfishTimer.current) {
      clearInterval(starfishTimer.current);
    }
    setStarfishPositions([]);
    setShells([]);
    setWavePattern([]);
    setUserPattern([]);
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
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
        <Text style={styles.title}>🌊 Tide Pool Games</Text>
        <Pressable onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
      </View>

      <View style={styles.scoreContainer}>
        <Text style={styles.scoreLabel}>Score: {score}</Text>
        <Text style={styles.coinLabel}>🪙 Coins: {Math.floor(score / 2)}</Text>
      </View>

      {/* Game Selector */}
      <View style={styles.gameSelector}>
        <Pressable
          style={[styles.gameSelectorBtn, currentGame === 'starfish' && styles.gameSelectorBtnActive]}
          onPress={() => !gameActive && setCurrentGame('starfish')}
        >
          <Text style={styles.gameSelectorEmoji}>⭐</Text>
        </Pressable>
        <Pressable
          style={[styles.gameSelectorBtn, currentGame === 'hermitcrab' && styles.gameSelectorBtnActive]}
          onPress={() => !gameActive && setCurrentGame('hermitcrab')}
        >
          <Text style={styles.gameSelectorEmoji}>🦀</Text>
        </Pressable>
        <Pressable
          style={[styles.gameSelectorBtn, currentGame === 'wavememory' && styles.gameSelectorBtnActive]}
          onPress={() => !gameActive && setCurrentGame('wavememory')}
        >
          <Text style={styles.gameSelectorEmoji}>🌊</Text>
        </Pressable>
      </View>

      {/* Game Area */}
      <View style={styles.gameArea}>
        {currentGame === 'starfish' && (
          <View style={styles.starfishGame}>
            <Text style={styles.gameInstruction}>Tap the starfish!</Text>
            {starfishPositions.map(starfish => (
              !starfish.caught && (
                <Pressable
                  key={starfish.id}
                  style={[styles.starfish, { left: starfish.x, top: starfish.y }]}
                  onPress={() => catchStarfish(starfish.id)}
                >
                  <Text style={styles.starfishEmoji}>⭐</Text>
                </Pressable>
              )
            ))}
          </View>
        )}

        {currentGame === 'hermitcrab' && (
          <View style={styles.hermitCrabGame}>
            <Text style={styles.gameInstruction}>Find the hermit crab!</Text>
            <View style={styles.shellGrid}>
              {shells.map(shell => (
                <Pressable
                  key={shell.id}
                  style={[styles.shell, shell.revealed && styles.shellRevealed]}
                  onPress={() => revealShell(shell.id)}
                >
                  <Text style={styles.shellEmoji}>
                    {shell.revealed ? (shell.hasCrab ? '🦀' : '🐚') : '🐚'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {currentGame === 'wavememory' && (
          <View style={styles.waveMemoryGame}>
            <Text style={styles.gameInstruction}>
              {showingPattern ? 'Watch the pattern...' : 'Repeat the pattern!'}
            </Text>
            <View style={styles.waveGrid}>
              {[0, 1, 2, 3].map(wave => (
                <Pressable
                  key={wave}
                  style={[
                    styles.waveButton,
                    showingPattern && wavePattern.includes(wave) && styles.waveButtonActive,
                  ]}
                  onPress={() => !showingPattern && addToUserPattern(wave)}
                  disabled={showingPattern}
                >
                  <Text style={styles.waveEmoji}>🌊</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
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
    marginBottom: 12,
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
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(0, 194, 255, 0.1)',
    borderRadius: 12,
  },
  scoreLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  coinLabel: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  gameSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  gameSelectorBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  gameSelectorBtnActive: {
    borderColor: '#00C2FF',
    backgroundColor: 'rgba(0, 194, 255, 0.2)',
  },
  gameSelectorEmoji: {
    fontSize: 32,
  },
  gameArea: {
    height: 350,
    backgroundColor: 'rgba(0, 50, 100, 0.3)',
    borderRadius: 16,
    padding: 16,
  },
  gameInstruction: {
    color: '#00FFD1',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  starfishGame: {
    flex: 1,
    position: 'relative',
  },
  starfish: {
    position: 'absolute',
  },
  starfishEmoji: {
    fontSize: 40,
  },
  hermitCrabGame: {
    flex: 1,
  },
  shellGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  shell: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  shellRevealed: {
    backgroundColor: 'rgba(0, 194, 255, 0.2)',
    borderColor: '#00C2FF',
  },
  shellEmoji: {
    fontSize: 32,
  },
  waveMemoryGame: {
    flex: 1,
  },
  waveGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  waveButton: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  waveButtonActive: {
    backgroundColor: 'rgba(0, 194, 255, 0.4)',
    borderColor: '#00FFD1',
  },
  waveEmoji: {
    fontSize: 36,
  },
});

export default TidePoolMiniGames;
