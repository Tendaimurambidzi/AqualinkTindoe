"use strict";
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
// Import necessary components and hooks
var react_1 = __importStar(require("react"));
var react_native_1 = require("react-native");
var firestore_1 = __importDefault(require("@react-native-firebase/firestore"));
var netinfo_1 = __importDefault(require("@react-native-community/netinfo"));
var offlineQueueService_1 = require("../services/offlineQueueService");
// Function to fetch user data by ID
var fetchUserData = function (userId) { return __awaiter(void 0, void 0, void 0, function () {
    var userDoc, userData, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, (0, firestore_1.default)()
                        .collection('users')
                        .doc(userId)
                        .get()];
            case 1:
                userDoc = _a.sent();
                if (userDoc.exists()) {
                    userData = userDoc.data();
                    return [2 /*return*/, userData];
                }
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('Error fetching user data:', error_1);
                return [2 /*return*/, null];
            case 3: return [2 /*return*/, null];
        }
    });
}); };
// Main component
var PosterActionBar = function (_a) {
    var waveId = _a.waveId, currentUserId = _a.currentUserId, splashesCount = _a.splashesCount, echoesCount = _a.echoesCount, pearlsCount = _a.pearlsCount, isAnchored = _a.isAnchored, isCasted = _a.isCasted, onAdd = _a.onAdd, onRemove = _a.onRemove, onEcho = _a.onEcho, onPearl = _a.onPearl, onAnchor = _a.onAnchor, onCast = _a.onCast, creatorUserId = _a.creatorUserId, _b = _a.splashSyncStatus, splashSyncStatus = _b === void 0 ? 'idle' : _b, onRetrySplash = _a.onRetrySplash, translate = _a.translate;
    var _c = (0, react_1.useState)(false), hasHugged = _c[0], setHasHugged = _c[1]; // Initialize to false for instant response
    var _d = (0, react_1.useState)(false), hasEchoed = _d[0], setHasEchoed = _d[1]; // Initialize to false for instant response
    var _e = (0, react_1.useState)(isAnchored), hasAnchored = _e[0], setHasAnchored = _e[1];
    var _f = (0, react_1.useState)(isCasted), hasCasted = _f[0], setHasCasted = _f[1];
    var _g = (0, react_1.useState)(Math.max(0, splashesCount)), localHugsCount = _g[0], setLocalHugsCount = _g[1];
    var _h = (0, react_1.useState)(Math.max(0, echoesCount)), localEchoesCount = _h[0], setLocalEchoesCount = _h[1];
    // State for huggers dropdown
    var _j = (0, react_1.useState)(false), showHuggersDropdown = _j[0], setShowHuggersDropdown = _j[1];
    var _k = (0, react_1.useState)([]), huggersList = _k[0], setHuggersList = _k[1];
    var _l = (0, react_1.useState)(false), loadingHuggers = _l[0], setLoadingHuggers = _l[1];
    // Connectivity state
    var _m = (0, react_1.useState)(true), isOnline = _m[0], setIsOnline = _m[1];
    // Monitor connectivity
    (0, react_1.useEffect)(function () {
        var unsubscribe = netinfo_1.default.addEventListener(function (state) {
            var _a;
            setIsOnline((_a = state.isConnected) !== null && _a !== void 0 ? _a : true);
        });
        // Initial check
        netinfo_1.default.fetch().then(function (state) {
            var _a;
            setIsOnline((_a = state.isConnected) !== null && _a !== void 0 ? _a : true);
        });
        return unsubscribe;
    }, []);
    // Check if user has already interacted
    (0, react_1.useEffect)(function () {
        var checkInteractions = function () { return __awaiter(void 0, void 0, void 0, function () {
            var splashDoc, echoQuery, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, (0, firestore_1.default)()
                                .collection("waves/".concat(waveId, "/splashes"))
                                .doc(currentUserId)
                                .get()];
                    case 1:
                        splashDoc = _a.sent();
                        setHasHugged(splashDoc.exists);
                        return [4 /*yield*/, (0, firestore_1.default)()
                                .collection("waves/".concat(waveId, "/echoes"))
                                .where('userUid', '==', currentUserId)
                                .limit(1)
                                .get()];
                    case 2:
                        echoQuery = _a.sent();
                        // Add null check for echoQuery
                        setHasEchoed(echoQuery && !echoQuery.empty);
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        console.error('Error checking interactions:', error_2);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        checkInteractions();
    }, [waveId, currentUserId]);
    (0, react_1.useEffect)(function () {
        setLocalHugsCount(Math.max(0, splashesCount));
    }, [splashesCount]);
    (0, react_1.useEffect)(function () {
        setLocalEchoesCount(Math.max(0, echoesCount));
    }, [echoesCount]);
    (0, react_1.useEffect)(function () {
        setHasAnchored(isAnchored);
    }, [isAnchored]);
    (0, react_1.useEffect)(function () {
        setHasCasted(isCasted);
    }, [isCasted]);
    var handleHug = function () {
        // Immediate visual feedback - no blocking
        var newHasHugged = !hasHugged;
        setHasHugged(newHasHugged);
        setLocalHugsCount(function (prev) { return Math.max(0, prev + (newHasHugged ? 1 : -1)); });
        // Handle action based on connectivity - fire and forget
        if (isOnline) {
            // Call the parent callback for immediate sync
            if (newHasHugged) {
                // We just hugged, so this was an add action
                onAdd();
            }
            else {
                // We just unhugged, so this was a remove action
                onRemove();
            }
        }
        else {
            // Queue action for offline processing
            var actionType = newHasHugged ? 'splash' : 'unsplash';
            offlineQueueService_1.offlineQueueService.addAction(actionType, waveId);
        }
        // No blocking timeout - allow instant re-taps
    };
    var handleEcho = function () {
        // Immediate visual feedback
        if (!hasEchoed) {
            setHasEchoed(true);
            setLocalEchoesCount(function (prev) { return Math.max(0, prev + 1); });
        }
        // Handle action based on connectivity
        if (isOnline) {
            // Call the parent callback for immediate sync
            onEcho(waveId);
        }
        else {
            // Queue action for offline processing (basic echo without text for now)
            offlineQueueService_1.offlineQueueService.addAction('echo', waveId, { text: '' });
        }
        // No blocking timeout - allow instant re-taps
    };
    var fetchHuggers = function () { return __awaiter(void 0, void 0, void 0, function () {
        var splashesSnap, huggers, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (loadingHuggers)
                        return [2 /*return*/];
                    setLoadingHuggers(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, (0, firestore_1.default)()
                            .collection("waves/".concat(waveId, "/splashes"))
                            .orderBy('createdAt', 'desc')
                            .get()];
                case 2:
                    splashesSnap = _a.sent();
                    return [4 /*yield*/, Promise.all(splashesSnap.docs.map(function (doc) { return __awaiter(void 0, void 0, void 0, function () {
                            var splashData, userId, userData;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        splashData = doc.data();
                                        userId = doc.id;
                                        if (!userId)
                                            return [2 /*return*/, null];
                                        return [4 /*yield*/, fetchUserData(userId)];
                                    case 1:
                                        userData = _a.sent();
                                        if (!userData)
                                            return [2 /*return*/, null];
                                        return [2 /*return*/, {
                                                id: userId,
                                                name: userData.displayName || userData.username || 'User',
                                                photo: userData.photoURL || userData.userPhoto,
                                                timestamp: splashData.createdAt,
                                            }];
                                }
                            });
                        }); }))];
                case 3:
                    huggers = _a.sent();
                    setHuggersList(huggers.filter(Boolean));
                    setShowHuggersDropdown(true);
                    return [3 /*break*/, 6];
                case 4:
                    error_3 = _a.sent();
                    console.error('Error fetching huggers:', error_3);
                    react_native_1.Alert.alert(translate('feed.loadHuggersFailedTitle'), translate('feed.loadHuggersFailedBody'));
                    return [3 /*break*/, 6];
                case 5:
                    setLoadingHuggers(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handleHugAction = function () {
        // Perform the hug action (increment/decrement count)
        handleHug();
    };
    var handlePearl = function () {
        // Call the parent callback
        onPearl();
        // No blocking timeout - allow instant re-taps
    };
    var handleAnchor = function () {
        onAnchor();
    };
    var handleCast = function () {
        onCast();
    };
    return (<>
    <react_native_1.ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.textButtonsBar} keyboardShouldPersistTaps="handled" scrollEnabled={true} contentContainerStyle={{ flexDirection: 'row' }}>
      {/* Hugs Button (with icon and count) */}
      <react_native_1.Pressable onPress={handleHugAction} style={function (_a) {
            var pressed = _a.pressed;
            return [
                styles.textButton,
                pressed && styles.pressedButton
            ];
        }} accessibilityRole="button" accessibilityLabel={(hasHugged && Math.max(0, splashesCount) > 0)
            ? translate('feed.removeHug')
            : translate('feed.hugThisPost')} hitSlop={{ top: 20, bottom: 20, left: 10, right: 10 }} pressRetentionOffset={{ top: 20, bottom: 20, left: 10, right: 10 }} android_ripple={{ color: 'rgba(255, 255, 255, 0.3)', borderless: false }}>
        <react_native_1.View style={styles.buttonContent}>
          <react_native_1.Text style={[styles.actionIcon, (hasHugged && localHugsCount > 0) && styles.hugActive]}>
            {'\uD83E\uDEC2'}
          </react_native_1.Text>
          <react_native_1.Text style={[styles.actionLabel, (hasHugged && localHugsCount > 0) ? styles.blueCount : styles.whiteCount]}>
            {(hasHugged && localHugsCount > 0)
            ? translate('feed.hugged')
            : translate('feed.hug')} ({localHugsCount})
          </react_native_1.Text>
        </react_native_1.View>
      </react_native_1.Pressable>

      {splashSyncStatus === 'error' && (<react_native_1.Pressable onPress={onRetrySplash} style={function (_a) {
                var pressed = _a.pressed;
                return [
                    styles.retryButton,
                    pressed && styles.pressedButton
                ];
            }} accessibilityRole="button" accessibilityLabel={translate('feed.retryHugSync')} hitSlop={{ top: 20, bottom: 20, left: 10, right: 10 }} pressRetentionOffset={{ top: 20, bottom: 20, left: 10, right: 10 }} android_ripple={{ color: 'rgba(255, 255, 255, 0.3)', borderless: false }}>
          <react_native_1.View style={styles.buttonContent}>
            <react_native_1.Text style={styles.actionIconSmall}>{'\u21BB'}</react_native_1.Text>
            <react_native_1.Text style={styles.actionLabel}>{translate('feed.retryHug')}</react_native_1.Text>
          </react_native_1.View>
        </react_native_1.Pressable>)}

      {/* Echoes Button (with icon and count) */}
      <react_native_1.Pressable onPress={handleEcho} style={function (_a) {
            var pressed = _a.pressed;
            return [
                styles.textButton,
                pressed && styles.pressedButton
            ];
        }} accessibilityRole="button" accessibilityLabel={translate('feed.echoThisPost')} hitSlop={{ top: 20, bottom: 20, left: 10, right: 10 }} pressRetentionOffset={{ top: 20, bottom: 20, left: 10, right: 10 }} android_ripple={{ color: 'rgba(255, 255, 255, 0.3)', borderless: false }}>
        <react_native_1.View style={styles.buttonContent}>
          <react_native_1.Text style={[styles.actionIcon, hasEchoed && styles.echoActive]}>
            {'\uD83D\uDCE3'}
          </react_native_1.Text>
          <react_native_1.Text style={[styles.actionLabel, hasEchoed ? styles.blueCount : styles.whiteCount]}>
            {hasEchoed ? translate('feed.echoed') : translate('feed.echo')} ({localEchoesCount})
          </react_native_1.Text>
        </react_native_1.View>
      </react_native_1.Pressable>

      {/* Cast Wave Button - Only show for other users' posts */}
      {currentUserId !== creatorUserId && (<react_native_1.Pressable onPress={handleCast} style={function (_a) {
                var pressed = _a.pressed;
                return [
                    styles.textButton,
                    pressed && styles.pressedButton
                ];
            }} accessibilityRole="button" accessibilityLabel={translate('feed.castThisPost')} hitSlop={{ top: 20, bottom: 20, left: 10, right: 10 }} pressRetentionOffset={{ top: 20, bottom: 20, left: 10, right: 10 }} android_ripple={{ color: 'rgba(255, 255, 255, 0.3)', borderless: false }}>
          <react_native_1.View style={styles.buttonContent}>
            <react_native_1.Text style={[styles.actionIconSmall, hasCasted && styles.castActive]}>{'\uD83D\uDCE1'}</react_native_1.Text>
            <react_native_1.Text style={[styles.actionLabel, hasCasted ? styles.castLabelActive : styles.whiteCount]}>{translate('feed.cast')}</react_native_1.Text>
          </react_native_1.View>
        </react_native_1.Pressable>)}

      {/* Gems Button */}
      {currentUserId !== creatorUserId && (<react_native_1.Pressable onPress={handlePearl} style={function (_a) {
                var pressed = _a.pressed;
                return [
                    styles.textButton,
                    pressed && styles.pressedButton
                ];
            }} accessibilityRole="button" accessibilityLabel={translate('feed.sendGem')} hitSlop={{ top: 20, bottom: 20, left: 10, right: 10 }} pressRetentionOffset={{ top: 20, bottom: 20, left: 10, right: 10 }} android_ripple={{ color: 'rgba(255, 255, 255, 0.3)', borderless: false }}>
          <react_native_1.View style={styles.buttonContent}>
            <react_native_1.Text style={styles.actionIconSmall}>{'\uD83D\uDC8E'}</react_native_1.Text>
            <react_native_1.Text style={styles.actionLabel}>{translate('feed.gems')}</react_native_1.Text>
          </react_native_1.View>
        </react_native_1.Pressable>)}

      {/* Anchor Wave Button - Only show for other users' posts */}
      {currentUserId !== creatorUserId && (<react_native_1.Pressable onPress={handleAnchor} style={function (_a) {
                var pressed = _a.pressed;
                return [
                    styles.textButton,
                    pressed && styles.pressedButton
                ];
            }} accessibilityRole="button" accessibilityLabel={translate('feed.anchorThisPost')} hitSlop={{ top: 20, bottom: 20, left: 10, right: 10 }} pressRetentionOffset={{ top: 20, bottom: 20, left: 10, right: 10 }} android_ripple={{ color: 'rgba(255, 255, 255, 0.3)', borderless: false }}>
          <react_native_1.View style={styles.buttonContent}>
            <react_native_1.Text style={[styles.actionIconSmall, hasAnchored && styles.anchorActive]}>{'\u2693\uFE0F'}</react_native_1.Text>
            <react_native_1.Text style={[styles.actionLabel, hasAnchored ? styles.anchorLabelActive : styles.whiteCount]}>{translate('feed.anchor')}</react_native_1.Text>
          </react_native_1.View>
        </react_native_1.Pressable>)}

      </react_native_1.ScrollView>

    {/* Huggers Dropdown Modal */}
    <react_native_1.Modal visible={showHuggersDropdown} transparent={true} animationType="fade" onRequestClose={function () { return setShowHuggersDropdown(false); }}>
      <react_native_1.Pressable style={styles.modalOverlay} onPress={function () { return setShowHuggersDropdown(false); }}>
        <react_native_1.View style={styles.modalContent}>
          <react_native_1.Pressable onPress={function () { return setShowHuggersDropdown(false); }} style={styles.closeButton}>
            <react_native_1.Text style={styles.closeButtonText}>{'\u2715'}</react_native_1.Text>
          </react_native_1.Pressable>
          {loadingHuggers ? (<react_native_1.View style={styles.loadingContainer}>
              <react_native_1.Text style={styles.loadingText}>{translate('feed.loadingHuggers')}</react_native_1.Text>
            </react_native_1.View>) : huggersList.length === 0 ? (<react_native_1.View style={styles.emptyContainer}>
              <react_native_1.Text style={styles.emptyText}>{translate('feed.noHuggersYet')}</react_native_1.Text>
            </react_native_1.View>) : (<react_native_1.FlatList data={huggersList} keyExtractor={function (item) { return item.id; }} renderItem={function (_a) {
                var item = _a.item;
                return (<react_native_1.View style={styles.huggerItem}>
                  <react_native_1.Text style={styles.huggerName}>{item.name}</react_native_1.Text>
                  <react_native_1.Text style={styles.huggerTimestamp}>
                    {item.timestamp
                        ? new Date(item.timestamp.toDate()).toLocaleDateString()
                        : translate('feed.recently')}
                  </react_native_1.Text>
                </react_native_1.View>);
            }} style={styles.huggersList}/>)}
        </react_native_1.View>
      </react_native_1.Pressable>
    </react_native_1.Modal>
    </>);
};
// Styles
var styles = react_native_1.StyleSheet.create({
    actionBar: {
        paddingVertical: 4,
        paddingHorizontal: 0,
        backgroundColor: '#4b5563',
        borderRadius: 0,
        marginHorizontal: 0,
        marginBottom: 0,
        minHeight: 32,
        height: 38,
        width: '100%',
    },
    textButtonsBar: {
        paddingVertical: 6,
        paddingHorizontal: 0,
        backgroundColor: 'transparent',
        borderRadius: 0,
        marginHorizontal: 0,
        marginBottom: 0,
        minHeight: 34,
        height: 42,
        width: '100%',
    },
    actionButton: {
        alignItems: 'center',
        padding: 8,
        marginHorizontal: 20, // Increased spacing between buttons to prevent accidental clicks
    },
    iconButton: {
        alignItems: 'center',
        padding: 8,
        marginHorizontal: 20,
    },
    iconTouchable: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    textButton: {
        backgroundColor: 'transparent',
        borderRadius: 0,
        borderWidth: 0,
        borderColor: 'transparent',
        paddingHorizontal: 6,
        paddingVertical: 2,
        minWidth: 0,
        minHeight: 0,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 8,
        shadowColor: 'transparent',
        shadowOpacity: 0,
        shadowRadius: 0,
        shadowOffset: { width: 0, height: 0 },
        elevation: 0,
    },
    pressedButton: {
        opacity: 0.68,
        transform: [{ scale: 0.98 }],
    },
    disabledButton: {
        opacity: 0.65,
    },
    retryButton: {
        backgroundColor: 'transparent',
        borderRadius: 0,
        borderWidth: 0,
        borderColor: 'transparent',
        paddingHorizontal: 6,
        paddingVertical: 2,
        minWidth: 0,
        minHeight: 0,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 8,
        shadowColor: 'transparent',
        shadowOpacity: 0,
        shadowRadius: 0,
        shadowOffset: { width: 0, height: 0 },
        elevation: 0,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
    },
    actionIcon: {
        fontSize: 18,
        color: '#8D0000',
        fontWeight: 'bold',
        textShadowColor: 'rgba(0,0,0,0.72)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    activeAction: {
        color: '#00ff88', // Highlight active interactions
    },
    hugActive: {
        color: '#6FD6FF',
    },
    echoActive: {
        color: '#6FD6FF',
    },
    pearlActive: {
        color: '#ff0088', // Red for pearls/gems
    },
    anchorActive: {
        color: '#38BDF8',
    },
    castActive: {
        color: '#F59E0B',
    },
    actionLabel: {
        fontSize: 13,
        color: '#8D0000',
        marginRight: 2,
        fontWeight: '800',
        textShadowColor: 'rgba(0,0,0,0.82)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    huggedLabel: {
        color: '#1e88e5',
    },
    greenCount: {
        color: '#00ff88',
    },
    blueCount: {
        color: '#6FD6FF',
    },
    anchorLabelActive: {
        color: '#38BDF8',
    },
    castLabelActive: {
        color: '#F59E0B',
    },
    whiteCount: {
        color: '#8D0000',
    },
    actionIconSmall: {
        fontSize: 16,
        color: '#8D0000',
        marginRight: 2,
        textShadowColor: 'rgba(0,0,0,0.72)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    actionCount: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    activeCount: {
        color: '#00ff88', // Green for counts > 0
    },
    inactiveCount: {
        color: '#fff', // White for count = 0
    },
    iconContainer: {
        alignItems: 'center',
        position: 'relative',
    },
    iconCount: {
        position: 'absolute',
        top: -5,
        right: -5,
        fontSize: 10,
        fontWeight: 'bold',
        backgroundColor: '#333',
        borderRadius: 5,
        paddingHorizontal: 2,
        paddingVertical: 0,
        minWidth: 12,
        textAlign: 'center',
    },
    activeIconCount: {
        color: '#00ff88', // Green for counts > 0
    },
    inactiveIconCount: {
        color: '#fff', // Grey for count = 0
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 0,
        width: '90%',
        maxWidth: 400,
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    closeButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        padding: 8,
        zIndex: 1,
    },
    closeButtonText: {
        fontSize: 18,
        color: '#fff',
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
    },
    loadingText: {
        color: '#fff',
        fontSize: 16,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: '#fff',
        fontSize: 16,
    },
    huggersList: {
        maxHeight: 300,
    },
    huggerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    huggerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    huggerEmoji: {
        fontSize: 20,
    },
    huggerInfo: {
        flex: 1,
    },
    huggerName: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '500',
    },
    huggerTimestamp: {
        fontSize: 12,
        color: '#fff',
        marginTop: 2,
    },
    modalActions: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#333',
    },
    hugButton: {
        backgroundColor: '#8D0000',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
    },
    hugButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
exports.default = PosterActionBar;
