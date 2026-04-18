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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g.throw = verb(1), g.return = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y.return : op[0] ? y.throw || ((t = y.return) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
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
var auth_1 = __importDefault(require("@react-native-firebase/auth"));
var CollaborativeOceanCanvas = function (_a) {
    var visible = _a.visible, onClose = _a.onClose;
    var _b = (0, react_1.useState)('graffiti'), activeTab = _b[0], setActiveTab = _b[1];
    var _c = (0, react_1.useState)([]), graffiti = _c[0], setGraffiti = _c[1];
    var _d = (0, react_1.useState)([]), coralReef = _d[0], setCoralReef = _d[1];
    var _e = (0, react_1.useState)([]), bottles = _e[0], setBottles = _e[1];
    var _f = (0, react_1.useState)(''), newGraffitiText = _f[0], setNewGraffitiText = _f[1];
    var _g = (0, react_1.useState)(''), newBottleMessage = _g[0], setNewBottleMessage = _g[1];
    var slideAnim = react_1.default.useRef(new react_native_1.Animated.Value(0)).current;
    (0, react_1.useEffect)(function () {
        react_native_1.Animated.spring(slideAnim, {
            toValue: visible ? 1 : 0,
            friction: 8,
            useNativeDriver: true,
        }).start();
        if (visible) {
            loadCanvasData();
        }
    }, [visible]);
    var loadCanvasData = function () { return __awaiter(void 0, void 0, void 0, function () {
        var graffitiSnap, coralSnap, user, bottlesSnap, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, (0, firestore_1.default)()
                            .collection('ocean_canvas')
                            .doc('beach_graffiti')
                            .collection('messages')
                            .orderBy('timestamp', 'desc')
                            .limit(50)
                            .get()];
                case 1:
                    graffitiSnap = _a.sent();
                    setGraffiti(graffitiSnap.docs.map(function (doc) { return (__assign({ id: doc.id }, doc.data())); }));
                    return [4 /*yield*/, (0, firestore_1.default)()
                            .collection('ocean_canvas')
                            .doc('coral_reef')
                            .collection('pieces')
                            .limit(100)
                            .get()];
                case 2:
                    coralSnap = _a.sent();
                    setCoralReef(coralSnap.docs.map(function (doc) { return (__assign({ id: doc.id }, doc.data())); }));
                    user = (0, auth_1.default)().currentUser;
                    if (!user) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, firestore_1.default)()
                            .collection('ocean_canvas')
                            .doc('message_bottles')
                            .collection('bottles')
                            .where('toUserId', 'in', [user.uid, null])
                            .orderBy('timestamp', 'desc')
                            .limit(20)
                            .get()];
                case 3:
                    bottlesSnap = _a.sent();
                    setBottles(bottlesSnap.docs.map(function (doc) { return (__assign({ id: doc.id }, doc.data())); }));
                    _a.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    error_1 = _a.sent();
                    console.error('Error loading canvas data:', error_1);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var addGraffiti = function () { return __awaiter(void 0, void 0, void 0, function () {
        var user, graffitiData, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!newGraffitiText.trim())
                        return [2 /*return*/];
                    user = (0, auth_1.default)().currentUser;
                    if (!user)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    graffitiData = {
                        text: newGraffitiText.trim(),
                        x: Math.random() * 300,
                        y: Math.random() * 400,
                        color: "hsl(".concat(Math.random() * 360, ", 70%, 60%)"),
                        userId: user.uid,
                        timestamp: Date.now(),
                    };
                    return [4 /*yield*/, (0, firestore_1.default)()
                            .collection('ocean_canvas')
                            .doc('beach_graffiti')
                            .collection('messages')
                            .add(graffitiData)];
                case 2:
                    _a.sent();
                    setNewGraffitiText('');
                    loadCanvasData();
                    react_native_1.Vibration.vibrate(30);
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error('Error adding graffiti:', error_2);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var addCoralPiece = function (waveId) { return __awaiter(void 0, void 0, void 0, function () {
        var user, coralData, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    user = (0, auth_1.default)().currentUser;
                    if (!user)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    coralData = {
                        waveId: waveId,
                        color: "hsl(".concat(Math.random() * 60 + 180, ", 80%, 50%)"),
                        shape: Math.floor(Math.random() * 5),
                        userId: user.uid,
                    };
                    return [4 /*yield*/, (0, firestore_1.default)()
                            .collection('ocean_canvas')
                            .doc('coral_reef')
                            .collection('pieces')
                            .add(coralData)];
                case 2:
                    _a.sent();
                    loadCanvasData();
                    react_native_1.Vibration.vibrate([0, 50, 50, 50]);
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    console.error('Error adding coral:', error_3);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var sendMessageBottle = function () { return __awaiter(void 0, void 0, void 0, function () {
        var user, bottleData, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!newBottleMessage.trim())
                        return [2 /*return*/];
                    user = (0, auth_1.default)().currentUser;
                    if (!user)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    bottleData = {
                        message: newBottleMessage.trim(),
                        fromUserId: user.uid,
                        toUserId: undefined, // Random recipient
                        opened: false,
                        timestamp: Date.now(),
                    };
                    return [4 /*yield*/, (0, firestore_1.default)()
                            .collection('ocean_canvas')
                            .doc('message_bottles')
                            .collection('bottles')
                            .add(bottleData)];
                case 2:
                    _a.sent();
                    setNewBottleMessage('');
                    react_native_1.Vibration.vibrate([0, 30, 30, 30]);
                    return [3 /*break*/, 4];
                case 3:
                    error_4 = _a.sent();
                    console.error('Error sending bottle:', error_4);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var openBottle = function (bottleId) { return __awaiter(void 0, void 0, void 0, function () {
        var error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, firestore_1.default)()
                            .collection('ocean_canvas')
                            .doc('message_bottles')
                            .collection('bottles')
                            .doc(bottleId)
                            .update({ opened: true })];
                case 1:
                    _a.sent();
                    loadCanvasData();
                    react_native_1.Vibration.vibrate(50);
                    return [3 /*break*/, 3];
                case 2:
                    error_5 = _a.sent();
                    console.error('Error opening bottle:', error_5);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var translateY = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [800, 0],
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
        <react_native_1.Text style={styles.title}>🌊 Ocean Canvas</react_native_1.Text>
        <react_native_1.Pressable onPress={onClose} style={styles.closeButton}>
          <react_native_1.Text style={styles.closeText}>✕</react_native_1.Text>
        </react_native_1.Pressable>
      </react_native_1.View>

      {/* Tabs */}
      <react_native_1.View style={styles.tabs}>
        <react_native_1.Pressable style={[styles.tab, activeTab === 'graffiti' && styles.tabActive]} onPress={function () { return setActiveTab('graffiti'); }}>
          <react_native_1.Text style={styles.tabEmoji}>✍️</react_native_1.Text>
          <react_native_1.Text style={styles.tabText}>Graffiti</react_native_1.Text>
        </react_native_1.Pressable>
        <react_native_1.Pressable style={[styles.tab, activeTab === 'coral' && styles.tabActive]} onPress={function () { return setActiveTab('coral'); }}>
          <react_native_1.Text style={styles.tabEmoji}>🪸</react_native_1.Text>
          <react_native_1.Text style={styles.tabText}>Coral</react_native_1.Text>
        </react_native_1.Pressable>
        <react_native_1.Pressable style={[styles.tab, activeTab === 'bottles' && styles.tabActive]} onPress={function () { return setActiveTab('bottles'); }}>
          <react_native_1.Text style={styles.tabEmoji}>🍾</react_native_1.Text>
          <react_native_1.Text style={styles.tabText}>Bottles</react_native_1.Text>
        </react_native_1.Pressable>
        <react_native_1.Pressable style={[styles.tab, activeTab === 'sandcastle' && styles.tabActive]} onPress={function () { return setActiveTab('sandcastle'); }}>
          <react_native_1.Text style={styles.tabEmoji}>🏰</react_native_1.Text>
          <react_native_1.Text style={styles.tabText}>Castle</react_native_1.Text>
        </react_native_1.Pressable>
      </react_native_1.View>

      {/* Content */}
      <react_native_1.ScrollView style={styles.content}>
        {activeTab === 'graffiti' && (<react_native_1.View style={styles.graffitiContainer}>
            <react_native_1.Text style={styles.sectionTitle}>Beach Graffiti Wall</react_native_1.Text>
            <react_native_1.View style={styles.inputContainer}>
              <react_native_1.TextInput style={styles.input} placeholder="Write on the beach..." placeholderTextColor="rgba(255, 255, 255, 0.5)" value={newGraffitiText} onChangeText={setNewGraffitiText} maxLength={50}/>
              <react_native_1.Pressable style={styles.sendButton} onPress={addGraffiti}>
                <react_native_1.Text style={styles.sendButtonText}>✏️ Write</react_native_1.Text>
              </react_native_1.Pressable>
            </react_native_1.View>
            <react_native_1.View style={styles.graffitiWall}>
              {graffiti.map(function (g) { return (<react_native_1.Text key={g.id} style={[
                    styles.graffitiText,
                    {
                        left: g.x,
                        top: g.y,
                        color: g.color,
                        transform: [{ rotate: "".concat(Math.random() * 20 - 10, "deg") }],
                    },
                ]}>
                  {g.text}
                </react_native_1.Text>); })}
            </react_native_1.View>
          </react_native_1.View>)}

        {activeTab === 'coral' && (<react_native_1.View style={styles.coralContainer}>
            <react_native_1.Text style={styles.sectionTitle}>Community Coral Reef</react_native_1.Text>
            <react_native_1.Text style={styles.sectionDesc}>Post waves to grow the reef!</react_native_1.Text>
            <react_native_1.View style={styles.coralReef}>
              {coralReef.map(function (coral) { return (<react_native_1.View key={coral.id} style={[
                    styles.coral,
                    {
                        backgroundColor: coral.color,
                        borderRadius: coral.shape * 4,
                    },
                ]}/>); })}
            </react_native_1.View>
            <react_native_1.Text style={styles.coralCount}>🪸 {coralReef.length} coral pieces</react_native_1.Text>
          </react_native_1.View>)}

        {activeTab === 'bottles' && (<react_native_1.View style={styles.bottlesContainer}>
            <react_native_1.Text style={styles.sectionTitle}>Messages in Bottles</react_native_1.Text>
            <react_native_1.View style={styles.inputContainer}>
              <react_native_1.TextInput style={styles.input} placeholder="Write a secret message..." placeholderTextColor="rgba(255, 255, 255, 0.5)" value={newBottleMessage} onChangeText={setNewBottleMessage} maxLength={100} multiline/>
              <react_native_1.Pressable style={styles.sendButton} onPress={sendMessageBottle}>
                <react_native_1.Text style={styles.sendButtonText}>🍾 Send</react_native_1.Text>
              </react_native_1.Pressable>
            </react_native_1.View>
            <react_native_1.View style={styles.bottlesList}>
              {bottles.map(function (bottle) { return (<react_native_1.Pressable key={bottle.id} style={[styles.bottle, bottle.opened && styles.bottleOpened]} onPress={function () { return !bottle.opened && openBottle(bottle.id); }}>
                  <react_native_1.Text style={styles.bottleEmoji}>{bottle.opened ? '📜' : '🍾'}</react_native_1.Text>
                  {bottle.opened && (<react_native_1.Text style={styles.bottleMessage}>{bottle.message}</react_native_1.Text>)}
                </react_native_1.Pressable>); })}
            </react_native_1.View>
          </react_native_1.View>)}

        {activeTab === 'sandcastle' && (<react_native_1.View style={styles.sandcastleContainer}>
            <react_native_1.Text style={styles.sectionTitle}>🏰 Collaborative Sandcastle</react_native_1.Text>
            <react_native_1.Text style={styles.sectionDesc}>Coming soon: Build together in AR!</react_native_1.Text>
            <react_native_1.View style={styles.sandcastlePreview}>
              <react_native_1.Text style={styles.sandcastleEmoji}>🏰</react_native_1.Text>
              <react_native_1.Text style={styles.sandcastleText}>Under construction...</react_native_1.Text>
            </react_native_1.View>
          </react_native_1.View>)}
      </react_native_1.ScrollView>
    </react_native_1.Animated.View>);
};
var styles = react_native_1.StyleSheet.create({
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
exports.default = CollaborativeOceanCanvas;
