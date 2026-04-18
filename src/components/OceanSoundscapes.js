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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
var react_1 = __importStar(require("react"));
var react_native_1 = require("react-native");
var react_native_video_1 = __importDefault(require("react-native-video"));
var SOUND_SOURCES = {
    waves: require('../../assets/downfall-3-208028.mp3'),
    seagulls: require('../../assets/falcon.mp3'),
    whales: require('../../assets/sci-fi-sound-effect-designed-circuits-hum-10-200831.mp3'),
    bubbles: require('../../assets/large-underwater-explosion-190270.mp3'),
    dolphins: require('../../assets/sci-fi-sound-effect-designed-circuits-hum-10-200831.mp3'),
    bonfire: require('../../assets/downfall-3-208028.mp3'),
};
var OceanSoundscapes = function (_a) {
    var enabled = _a.enabled, onToggle = _a.onToggle;
    var _b = (0, react_1.useState)(false), expanded = _b[0], setExpanded = _b[1];
    var _c = (0, react_1.useState)([
        { type: 'waves', volume: 0.6, enabled: true },
        { type: 'seagulls', volume: 0.3, enabled: false },
        { type: 'whales', volume: 0.4, enabled: false },
        { type: 'bubbles', volume: 0.5, enabled: false },
        { type: 'dolphins', volume: 0.4, enabled: false },
        { type: 'bonfire', volume: 0.3, enabled: false },
    ]), soundLayers = _c[0], setSoundLayers = _c[1];
    var slideAnim = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    (0, react_1.useEffect)(function () {
        react_native_1.Animated.spring(slideAnim, {
            toValue: expanded ? 1 : 0,
            friction: 8,
            useNativeDriver: true,
        }).start();
    }, [expanded]);
    (0, react_1.useEffect)(function () {
        if (!enabled) {
            // Stop all sounds
            console.log('Stopping all ocean soundscapes');
        }
        else {
            // Start enabled sounds
            soundLayers.forEach(function (layer) {
                if (layer.enabled) {
                    console.log("Playing ".concat(layer.type, " at volume ").concat(layer.volume));
                }
            });
        }
    }, [enabled, soundLayers]);
    var toggleSound = function (type) {
        setSoundLayers(function (prev) {
            return prev.map(function (layer) {
                return layer.type === type ? __assign(__assign({}, layer), { enabled: !layer.enabled }) : layer;
            });
        });
    };
    var getSoundEmoji = function (type) {
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
    var translateY = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [200, 0],
    });
    if (!enabled)
        return null;
    var activeSoundLayers = soundLayers.filter(function (layer) { return layer.enabled; });
    return (<react_native_1.View style={styles.container}>
      {/* Toggle button */}
      <react_native_1.Pressable style={styles.toggleButton} onPress={function () { return setExpanded(!expanded); }}>
        <react_native_1.Text style={styles.toggleIcon}>🎵</react_native_1.Text>
      </react_native_1.Pressable>

      {/* Sound mixer panel */}
      <react_native_1.Animated.View style={[
            styles.mixerPanel,
            {
                transform: [{ translateY: translateY }],
            },
        ]}>
        <react_native_1.View style={styles.mixerHeader}>
          <react_native_1.Text style={styles.mixerTitle}>Ocean Soundscapes</react_native_1.Text>
          <react_native_1.Pressable onPress={function () { return setExpanded(false); }}>
            <react_native_1.Text style={styles.closeButton}>✕</react_native_1.Text>
          </react_native_1.Pressable>
        </react_native_1.View>

        <react_native_1.View style={styles.soundList}>
          {soundLayers.map(function (layer) { return (<react_native_1.Pressable key={layer.type} style={[
                styles.soundItem,
                layer.enabled && styles.soundItemActive,
            ]} onPress={function () { return toggleSound(layer.type); }}>
              <react_native_1.Text style={styles.soundEmoji}>{getSoundEmoji(layer.type)}</react_native_1.Text>
              <react_native_1.Text style={styles.soundLabel}>
                {layer.type.charAt(0).toUpperCase() + layer.type.slice(1)}
              </react_native_1.Text>
              <react_native_1.View style={styles.volumeIndicator}>
                <react_native_1.View style={[
                styles.volumeBar,
                {
                    width: "".concat(layer.volume * 100, "%"),
                    backgroundColor: layer.enabled ? '#00FFD1' : '#444',
                },
            ]}/>
              </react_native_1.View>
            </react_native_1.Pressable>); })}
        </react_native_1.View>
      </react_native_1.Animated.View>
      {activeSoundLayers.map(function (layer) { return (<react_native_video_1.default key={"ocean-sound-".concat(layer.type)} source={SOUND_SOURCES[layer.type]} audioOnly playInBackground ignoreSilentSwitch="ignore" repeat volume={layer.volume} style={styles.hiddenAudio}/>); })}
    </react_native_1.View>);
};
var styles = react_native_1.StyleSheet.create({
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
exports.default = OceanSoundscapes;
