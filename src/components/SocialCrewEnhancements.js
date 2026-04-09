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
    o["default"] = v;
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var react_native_1 = require("react-native");
var firestore_1 = __importDefault(require("@react-native-firebase/firestore"));
var SocialCrewEnhancements = function (_a) {
    var crewId = _a.crewId, userId = _a.userId, visible = _a.visible, onClose = _a.onClose;
    var _b = (0, react_1.useState)(null), crewBoat = _b[0], setCrewBoat = _b[1];
    var _c = (0, react_1.useState)([]), activeExpeditions = _c[0], setActiveExpeditions = _c[1];
    var _d = (0, react_1.useState)(false), beaconActive = _d[0], setBeaconActive = _d[1];
    var slideAnim = react_1.default.useRef(new react_native_1.Animated.Value(0)).current;
    var beaconAnim = react_1.default.useRef(new react_native_1.Animated.Value(0)).current;
    (0, react_1.useEffect)(function () {
        react_native_1.Animated.spring(slideAnim, {
            toValue: visible ? 1 : 0,
            friction: 8,
            useNativeDriver: true,
        }).start();
        if (visible) {
            loadCrewData();
        }
    }, [visible, crewId]);
    (0, react_1.useEffect)(function () {
        if (beaconActive) {
            react_native_1.Animated.loop(react_native_1.Animated.sequence([
                react_native_1.Animated.timing(beaconAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                react_native_1.Animated.timing(beaconAnim, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])).start();
        }
        else {
            beaconAnim.setValue(0);
        }
    }, [beaconActive]);
    var loadCrewData = function () { return __awaiter(void 0, void 0, void 0, function () {
        var boatDoc, defaultBoat, expeditionsSnap, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, (0, firestore_1.default)()
                            .collection('crews')
                            .doc(crewId)
                            .collection('boat')
                            .doc('info')
                            .get()];
                case 1:
                    boatDoc = _a.sent();
                    if (!boatDoc.exists()) return [3 /*break*/, 2];
                    setCrewBoat(boatDoc.data());
                    return [3 /*break*/, 4];
                case 2:
                    defaultBoat = {
                        id: crewId,
                        type: 'sailboat',
                        color: '#00C2FF',
                        level: 1,
                    };
                    return [4 /*yield*/, (0, firestore_1.default)()
                            .collection('crews')
                            .doc(crewId)
                            .collection('boat')
                            .doc('info')
                            .set(defaultBoat)];
                case 3:
                    _a.sent();
                    setCrewBoat(defaultBoat);
                    _a.label = 4;
                case 4: return [4 /*yield*/, (0, firestore_1.default)()
                        .collection('crews')
                        .doc(crewId)
                        .collection('expeditions')
                        .where('endTime', '>', Date.now())
                        .get()];
                case 5:
                    expeditionsSnap = _a.sent();
                    setActiveExpeditions(expeditionsSnap.docs.map(function (doc) { return (__assign({ id: doc.id }, doc.data())); }));
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    console.error('Error loading crew data:', error_1);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var upgradeBoat = function () { return __awaiter(void 0, void 0, void 0, function () {
        var boatTypes, currentIndex, nextType, updatedBoat, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!crewBoat)
                        return [2 /*return*/];
                    boatTypes = ['sailboat', 'yacht', 'pirateship', 'submarine'];
                    currentIndex = boatTypes.indexOf(crewBoat.type);
                    nextType = boatTypes[Math.min(currentIndex + 1, boatTypes.length - 1)];
                    updatedBoat = __assign(__assign({}, crewBoat), { type: nextType, level: crewBoat.level + 1 });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, firestore_1.default)()
                            .collection('crews')
                            .doc(crewId)
                            .collection('boat')
                            .doc('info')
                            .update(updatedBoat)];
                case 2:
                    _a.sent();
                    setCrewBoat(updatedBoat);
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error('Error upgrading boat:', error_2);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var sendLighthouseBeacon = function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setBeaconActive(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, firestore_1.default)()
                            .collection('crews')
                            .doc(crewId)
                            .collection('beacons')
                            .add({
                            userId: userId,
                            timestamp: Date.now(),
                            message: 'Crew rally signal!',
                        })];
                case 2:
                    _a.sent();
                    setTimeout(function () { return setBeaconActive(false); }, 5000);
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    console.error('Error sending beacon:', error_3);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var getBoatEmoji = function (type) {
        switch (type) {
            case 'sailboat': return '⛵';
            case 'yacht': return '🛥️';
            case 'pirateship': return '🏴‍☠️';
            case 'submarine': return '🚢';
            default: return '⛵';
        }
    };
    var translateY = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [600, 0],
    });
    var beaconScale = beaconAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.5],
    });
    var beaconOpacity = beaconAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0],
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
        <react_native_1.Text style={styles.title}>⚓ Crew Command</react_native_1.Text>
        <react_native_1.Pressable onPress={onClose} style={styles.closeButton}>
          <react_native_1.Text style={styles.closeText}>✕</react_native_1.Text>
        </react_native_1.Pressable>
      </react_native_1.View>

      {/* Crew Boat */}
      {crewBoat && (<react_native_1.View style={styles.boatSection}>
          <react_native_1.Text style={styles.sectionTitle}>🚢 Crew Boat</react_native_1.Text>
          <react_native_1.View style={[styles.boatCard, { borderColor: crewBoat.color }]}>
            <react_native_1.Text style={styles.boatEmoji}>{getBoatEmoji(crewBoat.type)}</react_native_1.Text>
            <react_native_1.Text style={styles.boatType}>
              {crewBoat.type.charAt(0).toUpperCase() + crewBoat.type.slice(1)}
            </react_native_1.Text>
            <react_native_1.Text style={styles.boatLevel}>Level {crewBoat.level}</react_native_1.Text>
            <react_native_1.Pressable style={styles.upgradeButton} onPress={upgradeBoat}>
              <react_native_1.Text style={styles.upgradeButtonText}>⬆️ Upgrade</react_native_1.Text>
            </react_native_1.Pressable>
          </react_native_1.View>
        </react_native_1.View>)}

      {/* Fishing Expeditions */}
      <react_native_1.View style={styles.expeditionsSection}>
        <react_native_1.Text style={styles.sectionTitle}>🎣 Fishing Expeditions</react_native_1.Text>
        {activeExpeditions.length === 0 ? (<react_native_1.Text style={styles.emptyText}>No active expeditions</react_native_1.Text>) : (activeExpeditions.map(function (exp) { return (<react_native_1.View key={exp.id} style={styles.expeditionCard}>
              <react_native_1.Text style={styles.expeditionTitle}>{exp.title}</react_native_1.Text>
              <react_native_1.Text style={styles.expeditionDesc}>{exp.description}</react_native_1.Text>
              <react_native_1.View style={styles.expeditionProgress}>
                <react_native_1.View style={styles.progressBar}>
                  <react_native_1.View style={[
                styles.progressFill,
                {
                    width: "".concat((exp.currentCount / exp.targetCount) * 100, "%"),
                },
            ]}/>
                </react_native_1.View>
                <react_native_1.Text style={styles.progressText}>
                  {exp.currentCount} / {exp.targetCount}
                </react_native_1.Text>
              </react_native_1.View>
              <react_native_1.Text style={styles.expeditionReward}>🏆 {exp.reward}</react_native_1.Text>
            </react_native_1.View>); }))}
      </react_native_1.View>

      {/* Lighthouse Beacon */}
      <react_native_1.View style={styles.beaconSection}>
        <react_native_1.Text style={styles.sectionTitle}>🗼 Lighthouse Beacon</react_native_1.Text>
        <react_native_1.Pressable style={[styles.beaconButton, beaconActive && styles.beaconButtonActive]} onPress={sendLighthouseBeacon} disabled={beaconActive}>
          <react_native_1.Animated.Text style={[
            styles.beaconEmoji,
            {
                transform: [{ scale: beaconScale }],
                opacity: beaconActive ? beaconOpacity : 1,
            },
        ]}>
            🗼
          </react_native_1.Animated.Text>
          <react_native_1.Text style={styles.beaconText}>
            {beaconActive ? 'Signal Sent!' : 'Rally Crew'}
          </react_native_1.Text>
        </react_native_1.Pressable>
      </react_native_1.View>

      {/* Port Gatherings */}
      <react_native_1.View style={styles.portSection}>
        <react_native_1.Text style={styles.sectionTitle}>⚓ Port Gatherings</react_native_1.Text>
        <react_native_1.Text style={styles.portText}>
          Coordinate meetups at your local beach or marina
        </react_native_1.Text>
        <react_native_1.Pressable style={styles.portButton}>
          <react_native_1.Text style={styles.portButtonText}>📍 Find Nearby Ports</react_native_1.Text>
        </react_native_1.Pressable>
      </react_native_1.View>
    </react_native_1.Animated.View>);
};
var styles = react_native_1.StyleSheet.create({
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
exports.default = SocialCrewEnhancements;
