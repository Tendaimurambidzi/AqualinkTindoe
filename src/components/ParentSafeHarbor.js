"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canSendDirectMessage = exports.shouldFilterContent = void 0;
var react_1 = require("react");
var react_native_1 = require("react-native");
var async_storage_1 = require("@react-native-async-storage/async-storage");
var ParentSafeHarbor = function (_a) {
    var userId = _a.userId, userAge = _a.userAge, onSettingsChange = _a.onSettingsChange;
    var _b = (0, react_1.useState)({
        shallowWatersMode: userAge ? userAge < 13 : false,
        ageVerified: false,
        restrictedContentHidden: true,
    }), settings = _b[0], setSettings = _b[1];
    var _c = (0, react_1.useState)(false), showSettings = _c[0], setShowSettings = _c[1];
    var slideAnim = react_1.default.useRef(new react_native_1.Animated.Value(0)).current;
    (0, react_1.useEffect)(function () {
        var loadSettings = function () { return Promise.resolve().then(function () { return __awaiter(void 0, void 0, void 0, function () {
            var stored, loadedSettings, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4, async_storage_1.default.getItem("safe_harbor_".concat(userId))];
                    case 1:
                        stored = _a.sent();
                        if (stored) {
                            loadedSettings = JSON.parse(stored);
                            setSettings(loadedSettings);
                            onSettingsChange === null || onSettingsChange === void 0 ? void 0 : onSettingsChange(loadedSettings);
                        }
                        return [3, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error('Error loading safety settings:', error_1);
                        return [3, 3];
                    case 3: return [2];
                }
            });
        }); }); };
        loadSettings();
    }, [userId, onSettingsChange]);
    (0, react_1.useEffect)(function () {
        react_native_1.Animated.spring(slideAnim, {
            toValue: showSettings ? 1 : 0,
            friction: 8,
            useNativeDriver: true,
        }).start();
    }, [showSettings, slideAnim]);
    var updateSetting = function (key, value) { return Promise.resolve().then(function () { return __awaiter(void 0, void 0, void 0, function () {
        var newSettings, error_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    newSettings = Object.assign(Object.assign({}, settings), (_a = {}, _a[key] = value, _a));
                    if (key === 'shallowWatersMode' && value) {
                        newSettings.restrictedContentHidden = true;
                    }
                    setSettings(newSettings);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4, async_storage_1.default.setItem("safe_harbor_".concat(userId), JSON.stringify(newSettings))];
                case 2:
                    _b.sent();
                    onSettingsChange === null || onSettingsChange === void 0 ? void 0 : onSettingsChange(newSettings);
                    return [3, 4];
                case 3:
                    error_2 = _b.sent();
                    console.error('Error saving safety settings:', error_2);
                    return [3, 4];
                case 4: return [2];
            }
        });
    }); }); };
    var translateX = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [400, 0],
    });
    return (<react_native_1.View style={styles.container}>
      <react_native_1.Pressable style={styles.toggleButton} onPress={function () { return setShowSettings(!showSettings); }}>
        <react_native_1.Text style={styles.toggleIcon}>Safe</react_native_1.Text>
      </react_native_1.Pressable>

      <react_native_1.Animated.View style={[
            styles.settingsPanel,
            {
                transform: [{ translateX: translateX }],
            },
        ]}>
        <react_native_1.View style={styles.header}>
          <react_native_1.Text style={styles.title}>Safe Harbor</react_native_1.Text>
          <react_native_1.Pressable onPress={function () { return setShowSettings(false); }}>
            <react_native_1.Text style={styles.closeButton}>X</react_native_1.Text>
          </react_native_1.Pressable>
        </react_native_1.View>

        <react_native_1.ScrollView style={styles.settingsList}>
          <react_native_1.View style={styles.settingItem}>
            <react_native_1.View style={styles.settingInfo}>
              <react_native_1.Text style={styles.settingTitle}>Shallow Waters Mode</react_native_1.Text>
              <react_native_1.Text style={styles.settingDesc}>
                Age-appropriate browsing for younger users.
              </react_native_1.Text>
            </react_native_1.View>
            <react_native_1.Switch value={!!settings.shallowWatersMode} onValueChange={function (v) { return updateSetting('shallowWatersMode', v); }} trackColor={{ false: '#444', true: '#00C2FF' }} thumbColor={settings.shallowWatersMode ? '#00FFD1' : '#888'}/>
          </react_native_1.View>

          <react_native_1.View style={styles.settingItem}>
            <react_native_1.View style={styles.settingInfo}>
              <react_native_1.Text style={styles.settingTitle}>Hide Restricted Content</react_native_1.Text>
              <react_native_1.Text style={styles.settingDesc}>
                Filter mature or sensitive content from view.
              </react_native_1.Text>
            </react_native_1.View>
            <react_native_1.Switch value={settings.restrictedContentHidden !== false} onValueChange={function (v) { return updateSetting('restrictedContentHidden', v); }} trackColor={{ false: '#444', true: '#00C2FF' }} thumbColor={settings.restrictedContentHidden !== false ? '#00FFD1' : '#888'}/>
          </react_native_1.View>
        </react_native_1.ScrollView>
      </react_native_1.Animated.View>
    </react_native_1.View>);
};
exports.default = ParentSafeHarbor;
var shouldFilterContent = function (settings, contentFlags) {
    if (!(settings === null || settings === void 0 ? void 0 : settings.restrictedContentHidden))
        return false;
    if (!contentFlags || contentFlags.length === 0)
        return false;
    var restrictedFlags = ['mature', 'sensitive', 'violence', 'adult'];
    return contentFlags.some(function (flag) { return restrictedFlags.includes(String(flag).toLowerCase()); });
};
exports.shouldFilterContent = shouldFilterContent;
var canSendDirectMessage = function () { return true; };
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
        marginRight: 16,
    },
    toggleIcon: {
        fontSize: 12,
        color: '#fff',
        fontWeight: '800',
    },
    settingsPanel: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 320,
        backgroundColor: 'rgba(10, 25, 41, 0.98)',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#4CAF50',
        padding: 16,
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
    title: { color: '#fff', fontWeight: '800', fontSize: 18 },
    closeButton: { color: '#fff', fontWeight: '800', fontSize: 16 },
    settingsList: { maxHeight: 420 },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.08)',
    },
    settingInfo: { flex: 1, paddingRight: 12 },
    settingTitle: { color: '#fff', fontWeight: '800', fontSize: 15 },
    settingDesc: { color: 'rgba(255,255,255,0.68)', fontSize: 12, marginTop: 4 },
});

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}
function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
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
        if (op[0] & 5) throw op[1];
        return { value: op[0] ? op[1] : void 0, done: true };
    }
}
