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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var react_native_1 = require("react-native");
var database_1 = __importDefault(require("@react-native-firebase/database"));
var ProfileAvatarWithCrew_1 = __importDefault(require("./ProfileAvatarWithCrew"));
var ProfilePreviewModal = function (_a) {
    var visible = _a.visible, userId = _a.userId, onClose = _a.onClose, onChat = _a.onChat;
    var _b = (0, react_1.useState)(null), userData = _b[0], setUserData = _b[1];
    var _c = (0, react_1.useState)(false), loading = _c[0], setLoading = _c[1];
    (0, react_1.useEffect)(function () {
        if (!visible || !userId) {
            setUserData(null);
            return;
        }
        setLoading(true);
        var userRef = (0, database_1.default)().ref("/users/".concat(userId));
        userRef.once('value')
            .then(function (snapshot) {
            var data = snapshot.val();
            setUserData(data);
        })
            .catch(function (error) {
            console.log('Error fetching user data:', error);
        })
            .finally(function () {
            setLoading(false);
        });
    }, [visible, userId]);
    if (!visible || !userId) {
        return null;
    }
    return (<react_native_1.Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <react_native_1.Pressable style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            justifyContent: 'center',
            alignItems: 'center',
        }} onPress={onClose}>
        <react_native_1.Pressable style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 24,
            width: '85%',
            maxWidth: 400,
            alignItems: 'center',
        }} onPress={function (e) { return e.stopPropagation(); }}>
          {loading ? (<react_native_1.ActivityIndicator size="large" color="#00C2FF"/>) : (<>
              {/* Profile Avatar */}
              <ProfileAvatarWithCrew_1.default userId={userId} size={80} showCrewCount={true} showFleetCount={false}/>

              {/* Username (single, clean) */}
              <react_native_1.Text style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: '#000',
                marginTop: 16,
                textAlign: 'center',
            }}>
                {(function () {
                var raw = (userData === null || userData === void 0 ? void 0 : userData.username) || (userData === null || userData === void 0 ? void 0 : userData.name) || (userData === null || userData === void 0 ? void 0 : userData.displayName) || 'User';
                if (!raw)
                    return 'User';
                var clean = String(raw).replace(/^[@/]+/, '');
                return '@' + clean;
            })()}
              </react_native_1.Text>

              {/* Bio */}
              {(userData === null || userData === void 0 ? void 0 : userData.bio) && (<react_native_1.Text style={{
                    fontSize: 14,
                    color: '#666',
                    marginTop: 8,
                    textAlign: 'center',
                    fontStyle: 'italic',
                }}>
                  {userData.bio}
                </react_native_1.Text>)}

              {/* Action Buttons */}
              <react_native_1.View style={{
                flexDirection: 'row',
                marginTop: 24,
                gap: 12,
            }}>
                {/* Chat Button */}
                <react_native_1.Pressable onPress={function () {
                onChat(userId, (userData === null || userData === void 0 ? void 0 : userData.name) || (userData === null || userData === void 0 ? void 0 : userData.displayName) || 'User');
                onClose();
            }} style={function (_a) {
                var pressed = _a.pressed;
                return [
                    {
                        backgroundColor: '#00C2FF',
                        paddingVertical: 12,
                        paddingHorizontal: 24,
                        borderRadius: 8,
                        flex: 1,
                    },
                    pressed && {
                        opacity: 0.8,
                    },
                ];
            }}>
                  <react_native_1.Text style={{
                color: 'white',
                fontSize: 16,
                fontWeight: '600',
                textAlign: 'center',
            }}>
                    Chat
                  </react_native_1.Text>
                </react_native_1.Pressable>

                {/* Close Button */}
                <react_native_1.Pressable onPress={onClose} style={function (_a) {
                var pressed = _a.pressed;
                return [
                    {
                        backgroundColor: '#E0E0E0',
                        paddingVertical: 12,
                        paddingHorizontal: 24,
                        borderRadius: 8,
                        flex: 1,
                    },
                    pressed && {
                        opacity: 0.8,
                    },
                ];
            }}>
                  <react_native_1.Text style={{
                color: '#000',
                fontSize: 16,
                fontWeight: '600',
                textAlign: 'center',
            }}>
                    Close
                  </react_native_1.Text>
                </react_native_1.Pressable>
              </react_native_1.View>
            </>)}
        </react_native_1.Pressable>
      </react_native_1.Pressable>
    </react_native_1.Modal>);
};
exports.default = ProfilePreviewModal;
