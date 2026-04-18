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
exports.canSendDirectMessage = exports.shouldFilterContent = void 0;
var react_1 = __importStar(require("react"));
var react_native_1 = require("react-native");
var async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
var ParentSafeHarbor = function (_a) {
    var userId = _a.userId, userAge = _a.userAge, onSettingsChange = _a.onSettingsChange;
    var _b = (0, react_1.useState)({
        shallowWatersMode: userAge ? userAge < 13 : false,
        lifeguardAlertsEnabled: true,
        buddySystemEnabled: userAge ? userAge < 18 : false,
        noCurrentZone: userAge ? userAge < 13 : false,
        ageVerified: false,
        restrictedContentHidden: true,
    }), settings = _b[0], setSettings = _b[1];
    var _c = (0, react_1.useState)(false), showSettings = _c[0], setShowSettings = _c[1];
    var slideAnim = react_1.default.useRef(new react_native_1.Animated.Value(0)).current;
    (0, react_1.useEffect)(function () {
        loadSettings();
    }, [userId]);
    (0, react_1.useEffect)(function () {
        react_native_1.Animated.spring(slideAnim, {
            toValue: showSettings ? 1 : 0,
            friction: 8,
            useNativeDriver: true,
        }).start();
    }, [showSettings]);
    var loadSettings = function () { return __awaiter(void 0, void 0, void 0, function () {
        var stored, loadedSettings, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, async_storage_1.default.getItem("safe_harbor_".concat(userId))];
                case 1:
                    stored = _a.sent();
                    if (stored) {
                        loadedSettings = JSON.parse(stored);
                        setSettings(loadedSettings);
                        onSettingsChange === null || onSettingsChange === void 0 ? void 0 : onSettingsChange(loadedSettings);
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error loading safety settings:', error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var updateSetting = function (key, value) { return __awaiter(void 0, void 0, void 0, function () {
        var newSettings, error_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    newSettings = __assign(__assign({}, settings), (_a = {}, _a[key] = value, _a));
                    setSettings(newSettings);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, async_storage_1.default.setItem("safe_harbor_".concat(userId), JSON.stringify(newSettings))];
                case 2:
                    _b.sent();
                    onSettingsChange === null || onSettingsChange === void 0 ? void 0 : onSettingsChange(newSettings);
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _b.sent();
                    console.error('Error saving safety settings:', error_2);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var translateX = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [400, 0],
    });
    return (<react_native_1.View style={styles.container}>
      {/* Toggle Button */}
      <react_native_1.Pressable style={styles.toggleButton} onPress={function () { return setShowSettings(!showSettings); }}>
        <react_native_1.Text style={styles.toggleIcon}>🛡️</react_native_1.Text>
      </react_native_1.Pressable>

      {/* Settings Panel */}
      <react_native_1.Animated.View style={[
            styles.settingsPanel,
            {
                transform: [{ translateX: translateX }],
            },
        ]}>
        <react_native_1.View style={styles.header}>
          <react_native_1.Text style={styles.title}>🛡️ Safe Harbor</react_native_1.Text>
          <react_native_1.Pressable onPress={function () { return setShowSettings(false); }}>
            <react_native_1.Text style={styles.closeButton}>✕</react_native_1.Text>
          </react_native_1.Pressable>
        </react_native_1.View>

        <react_native_1.ScrollView style={styles.settingsList}>
          {/* Shallow Waters Mode */}
          <react_native_1.View style={styles.settingItem}>
            <react_native_1.View style={styles.settingInfo}>
              <react_native_1.Text style={styles.settingTitle}>🏖️ Shallow Waters Mode</react_native_1.Text>
              <react_native_1.Text style={styles.settingDesc}>
                Age-appropriate content for users under 13
              </react_native_1.Text>
            </react_native_1.View>
            <react_native_1.Switch value={settings.shallowWatersMode} onValueChange={function (v) { return updateSetting('shallowWatersMode', v); }} trackColor={{ false: '#444', true: '#00C2FF' }} thumbColor={settings.shallowWatersMode ? '#00FFD1' : '#888'}/>
          </react_native_1.View>

          {/* Lifeguard Alerts */}
          <react_native_1.View style={styles.settingItem}>
            <react_native_1.View style={styles.settingInfo}>
              <react_native_1.Text style={styles.settingTitle}>👁️ Lifeguard Alerts</react_native_1.Text>
              <react_native_1.Text style={styles.settingDesc}>
                AI monitors content for safety
              </react_native_1.Text>
            </react_native_1.View>
            <react_native_1.Switch value={settings.lifeguardAlertsEnabled} onValueChange={function (v) { return updateSetting('lifeguardAlertsEnabled', v); }} trackColor={{ false: '#444', true: '#00C2FF' }} thumbColor={settings.lifeguardAlertsEnabled ? '#00FFD1' : '#888'}/>
          </react_native_1.View>

          {/* Buddy System */}
          <react_native_1.View style={styles.settingItem}>
            <react_native_1.View style={styles.settingInfo}>
              <react_native_1.Text style={styles.settingTitle}>👨‍👩‍👧 Buddy System</react_native_1.Text>
              <react_native_1.Text style={styles.settingDesc}>
                Parent/guardian can monitor activity
              </react_native_1.Text>
            </react_native_1.View>
            <react_native_1.Switch value={settings.buddySystemEnabled} onValueChange={function (v) { return updateSetting('buddySystemEnabled', v); }} trackColor={{ false: '#444', true: '#00C2FF' }} thumbColor={settings.buddySystemEnabled ? '#00FFD1' : '#888'}/>
          </react_native_1.View>

          {/* No Current Zone */}
          <react_native_1.View style={styles.settingItem}>
            <react_native_1.View style={styles.settingInfo}>
              <react_native_1.Text style={styles.settingTitle}>🚫 No Current Zone</react_native_1.Text>
              <react_native_1.Text style={styles.settingDesc}>
                Disable all direct messages
              </react_native_1.Text>
            </react_native_1.View>
            <react_native_1.Switch value={settings.noCurrentZone} onValueChange={function (v) { return updateSetting('noCurrentZone', v); }} trackColor={{ false: '#444', true: '#00C2FF' }} thumbColor={settings.noCurrentZone ? '#00FFD1' : '#888'}/>
          </react_native_1.View>

          {/* Hide Restricted Content */}
          <react_native_1.View style={styles.settingItem}>
            <react_native_1.View style={styles.settingInfo}>
              <react_native_1.Text style={styles.settingTitle}>🔒 Hide Restricted Content</react_native_1.Text>
              <react_native_1.Text style={styles.settingDesc}>
                Filter mature or sensitive content
              </react_native_1.Text>
            </react_native_1.View>
            <react_native_1.Switch value={settings.restrictedContentHidden} onValueChange={function (v) { return updateSetting('restrictedContentHidden', v); }} trackColor={{ false: '#444', true: '#00C2FF' }} thumbColor={settings.restrictedContentHidden ? '#00FFD1' : '#888'}/>
          </react_native_1.View>

          {/* Safety Info */}
          <react_native_1.View style={styles.safetyInfo}>
            <react_native_1.Text style={styles.safetyTitle}>🌊 Safety Tips</react_native_1.Text>
            <react_native_1.Text style={styles.safetyText}>
              • Never share personal information{'\n'}
              • Report inappropriate content{'\n'}
              • Block users who make you uncomfortable{'\n'}
              • Talk to a trusted adult if you need help
            </react_native_1.Text>
          </react_native_1.View>
        </react_native_1.ScrollView>
      </react_native_1.Animated.View>
    </react_native_1.View>);
};
var shouldFilterContent = function (settings, contentFlags) {
    if (!settings.restrictedContentHidden)
        return false;
    if (!contentFlags || contentFlags.length === 0)
        return false;
    var restrictedFlags = ['mature', 'sensitive', 'violence', 'adult'];
    return contentFlags.some(function (flag) { return restrictedFlags.includes(flag.toLowerCase()); });
};
exports.shouldFilterContent = shouldFilterContent;
var canSendDirectMessage = function (settings) {
    return !settings.noCurrentZone;
};
exports.canSendDirectMessage = canSendDirectMessage;
var styles = react_native_1.StyleSheet.create({
    container: {
        position: 'absolute',
        top: 160,
        right: 0,
        zIndex: 500,
    },
    toggleButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(76, 175, 80, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.6,
        shadowRadius: 8,
        elevation: 8,
        marginRight: 16,
    },
    toggleIcon: {
        fontSize: 24,
    },
    settingsPanel: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 320,
        height: 600,
        backgroundColor: 'rgba(10, 25, 41, 0.98)',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#4CAF50',
        padding: 16,
        shadowColor: '#4CAF50',
        shadowOffset: { width: -4, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    },
    title: {
        color: '#4CAF50',
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeButton: {
        color: 'white',
        fontSize: 24,
        paddingHorizontal: 8,
    },
    settingsList: {
        flex: 1,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    settingInfo: {
        flex: 1,
        marginRight: 12,
    },
    settingTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    settingDesc: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 12,
    },
    safetyInfo: {
        marginTop: 20,
        padding: 16,
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#4CAF50',
    },
    safetyTitle: {
        color: '#4CAF50',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    safetyText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 13,
        lineHeight: 20,
    },
});
exports.default = ParentSafeHarbor;
