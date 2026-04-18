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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var fuse_js_1 = __importDefault(require("fuse.js"));
var react_native_1 = require("react-native");
var async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
var firestore_1 = __importDefault(require("@react-native-firebase/firestore"));
var VIBE_HUNT_RECENT_KEY = 'vibe_hunt_recent_queries';
var normalizeText = function (value) {
    return String(value || '')
        .trim()
        .replace(/^[@/]+/, '')
        .toLowerCase();
};
var toDateOrNull = function (value) {
    if (!value)
        return null;
    if (typeof (value === null || value === void 0 ? void 0 : value.toDate) === 'function')
        return value.toDate();
    if (typeof value === 'number')
        return new Date(value);
    if (typeof value === 'string') {
        var parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
    return null;
};
var normalizePhotoUrl = function (value) {
    var raw = String(value || '').trim();
    if (!raw)
        return null;
    if (raw.toLowerCase() === 'null' || raw.toLowerCase() === 'undefined')
        return null;
    return raw;
};
var formatStatusLine = function (user) {
    if (user.online)
        return 'Online now';
    if (user.lastSeen) {
        var diffMs = Date.now() - user.lastSeen.getTime();
        var minutes = Math.max(1, Math.floor(diffMs / 60000));
        if (minutes < 60)
            return "Last seen ".concat(minutes, "m ago");
        var hours = Math.floor(minutes / 60);
        if (hours < 24)
            return "Last seen ".concat(hours, "h ago");
        var days = Math.floor(hours / 24);
        return "Last seen ".concat(days, "d ago");
    }
    return null;
};
var sortUsers = function (users) {
    return __spreadArray([], users, true).sort(function (a, b) {
        var onlineDelta = Number(b.online === true) - Number(a.online === true);
        if (onlineDelta !== 0)
            return onlineDelta;
        var pointsDelta = Number(b.minuteFameCareerPoints || 0) - Number(a.minuteFameCareerPoints || 0);
        if (pointsDelta !== 0)
            return pointsDelta;
        return normalizeText(a.username || a.email).localeCompare(normalizeText(b.username || b.email));
    });
};
var VibeHuntUserSearch = function (_a) {
    var myUid = _a.myUid, _b = _a.blockedUserIds, blockedUserIds = _b === void 0 ? [] : _b, onProfilePhotoSelect = _a.onProfilePhotoSelect, onOpenUserProfile = _a.onOpenUserProfile, onOpenAvatarPreview = _a.onOpenAvatarPreview;
    var _c = (0, react_1.useState)(''), searchQuery = _c[0], setSearchQuery = _c[1];
    var _d = (0, react_1.useState)([]), directoryUsers = _d[0], setDirectoryUsers = _d[1];
    var _e = (0, react_1.useState)([]), results = _e[0], setResults = _e[1];
    var _f = (0, react_1.useState)(false), loading = _f[0], setLoading = _f[1];
    var _g = (0, react_1.useState)(null), error = _g[0], setError = _g[1];
    var _h = (0, react_1.useState)([]), recentQueries = _h[0], setRecentQueries = _h[1];
    var _j = (0, react_1.useState)(new Set()), brokenAvatarIds = _j[0], setBrokenAvatarIds = _j[1];
    var blockedSet = (0, react_1.useMemo)(function () { return new Set(blockedUserIds); }, [blockedUserIds]);
    (0, react_1.useEffect)(function () {
        var mounted = true;
        (function () { return __awaiter(void 0, void 0, void 0, function () {
            var stored, parsed, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, async_storage_1.default.getItem(VIBE_HUNT_RECENT_KEY)];
                    case 1:
                        stored = _b.sent();
                        if (!mounted || !stored)
                            return [2 /*return*/];
                        parsed = JSON.parse(stored);
                        if (Array.isArray(parsed)) {
                            setRecentQueries(parsed
                                .map(function (item) { return String(item || '').trim(); })
                                .filter(Boolean)
                                .slice(0, 8));
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        _a = _b.sent();
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); })();
        return function () {
            mounted = false;
        };
    }, []);
    (0, react_1.useEffect)(function () {
        var cancelled = false;
        var loadUsers = function () { return __awaiter(void 0, void 0, void 0, function () {
            var snap, users, loadError_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setLoading(true);
                        setError(null);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, (0, firestore_1.default)().collection('users').limit(250).get()];
                    case 2:
                        snap = _a.sent();
                        users = sortUsers(snap.docs.map(function (doc) {
                            var data = doc.data() || {};
                            return {
                                uid: doc.id,
                                username: String((data === null || data === void 0 ? void 0 : data.username) || (data === null || data === void 0 ? void 0 : data.displayName) || (data === null || data === void 0 ? void 0 : data.name) || 'User').trim(),
                                email: (data === null || data === void 0 ? void 0 : data.email) || undefined,
                                photoURL: (data === null || data === void 0 ? void 0 : data.userPhoto) ||
                                    (data === null || data === void 0 ? void 0 : data.photoURL) ||
                                    (data === null || data === void 0 ? void 0 : data.avatar) ||
                                    (data === null || data === void 0 ? void 0 : data.profilePicture) ||
                                    null,
                                bio: (data === null || data === void 0 ? void 0 : data.bio) || '',
                                online: (data === null || data === void 0 ? void 0 : data.online) === true,
                                lastSeen: toDateOrNull(data === null || data === void 0 ? void 0 : data.lastSeen),
                                minuteFameCareerPoints: Number((data === null || data === void 0 ? void 0 : data.minuteFameCareerPoints) || 0),
                                minuteFameTitle: (data === null || data === void 0 ? void 0 : data.minuteFameTitleLabel) || (data === null || data === void 0 ? void 0 : data.minuteFameTitle) || null,
                            };
                        })).filter(function (user) { return !!user.uid && user.uid !== myUid; });
                        if (!cancelled) {
                            setDirectoryUsers(users);
                            setResults(users.slice(0, 80));
                        }
                        return [3 /*break*/, 5];
                    case 3:
                        loadError_1 = _a.sent();
                        if (!cancelled) {
                            setError('Could not load users right now.');
                            setDirectoryUsers([]);
                            setResults([]);
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        if (!cancelled) {
                            setLoading(false);
                        }
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        void loadUsers();
        return function () {
            cancelled = true;
        };
    }, [myUid]);
    (0, react_1.useEffect)(function () {
        var term = searchQuery.trim();
        if (!term) {
            setResults(directoryUsers.slice(0, 80));
            setError(directoryUsers.length === 0 && !loading ? 'No users found.' : null);
            return;
        }
        var queryNorm = normalizeText(term);
        var exactMatches = directoryUsers.filter(function (user) {
            var usernameNorm = normalizeText(user.username);
            var emailNorm = normalizeText(user.email);
            return usernameNorm === queryNorm || emailNorm === queryNorm;
        });
        var prefixMatches = directoryUsers.filter(function (user) {
            var usernameNorm = normalizeText(user.username);
            var emailNorm = normalizeText(user.email);
            var isPrefix = usernameNorm.startsWith(queryNorm) || emailNorm.startsWith(queryNorm);
            var isExact = usernameNorm === queryNorm || emailNorm === queryNorm;
            return isPrefix && !isExact;
        });
        var fuse = new fuse_js_1.default(directoryUsers, {
            keys: ['username', 'email', 'bio'],
            threshold: 0.36,
            ignoreLocation: true,
            minMatchCharLength: 2,
        });
        var fuzzyResults = fuse.search(term).map(function (entry) { return entry.item; });
        var seen = new Set();
        var merged = __spreadArray(__spreadArray(__spreadArray([], exactMatches, true), prefixMatches, true), fuzzyResults, true).filter(function (user) {
            if (seen.has(user.uid))
                return false;
            seen.add(user.uid);
            return true;
        });
        setResults(merged);
        setError(merged.length === 0 ? 'No matching users found.' : null);
    }, [directoryUsers, loading, searchQuery]);
    var persistRecentQuery = function (value) {
        var term = value.trim();
        if (!term)
            return;
        setRecentQueries(function (prev) {
            var next = __spreadArray([
                term
            ], prev.filter(function (item) { return item.toLowerCase() !== term.toLowerCase(); }), true).slice(0, 8);
            async_storage_1.default.setItem(VIBE_HUNT_RECENT_KEY, JSON.stringify(next)).catch(function () { });
            return next;
        });
    };
    var handleUserPress = function (user) {
        persistRecentQuery(searchQuery || user.username || user.email || '');
        onProfilePhotoSelect === null || onProfilePhotoSelect === void 0 ? void 0 : onProfilePhotoSelect(user.photoURL || null);
        onOpenUserProfile === null || onOpenUserProfile === void 0 ? void 0 : onOpenUserProfile({
            uid: user.uid,
            name: String(user.username || user.email || 'User'),
        });
    };
    var getInitials = function (user) {
        var name = String(user.username || user.email || '?').replace(/^[@/]+/, '');
        var parts = name.trim().split(/\s+/);
        if (parts.length === 1)
            return parts[0].slice(0, 2).toUpperCase();
        return "".concat(parts[0][0] || '').concat(parts[parts.length - 1][0] || '').toUpperCase();
    };
    var renderUser = function (_a) {
        var item = _a.item;
        var isBlocked = blockedSet.has(item.uid);
        var photoUrl = normalizePhotoUrl(item.photoURL);
        var showPhoto = !!photoUrl && !brokenAvatarIds.has(item.uid);
        var statusLine = formatStatusLine(item);
        return (<react_native_1.Pressable style={styles.userItem} onPress={function () { return handleUserPress(item); }}>
        <react_native_1.Pressable onPress={function () {
                handleUserPress(item);
            }} onLongPress={function () {
                if (photoUrl) {
                    onProfilePhotoSelect === null || onProfilePhotoSelect === void 0 ? void 0 : onProfilePhotoSelect(photoUrl);
                    onOpenAvatarPreview === null || onOpenAvatarPreview === void 0 ? void 0 : onOpenAvatarPreview(photoUrl);
                }
            }} style={{ borderRadius: 26 }}>
          <react_native_1.View style={styles.avatarWrap}>
            <react_native_1.View style={[styles.avatar, styles.avatarFallback]}>
              <react_native_1.Text style={styles.initials}>{getInitials(item)}</react_native_1.Text>
            </react_native_1.View>
            {showPhoto ? (<react_native_1.Image source={{ uri: photoUrl }} style={[styles.avatar, styles.avatarImage]} onError={function () {
                    setBrokenAvatarIds(function (prev) {
                        if (prev.has(item.uid))
                            return prev;
                        var next = new Set(prev);
                        next.add(item.uid);
                        return next;
                    });
                }}/>) : null}
          </react_native_1.View>
        </react_native_1.Pressable>
        <react_native_1.View style={styles.userInfo}>
          <react_native_1.View style={styles.userTitleRow}>
            <react_native_1.Text style={styles.displayName} numberOfLines={1}>
              {item.username || item.email || 'User'}
            </react_native_1.Text>
            {isBlocked ? (<react_native_1.View style={styles.blockedPill}>
                <react_native_1.Text style={styles.blockedPillText}>Blocked</react_native_1.Text>
              </react_native_1.View>) : null}
          </react_native_1.View>
          {!!item.username && (<react_native_1.Text style={styles.username} numberOfLines={1}>
              @{normalizeText(item.username)}
            </react_native_1.Text>)}
          {statusLine ? (<react_native_1.Text style={styles.statusText} numberOfLines={1}>
              {statusLine}
            </react_native_1.Text>) : null}
        </react_native_1.View>
        <react_native_1.View style={styles.metaCol}>
          <react_native_1.Text style={styles.pointsValue}>{Number(item.minuteFameCareerPoints || 0)}</react_native_1.Text>
          <react_native_1.Text style={styles.pointsLabel}>points</react_native_1.Text>
        </react_native_1.View>
      </react_native_1.Pressable>);
    };
    return (<react_native_1.View style={styles.container}>
      <react_native_1.View style={styles.searchBar}>
        <react_native_1.Text style={styles.searchIcon}>🔍</react_native_1.Text>
        <react_native_1.TextInput style={styles.searchInput} placeholder="Search app users" placeholderTextColor="rgba(255,255,255,0.5)" value={searchQuery} onChangeText={setSearchQuery} onSubmitEditing={function () { return persistRecentQuery(searchQuery); }} autoCapitalize="none" autoCorrect={false} editable={!loading}/>
        <react_native_1.Pressable style={function (_a) {
            var pressed = _a.pressed;
            return [
                styles.searchButton,
                pressed && styles.searchButtonPressed,
            ];
        }} onPress={function () { return persistRecentQuery(searchQuery); }}>
          <react_native_1.Text style={styles.searchButtonText}>Search</react_native_1.Text>
        </react_native_1.Pressable>
      </react_native_1.View>

      {recentQueries.length > 0 ? (<react_native_1.View style={styles.recentWrap}>
          <react_native_1.View style={styles.recentHeaderRow}>
            <react_native_1.Text style={styles.sectionTitle}>Recent hunts</react_native_1.Text>
            <react_native_1.Pressable onPress={function () {
                setRecentQueries([]);
                async_storage_1.default.removeItem(VIBE_HUNT_RECENT_KEY).catch(function () { });
            }}>
              <react_native_1.Text style={styles.clearRecentText}>Clear</react_native_1.Text>
            </react_native_1.Pressable>
          </react_native_1.View>
          <react_native_1.View style={styles.recentChipRow}>
            {recentQueries.map(function (item) { return (<react_native_1.Pressable key={"hunt-recent-".concat(item)} style={styles.recentChip} onPress={function () { return setSearchQuery(item); }}>
                <react_native_1.Text style={styles.recentChipText}>{item}</react_native_1.Text>
              </react_native_1.Pressable>); })}
          </react_native_1.View>
        </react_native_1.View>) : null}

      <react_native_1.View style={styles.resultsContainer}>
        <react_native_1.Text style={styles.sectionTitle}>
          {searchQuery.trim() ? 'Matching users' : 'Popular users'}
        </react_native_1.Text>
        {loading ? (<react_native_1.ActivityIndicator size="small" color="#00C2FF" style={{ paddingVertical: 18 }}/>) : error ? (<react_native_1.Text style={styles.emptyText}>{error}</react_native_1.Text>) : (<react_native_1.FlatList data={results} renderItem={renderUser} keyExtractor={function (item) { return item.uid; }} style={styles.resultsList} keyboardShouldPersistTaps="handled"/>)}
      </react_native_1.View>
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
        borderRadius: 22,
        paddingHorizontal: 16,
        paddingVertical: 11,
        borderWidth: 1,
        borderColor: 'rgba(0, 194, 255, 0.3)',
    },
    searchIcon: {
        fontSize: 18,
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
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    searchButtonPressed: {
        opacity: 0.82,
    },
    searchButtonText: {
        color: '#fff',
        fontWeight: '800',
        fontSize: 13,
    },
    recentWrap: {
        marginTop: 8,
        backgroundColor: 'rgba(0, 31, 63, 0.75)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(0, 194, 255, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    recentHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    clearRecentText: {
        color: '#58C8FF',
        fontWeight: '700',
        fontSize: 12,
    },
    recentChipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 6,
    },
    recentChip: {
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(88, 200, 255, 0.55)',
        backgroundColor: 'rgba(0, 194, 255, 0.14)',
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    recentChipText: {
        color: '#D9F5FF',
        fontSize: 12,
        fontWeight: '600',
    },
    resultsContainer: {
        backgroundColor: 'rgba(0, 31, 63, 0.95)',
        borderRadius: 12,
        marginTop: 8,
        maxHeight: 420,
        borderWidth: 1,
        borderColor: 'rgba(0, 194, 255, 0.3)',
    },
    sectionTitle: {
        color: '#9DDCFF',
        fontWeight: '700',
        fontSize: 13,
        paddingHorizontal: 12,
        paddingTop: 10,
        paddingBottom: 4,
    },
    resultsList: {
        paddingHorizontal: 8,
        paddingBottom: 8,
    },
    emptyText: {
        color: 'rgba(255,255,255,0.72)',
        textAlign: 'center',
        paddingVertical: 20,
        paddingHorizontal: 20,
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderBottomWidth: react_native_1.StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(0, 194, 255, 0.18)',
        gap: 10,
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#082133',
    },
    avatarWrap: {
        width: 52,
        height: 52,
    },
    avatarFallback: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0F4C75',
    },
    avatarImage: {
        position: 'absolute',
        top: 0,
        left: 0,
    },
    initials: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '800',
    },
    userInfo: {
        flex: 1,
        minWidth: 0,
    },
    userTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    displayName: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '800',
        flex: 1,
    },
    username: {
        color: '#81D4FA',
        fontSize: 12,
        marginTop: 2,
    },
    statusText: {
        color: 'rgba(255,255,255,0.68)',
        fontSize: 12,
        marginTop: 3,
    },
    metaCol: {
        alignItems: 'flex-end',
        minWidth: 58,
    },
    pointsValue: {
        color: '#FFFFFF',
        fontWeight: '800',
        fontSize: 15,
    },
    pointsLabel: {
        color: 'rgba(255,255,255,0.62)',
        fontSize: 11,
    },
    blockedPill: {
        borderRadius: 999,
        backgroundColor: 'rgba(141,0,0,0.22)',
        borderWidth: 1,
        borderColor: 'rgba(255,80,80,0.4)',
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    blockedPillText: {
        color: '#FFD4D4',
        fontSize: 10,
        fontWeight: '800',
    },
    selectedCard: {
        marginTop: 10,
        borderRadius: 14,
        backgroundColor: 'rgba(8, 26, 44, 0.92)',
        borderWidth: 1,
        borderColor: 'rgba(0, 194, 255, 0.3)',
        padding: 12,
    },
    selectedHeader: {
        flexDirection: 'row',
        gap: 12,
    },
    selectedAvatarWrap: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedInfo: {
        flex: 1,
        minWidth: 0,
    },
    selectedTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    selectedName: {
        color: '#FFFFFF',
        fontWeight: '800',
        fontSize: 16,
        flex: 1,
    },
    selectedBadge: {
        minWidth: 30,
        height: 30,
        borderRadius: 999,
        backgroundColor: 'rgba(56, 189, 248, 0.18)',
        borderWidth: 1,
        borderColor: 'rgba(56, 189, 248, 0.4)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
    },
    selectedBadgeText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800',
    },
    selectedHandle: {
        color: '#81D4FA',
        fontSize: 12,
        marginTop: 2,
    },
    selectedStatus: {
        color: 'rgba(255,255,255,0.68)',
        fontSize: 12,
        marginTop: 2,
    },
    selectedBio: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        marginTop: 4,
        fontStyle: 'italic',
    },
    selectedActions: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 10,
    },
    selectedButton: {
        flex: 1,
        backgroundColor: '#00C2FF',
        borderRadius: 12,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedButtonText: {
        color: '#00192D',
        fontWeight: '800',
        fontSize: 13,
    },
    selectedCloseButton: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    selectedCloseText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 12,
    },
});
exports.default = VibeHuntUserSearch;
