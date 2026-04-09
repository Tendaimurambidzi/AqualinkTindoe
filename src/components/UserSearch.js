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
// InviteBadge component for Join/Miss actions
var InviteBadge = function (_a) {
    var onJoin = _a.onJoin, onMiss = _a.onMiss;
    var _b = (0, react_1.useState)(true), visible = _b[0], setVisible = _b[1];
    if (!visible)
        return null;
    return (<react_native_1.View style={inviteBadgeStyles.badgeContainer}>
      <react_native_1.Text style={inviteBadgeStyles.badgeText}>Invite Sent</react_native_1.Text>
      <react_native_1.Pressable style={inviteBadgeStyles.badgeButton} onPress={function () { setVisible(false); onJoin === null || onJoin === void 0 ? void 0 : onJoin(); }}>
        <react_native_1.Text style={inviteBadgeStyles.badgeButtonText}>Join</react_native_1.Text>
      </react_native_1.Pressable>
      <react_native_1.Pressable style={[inviteBadgeStyles.badgeButton, { backgroundColor: '#eee' }]} onPress={function () { setVisible(false); onMiss === null || onMiss === void 0 ? void 0 : onMiss(); }}>
        <react_native_1.Text style={[inviteBadgeStyles.badgeButtonText, { color: '#888' }]}>Miss</react_native_1.Text>
      </react_native_1.Pressable>
    </react_native_1.View>);
};
var inviteBadgeStyles = react_native_1.StyleSheet.create({
    badgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingHorizontal: 10,
        paddingVertical: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
        elevation: 2,
        marginTop: 6,
        alignSelf: 'flex-start',
    },
    badgeText: {
        fontSize: 12,
        color: '#00C2FF',
        fontWeight: '700',
        marginRight: 8,
    },
    badgeButton: {
        backgroundColor: '#00C2FF',
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginHorizontal: 2,
    },
    badgeButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 12,
    },
});
var react_1 = __importStar(require("react"));
var fuse_js_1 = __importDefault(require("fuse.js"));
var react_native_1 = require("react-native");
var firestore_1 = __importDefault(require("@react-native-firebase/firestore"));
var UserSearch = function (_a) {
    var onUserSelect = _a.onUserSelect, onJoinCrew = _a.onJoinCrew, onInviteToDrift = _a.onInviteToDrift;
    var _b = (0, react_1.useState)(''), searchQuery = _b[0], setSearchQuery = _b[1];
    var _c = (0, react_1.useState)([]), results = _c[0], setResults = _c[1];
    var _d = (0, react_1.useState)([]), suggestions = _d[0], setSuggestions = _d[1];
    var _e = (0, react_1.useState)(false), loading = _e[0], setLoading = _e[1];
    var _f = (0, react_1.useState)(null), error = _f[0], setError = _f[1];
    var handleSearch = function (query) { return __awaiter(void 0, void 0, void 0, function () {
        var usersRef, searchTerm, usernameVariants, displayNameSnap, users_1, _i, usernameVariants_1, variant, usernameSnap, allSnap, allUsers, fuse, fuzzyResults, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setSearchQuery(query);
                    setError(null);
                    setSuggestions([]);
                    if (!query.trim()) {
                        setResults([]);
                        setSuggestions([]);
                        setError(null);
                        return [2 /*return*/];
                    }
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 10, 11, 12]);
                    usersRef = (0, firestore_1.default)().collection('users');
                    searchTerm = query.trim();
                    usernameVariants = [searchTerm.replace(/^[@/]+/, '')];
                    return [4 /*yield*/, usersRef
                            .where('displayName', '>=', searchTerm)
                            .where('displayName', '<=', searchTerm + '\uf8ff')
                            .limit(20)
                            .get()];
                case 2:
                    displayNameSnap = _a.sent();
                    users_1 = displayNameSnap.docs.map(function (doc) { return ({
                        uid: doc.id,
                        displayName: doc.data().displayName || 'Anonymous',
                        photoURL: doc.data().photoURL || null,
                        username: doc.data().username,
                        email: doc.data().email,
                    }); });
                    _i = 0, usernameVariants_1 = usernameVariants;
                    _a.label = 3;
                case 3:
                    if (!(_i < usernameVariants_1.length)) return [3 /*break*/, 6];
                    variant = usernameVariants_1[_i];
                    return [4 /*yield*/, usersRef
                            .where('username', '==', variant)
                            .limit(20)
                            .get()];
                case 4:
                    usernameSnap = _a.sent();
                    usernameSnap.docs.forEach(function (doc) {
                        var user = {
                            uid: doc.id,
                            displayName: doc.data().displayName || 'Anonymous',
                            photoURL: doc.data().photoURL || null,
                            username: doc.data().username,
                            email: doc.data().email,
                        };
                        if (!users_1.find(function (u) { return u.uid === user.uid; })) {
                            users_1.push(user);
                        }
                    });
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6:
                    setResults(users_1);
                    if (!(users_1.length === 0)) return [3 /*break*/, 8];
                    return [4 /*yield*/, usersRef.limit(100).get()];
                case 7:
                    allSnap = _a.sent();
                    allUsers = allSnap.docs.map(function (doc) { return ({
                        uid: doc.id,
                        displayName: doc.data().displayName || 'Anonymous',
                        photoURL: doc.data().photoURL || null,
                        username: doc.data().username,
                        email: doc.data().email,
                    }); });
                    fuse = new fuse_js_1.default(allUsers, {
                        keys: ['displayName', 'username', 'email'],
                        threshold: 0.4,
                    });
                    fuzzyResults = fuse.search(query).map(function (res) { return res.item; });
                    setSuggestions(fuzzyResults.slice(0, 10));
                    setError('No exact results. Did you mean:');
                    return [3 /*break*/, 9];
                case 8:
                    setSuggestions([]);
                    setError(null);
                    _a.label = 9;
                case 9: return [3 /*break*/, 12];
                case 10:
                    error_1 = _a.sent();
                    console.error('Search error:', error_1);
                    setResults([]);
                    setSuggestions([]);
                    setError('Search failed. Please try again.');
                    return [3 /*break*/, 12];
                case 11:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 12: return [2 /*return*/];
            }
        });
    }); };
    var renderUser = function (_a) {
        var item = _a.item;
        return (<react_native_1.Pressable style={styles.userItem} onPress={function () {
                onUserSelect(item);
                setSearchQuery('');
                setResults([]);
            }}>
      <react_native_1.Image source={{ uri: item.photoURL || 'https://via.placeholder.com/50' }} style={styles.avatar}/>
      <react_native_1.View style={styles.userInfo}>
        <react_native_1.Text style={styles.displayName}>{item.displayName}</react_native_1.Text>
        {item.username ? (<react_native_1.Text style={styles.username}>@{String(item.username).replace(/^[@/]+/, '')}</react_native_1.Text>) : item.email ? (<react_native_1.Text style={styles.username}>{item.email}</react_native_1.Text>) : null}
      </react_native_1.View>
      {(onJoinCrew || onInviteToDrift) && (<react_native_1.View style={styles.userActions}>
          {onJoinCrew && (<react_native_1.Pressable style={function (_a) {
                        var pressed = _a.pressed;
                        return [
                            styles.userActionButton,
                            pressed && {
                                opacity: 0.8,
                                transform: [{ scale: 0.95 }],
                            }
                        ];
                    }} onPress={function (event) {
                        var _a;
                        (_a = event.stopPropagation) === null || _a === void 0 ? void 0 : _a.call(event);
                        onJoinCrew(item);
                    }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <react_native_1.Text style={styles.userActionText}>Connect MoMo</react_native_1.Text>
            </react_native_1.Pressable>)}
          {onInviteToDrift && (<InviteButton item={item} onInviteToDrift={onInviteToDrift}/>)}
        </react_native_1.View>)}
    </react_native_1.Pressable>);
    };
    // InviteButton component to prevent double-tap
    function InviteButton(_a) {
        var _this = this;
        var item = _a.item, onInviteToDrift = _a.onInviteToDrift;
        var _b = (0, react_1.useState)(false), inviting = _b[0], setInviting = _b[1];
        var _c = (0, react_1.useState)(false), showBadge = _c[0], setShowBadge = _c[1];
        return (<react_native_1.View>
      <react_native_1.Pressable style={function (_a) {
                var pressed = _a.pressed;
                return [
                    styles.userActionButton,
                    pressed && {
                        opacity: 0.8,
                        transform: [{ scale: 0.95 }],
                    },
                    inviting && { backgroundColor: '#00C2FF', opacity: 0.6, borderColor: '#00C2FF' },
                    inviting && { shadowColor: '#00C2FF', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 4, elevation: 4 },
                ];
            }} onPress={function (event) { return __awaiter(_this, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            (_a = event.stopPropagation) === null || _a === void 0 ? void 0 : _a.call(event);
                            if (inviting)
                                return [2 /*return*/];
                            setInviting(true);
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, , 3, 4]);
                            return [4 /*yield*/, onInviteToDrift(item)];
                        case 2:
                            _b.sent();
                            setShowBadge(true);
                            return [3 /*break*/, 4];
                        case 3:
                            setInviting(false);
                            return [7 /*endfinally*/];
                        case 4: return [2 /*return*/];
                    }
                });
            }); }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} disabled={inviting}>
        {inviting ? (<react_native_1.View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <react_native_1.ActivityIndicator size="small" color="#fff"/>
            <react_native_1.Text style={[styles.userActionText, { color: '#fff', fontWeight: 'bold' }]}>Inviting...</react_native_1.Text>
          </react_native_1.View>) : (<react_native_1.Text style={styles.userActionText}>Invite</react_native_1.Text>)}
      </react_native_1.Pressable>
      {showBadge && (<InviteBadge onJoin={function () {
                    setShowBadge(false);
                    // Add join logic here if needed
                }} onMiss={function () {
                    setShowBadge(false);
                    // Add miss logic here if needed
                }}/>)}
    </react_native_1.View>);
    }
    return (<react_native_1.View style={styles.container}>
      <react_native_1.View style={styles.searchBar}>
        <react_native_1.Text style={styles.searchIcon}>🔍</react_native_1.Text>
        <react_native_1.TextInput style={styles.searchInput} placeholder="Search MoMo users..." placeholderTextColor="rgba(255,255,255,0.5)" value={searchQuery} onChangeText={handleSearch} autoCapitalize="none" autoCorrect={false} editable={!loading}/>
        <react_native_1.Pressable style={function (_a) {
            var pressed = _a.pressed;
            return [
                styles.searchButton,
                pressed && styles.searchButtonPressed,
            ];
        }} onPress={function () { return handleSearch(searchQuery); }} disabled={loading}>
          {loading ? (<react_native_1.ActivityIndicator size="small" color="#fff"/>) : (<react_native_1.Text style={styles.searchButtonText}>Search</react_native_1.Text>)}
        </react_native_1.Pressable>
      </react_native_1.View>
      {error && (<react_native_1.View style={{ padding: 12, alignItems: 'center' }}>
          <react_native_1.Text style={{ color: '#FF4444', fontWeight: 'bold' }}>{error}</react_native_1.Text>
        </react_native_1.View>)}
      {results.length > 0 && (<react_native_1.View style={styles.resultsContainer}>
          <react_native_1.FlatList data={results} renderItem={renderUser} keyExtractor={function (item) { return item.uid; }} style={styles.resultsList} keyboardShouldPersistTaps="handled"/>
        </react_native_1.View>)}
      {suggestions.length > 0 && (<react_native_1.View style={styles.resultsContainer}>
          <react_native_1.FlatList data={suggestions} renderItem={renderUser} keyExtractor={function (item) { return item.uid; }} style={styles.resultsList} keyboardShouldPersistTaps="handled"/>
        </react_native_1.View>)}
    </react_native_1.View>);
};
var styles = react_native_1.StyleSheet.create({
    container: {
        width: '100%',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 31, 63, 0.9)',
        borderRadius: 25,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: 'rgba(0, 194, 255, 0.3)',
    },
    searchIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 16,
    },
    searchButton: {
        marginLeft: 8,
        backgroundColor: '#00C2FF',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 8,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 70,
    },
    searchButtonPressed: {
        backgroundColor: '#0090bb',
        opacity: 0.8,
    },
    searchButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 15,
    },
    resultsContainer: {
        backgroundColor: 'rgba(0, 31, 63, 0.95)',
        borderRadius: 12,
        marginTop: 8,
        maxHeight: 300,
        borderWidth: 1,
        borderColor: 'rgba(0, 194, 255, 0.3)',
    },
    resultsList: {
        padding: 8,
    },
    userActions: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
    },
    userActionButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    userActionText: {
        color: '#00C2FF',
        fontWeight: '600',
        fontSize: 12,
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        marginBottom: 4,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: 'rgba(0, 194, 255, 0.5)',
    },
    userInfo: {
        marginLeft: 12,
        flex: 1,
    },
    displayName: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    username: {
        color: 'rgba(0, 194, 255, 0.8)',
        fontSize: 14,
        marginTop: 2,
    },
});
exports.default = UserSearch;
