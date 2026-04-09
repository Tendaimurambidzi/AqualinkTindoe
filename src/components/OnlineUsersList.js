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
var react_1 = __importStar(require("react"));
var react_native_1 = require("react-native");
var database_1 = __importDefault(require("@react-native-firebase/database"));
var OnlineUsersList = function (_a) {
    var myUid = _a.myUid, onUserPress = _a.onUserPress;
    var _b = (0, react_1.useState)([]), allOnlineUsers = _b[0], setAllOnlineUsers = _b[1];
    var _c = (0, react_1.useState)([]), displayedUsers = _c[0], setDisplayedUsers = _c[1];
    var _d = (0, react_1.useState)(0), currentIndex = _d[0], setCurrentIndex = _d[1];
    var fadeAnim = (0, react_1.useState)(new react_native_1.Animated.Value(1))[0];
    // Fetch online users from Firebase
    (0, react_1.useEffect)(function () {
        if (!myUid)
            return;
        var presenceRef = (0, database_1.default)().ref('/presence');
        var unsubscribe = presenceRef.on('value', function (snapshot) { return __awaiter(void 0, void 0, void 0, function () {
            var presenceData, onlineUids, usersPromises, users;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!snapshot)
                            return [2 /*return*/];
                        presenceData = snapshot.val();
                        if (!presenceData) {
                            setAllOnlineUsers([]);
                            return [2 /*return*/];
                        }
                        onlineUids = Object.keys(presenceData).filter(function (uid) { var _a; return uid !== myUid && ((_a = presenceData[uid]) === null || _a === void 0 ? void 0 : _a.online); });
                        usersPromises = onlineUids.map(function (uid) { return __awaiter(void 0, void 0, void 0, function () {
                            var userDoc, userData, error_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, (0, database_1.default)().ref("/users/".concat(uid)).once('value')];
                                    case 1:
                                        userDoc = _a.sent();
                                        userData = userDoc.val();
                                        return [2 /*return*/, {
                                                uid: uid,
                                                name: (userData === null || userData === void 0 ? void 0 : userData.name) || (userData === null || userData === void 0 ? void 0 : userData.displayName) || 'User',
                                                avatar: (userData === null || userData === void 0 ? void 0 : userData.avatar) || null,
                                            }];
                                    case 2:
                                        error_1 = _a.sent();
                                        return [2 /*return*/, {
                                                uid: uid,
                                                name: 'User',
                                                avatar: null,
                                            }];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); });
                        return [4 /*yield*/, Promise.all(usersPromises)];
                    case 1:
                        users = _a.sent();
                        setAllOnlineUsers(users);
                        return [2 /*return*/];
                }
            });
        }); });
        return function () { return presenceRef.off('value', unsubscribe); };
    }, [myUid]);
    // Rotate displayed users every 10 seconds
    (0, react_1.useEffect)(function () {
        if (allOnlineUsers.length === 0) {
            setDisplayedUsers([]);
            return;
        }
        // Initial display
        var getNextUsers = function (startIdx) {
            var users = [];
            for (var i = 0; i < 5; i++) {
                if (allOnlineUsers.length > 0) {
                    users.push(allOnlineUsers[(startIdx + i) % allOnlineUsers.length]);
                }
            }
            return users;
        };
        setDisplayedUsers(getNextUsers(0));
        var interval = setInterval(function () {
            // Fade out
            react_native_1.Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start(function () {
                // Update users
                setCurrentIndex(function (prev) {
                    var nextIdx = (prev + 5) % allOnlineUsers.length;
                    setDisplayedUsers(getNextUsers(nextIdx));
                    return nextIdx;
                });
                // Fade in
                react_native_1.Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }).start();
            });
        }, 10000);
        return function () { return clearInterval(interval); };
    }, [allOnlineUsers, fadeAnim]);
    if (displayedUsers.length === 0) {
        return null;
    }
    return (<react_native_1.View style={{
            position: 'absolute',
            left: 10,
            top: 80,
            zIndex: 10,
        }}>
      {/* Green dot */}
      <react_native_1.View style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: '#00FF00',
            marginBottom: 8,
        }}/>

      {/* User list */}
      <react_native_1.Animated.View style={{ opacity: fadeAnim }}>
        {displayedUsers.map(function (user, index) { return (<react_native_1.Pressable key={"".concat(user.uid, "-").concat(index)} onPress={function () { return onUserPress(user); }} style={function (_a) {
                var pressed = _a.pressed;
                return [
                    {
                        marginBottom: 6,
                        paddingVertical: 4,
                        paddingHorizontal: 6,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: 4,
                    },
                    pressed && {
                        backgroundColor: 'rgba(200, 200, 200, 0.9)',
                    },
                ];
            }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <react_native_1.Text style={{
                fontSize: 12,
                color: '#000',
                fontWeight: '500',
            }} numberOfLines={1}>
              {user.name}
            </react_native_1.Text>
          </react_native_1.Pressable>); })}
      </react_native_1.Animated.View>
    </react_native_1.View>);
};
exports.default = OnlineUsersList;
