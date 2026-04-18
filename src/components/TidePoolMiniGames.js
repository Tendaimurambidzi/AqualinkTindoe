"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o.default = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var react_native_1 = require("react-native");
var TidePoolMiniGames = function (_a) {
    var visible = _a.visible, onComplete = _a.onComplete, onClose = _a.onClose;
    var _b = (0, react_1.useState)('starfish'), currentGame = _b[0], setCurrentGame = _b[1];
    var _c = (0, react_1.useState)(0), score = _c[0], setScore = _c[1];
    var _d = (0, react_1.useState)(false), gameActive = _d[0], setGameActive = _d[1];
    // Starfish Catch Game
    var _e = (0, react_1.useState)([]), starfishPositions = _e[0], setStarfishPositions = _e[1];
    var starfishTimer = (0, react_1.useRef)(null);
    // Hermit Crab Find Game
    var _f = (0, react_1.useState)([]), shells = _f[0], setShells = _f[1];
    // Wave Memory Game
    var _g = (0, react_1.useState)([]), wavePattern = _g[0], setWavePattern = _g[1];
    var _h = (0, react_1.useState)([]), userPattern = _h[0], setUserPattern = _h[1];
    var _j = (0, react_1.useState)(false), showingPattern = _j[0], setShowingPattern = _j[1];
    var slideAnim = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    (0, react_1.useEffect)(function () {
        react_native_1.Animated.spring(slideAnim, {
            toValue: visible ? 1 : 0,
            friction: 8,
            useNativeDriver: true,
        }).start();
        if (visible) {
            startGame(currentGame);
        }
        else {
            cleanupGame();
        }
    }, [visible, currentGame]);
    var startGame = function (game) {
        setGameActive(true);
        setScore(0);
        if (game === 'starfish') {
            startStarfishGame();
        }
        else if (game === 'hermitcrab') {
            startHermitCrabGame();
        }
        else if (game === 'wavememory') {
            startWaveMemoryGame();
        }
    };
    var startStarfishGame = function () {
        var spawnStarfish = function () {
            var newStarfish = {
                id: Date.now() + Math.random(),
                x: Math.random() * 220,
                y: Math.random() * 300,
                caught: false,
            };
            setStarfishPositions(function (prev) { return __spreadArray(__spreadArray([], prev.filter(function (s) { return !s.caught; }).slice(-4), true), [newStarfish], false); });
        };
        spawnStarfish();
        starfishTimer.current = setInterval(spawnStarfish, 1500);
        setTimeout(function () {
            cleanupGame();
            setGameActive(false);
            var coins = Math.floor(score / 2);
            onComplete(coins);
        }, 20000);
    };
    var catchStarfish = function (id) {
        setStarfishPositions(function (prev) {
            return prev.map(function (s) { return s.id === id ? __assign(__assign({}, s), { caught: true }) : s; });
        });
        setScore(function (prev) { return prev + 1; });
        react_native_1.Vibration.vibrate(20);
    };
    var startHermitCrabGame = function () {
        var newShells = Array.from({ length: 9 }, function (_, i) { return ({
            id: i,
            hasCrab: i === Math.floor(Math.random() * 9),
            revealed: false,
        }); });
        setShells(newShells);
    };
    var revealShell = function (id) {
        var shell = shells.find(function (s) { return s.id === id; });
        if (!shell || shell.revealed)
            return;
        setShells(function (prev) {
            return prev.map(function (s) { return s.id === id ? __assign(__assign({}, s), { revealed: true }) : s; });
        });
        if (shell.hasCrab) {
            setScore(function (prev) { return prev + 10; });
            react_native_1.Vibration.vibrate([0, 50, 50, 50]);
            setTimeout(function () {
                setGameActive(false);
                onComplete(10);
            }, 1000);
        }
        else {
            react_native_1.Vibration.vibrate(100);
        }
    };
    var startWaveMemoryGame = function () {
        var pattern = Array.from({ length: 4 }, function () { return Math.floor(Math.random() * 4); });
        setWavePattern(pattern);
        setUserPattern([]);
        setShowingPattern(true);
        // Show pattern with delays
        pattern.forEach(function (wave, index) {
            setTimeout(function () {
                react_native_1.Vibration.vibrate(50);
            }, index * 600);
        });
        setTimeout(function () {
            setShowingPattern(false);
        }, pattern.length * 600 + 500);
    };
    var addToUserPattern = function (wave) {
        var newPattern = __spreadArray(__spreadArray([], userPattern, true), [wave], false);
        setUserPattern(newPattern);
        react_native_1.Vibration.vibrate(30);
        if (newPattern.length === wavePattern.length) {
            var correct = newPattern.every(function (w, i) { return w === wavePattern[i]; });
            if (correct) {
                setScore(function (prev) { return prev + 20; });
                react_native_1.Vibration.vibrate([0, 50, 50, 50, 50, 50]);
                setTimeout(function () {
                    setGameActive(false);
                    onComplete(20);
                }, 1000);
            }
            else {
                react_native_1.Vibration.vibrate([0, 200, 100, 200]);
                setTimeout(function () {
                    setGameActive(false);
                    onComplete(0);
                }, 1000);
            }
        }
    };
    var cleanupGame = function () {
        if (starfishTimer.current) {
            clearInterval(starfishTimer.current);
        }
        setStarfishPositions([]);
        setShells([]);
        setWavePattern([]);
        setUserPattern([]);
    };
    var translateY = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [600, 0],
    });
    if (!visible)
        return null;
    return (<react_native_1.Animated.View style={[
            styles.container,
            {
                transform: [{ translateY: translateY }],
            },
        ]}>
      <react_native_1.View style={styles.header}>
        <react_native_1.Text style={styles.title}>🌊 Tide Pool Games</react_native_1.Text>
        <react_native_1.Pressable onPress={onClose} style={styles.closeButton}>
          <react_native_1.Text style={styles.closeText}>✕</react_native_1.Text>
        </react_native_1.Pressable>
      </react_native_1.View>

      <react_native_1.View style={styles.scoreContainer}>
        <react_native_1.Text style={styles.scoreLabel}>Score: {score}</react_native_1.Text>
        <react_native_1.Text style={styles.coinLabel}>🪙 Coins: {Math.floor(score / 2)}</react_native_1.Text>
      </react_native_1.View>

      {/* Game Selector */}
      <react_native_1.View style={styles.gameSelector}>
        <react_native_1.Pressable style={[styles.gameSelectorBtn, currentGame === 'starfish' && styles.gameSelectorBtnActive]} onPress={function () { return !gameActive && setCurrentGame('starfish'); }}>
          <react_native_1.Text style={styles.gameSelectorEmoji}>⭐</react_native_1.Text>
        </react_native_1.Pressable>
        <react_native_1.Pressable style={[styles.gameSelectorBtn, currentGame === 'hermitcrab' && styles.gameSelectorBtnActive]} onPress={function () { return !gameActive && setCurrentGame('hermitcrab'); }}>
          <react_native_1.Text style={styles.gameSelectorEmoji}>🦀</react_native_1.Text>
        </react_native_1.Pressable>
        <react_native_1.Pressable style={[styles.gameSelectorBtn, currentGame === 'wavememory' && styles.gameSelectorBtnActive]} onPress={function () { return !gameActive && setCurrentGame('wavememory'); }}>
          <react_native_1.Text style={styles.gameSelectorEmoji}>🌊</react_native_1.Text>
        </react_native_1.Pressable>
      </react_native_1.View>

      {/* Game Area */}
      <react_native_1.View style={styles.gameArea}>
        {currentGame === 'starfish' && (<react_native_1.View style={styles.starfishGame}>
            <react_native_1.Text style={styles.gameInstruction}>Tap the starfish!</react_native_1.Text>
            {starfishPositions.map(function (starfish) { return (!starfish.caught && (<react_native_1.Pressable key={starfish.id} style={[styles.starfish, { left: starfish.x, top: starfish.y }]} onPress={function () { return catchStarfish(starfish.id); }}>
                  <react_native_1.Text style={styles.starfishEmoji}>⭐</react_native_1.Text>
                </react_native_1.Pressable>)); })}
          </react_native_1.View>)}

        {currentGame === 'hermitcrab' && (<react_native_1.View style={styles.hermitCrabGame}>
            <react_native_1.Text style={styles.gameInstruction}>Find the hermit crab!</react_native_1.Text>
            <react_native_1.View style={styles.shellGrid}>
              {shells.map(function (shell) { return (<react_native_1.Pressable key={shell.id} style={[styles.shell, shell.revealed && styles.shellRevealed]} onPress={function () { return revealShell(shell.id); }}>
                  <react_native_1.Text style={styles.shellEmoji}>
                    {shell.revealed ? (shell.hasCrab ? '🦀' : '🐚') : '🐚'}
                  </react_native_1.Text>
                </react_native_1.Pressable>); })}
            </react_native_1.View>
          </react_native_1.View>)}

        {currentGame === 'wavememory' && (<react_native_1.View style={styles.waveMemoryGame}>
            <react_native_1.Text style={styles.gameInstruction}>
              {showingPattern ? 'Watch the pattern...' : 'Repeat the pattern!'}
            </react_native_1.Text>
            <react_native_1.View style={styles.waveGrid}>
              {[0, 1, 2, 3].map(function (wave) { return (<react_native_1.Pressable key={wave} style={[
                    styles.waveButton,
                    showingPattern && wavePattern.includes(wave) && styles.waveButtonActive,
                ]} onPress={function () { return !showingPattern && addToUserPattern(wave); }} disabled={showingPattern}>
                  <react_native_1.Text style={styles.waveEmoji}>🌊</react_native_1.Text>
                </react_native_1.Pressable>); })}
            </react_native_1.View>
          </react_native_1.View>)}
      </react_native_1.View>
    </react_native_1.Animated.View>);
};
var styles = react_native_1.StyleSheet.create({
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
exports.default = TidePoolMiniGames;
