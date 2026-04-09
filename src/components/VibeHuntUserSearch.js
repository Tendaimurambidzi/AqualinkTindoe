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
var crewService_1 = require("../services/crewService");
var firestore_1 = __importDefault(require("@react-native-firebase/firestore"));
var liveConfig_1 = require("../../liveConfig");
var normalizeText = function (value) {
    return String(value || '')
        .trim()
        .replace(/^[@/]+/, '')
        .toLowerCase();
};
var VIBE_HUNT_RECENT_KEY = 'vibe_hunt_recent_queries';
var VibeHuntUserSearch = function (_a) {
    var onProfilePhotoSelect = _a.onProfilePhotoSelect, onChatUserSelect = _a.onChatUserSelect, onAudioCallUserSelect = _a.onAudioCallUserSelect, onVideoCallUserSelect = _a.onVideoCallUserSelect;
    var _b = (0, react_1.useState)(''), searchQuery = _b[0], setSearchQuery = _b[1];
    var _c = (0, react_1.useState)([]), results = _c[0], setResults = _c[1];
    var _d = (0, react_1.useState)([]), suggestions = _d[0], setSuggestions = _d[1];
    var _e = (0, react_1.useState)(false), loading = _e[0], setLoading = _e[1];
    var _f = (0, react_1.useState)(false), webLoading = _f[0], setWebLoading = _f[1];
    var _g = (0, react_1.useState)(null), error = _g[0], setError = _g[1];
    var _h = (0, react_1.useState)([]), webResults = _h[0], setWebResults = _h[1];
    var _j = (0, react_1.useState)(null), selectedUser = _j[0], setSelectedUser = _j[1];
    var _k = (0, react_1.useState)(false), modalVisible = _k[0], setModalVisible = _k[1];
    var _l = (0, react_1.useState)(null), crewCount = _l[0], setCrewCount = _l[1];
    var _m = (0, react_1.useState)(false), inCrew = _m[0], setInCrew = _m[1];
    var _o = (0, react_1.useState)(''), bio = _o[0], setBio = _o[1];
    var _p = (0, react_1.useState)(false), crewLoading = _p[0], setCrewLoading = _p[1];
    var _q = (0, react_1.useState)([]), recentQueries = _q[0], setRecentQueries = _q[1];
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
        if (!selectedUser || !selectedUser.uid || !modalVisible)
            return;
        var unsubscribe = (0, firestore_1.default)()
            .collection('users')
            .doc(selectedUser.uid)
            .onSnapshot(function (doc) {
            if (!doc.exists)
                return;
            var data = doc.data() || {};
            var newPhoto = data.photoURL || data.userPhoto || null;
            setSelectedUser(function (prev) {
                if (!prev)
                    return prev;
                if (prev.photoURL === newPhoto)
                    return prev;
                if (onProfilePhotoSelect)
                    onProfilePhotoSelect(newPhoto);
                return __assign(__assign({}, prev), { photoURL: newPhoto });
            });
        });
        return function () { return unsubscribe(); };
    }, [modalVisible, onProfilePhotoSelect, selectedUser]);
    var searchWeb = function (query) { return __awaiter(void 0, void 0, void 0, function () {
        var q, normalize, braveResp, payload, braveItems, braveResults, _a, serpResp, payload, serpItems, serpResults, _b, ddgResp, payload, topicItems_1, related, _c;
        var _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    q = query.trim();
                    if (!q)
                        return [2 /*return*/, []];
                    normalize = function (items) {
                        return items
                            .map(function (item, idx) { return ({
                            id: String(item.url || item.link || item.title || idx),
                            title: String(item.title || item.name || item.link || 'Result'),
                            url: String(item.url || item.link || ''),
                            description: String(item.description || item.snippet || item.body || ''),
                        }); })
                            .filter(function (item) { return !!item.url; });
                    };
                    if (!liveConfig_1.VIBE_HUNT_SEARCH_API_KEY) return [3 /*break*/, 11];
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, fetch("https://api.search.brave.com/res/v1/web/search?q=".concat(encodeURIComponent(q), "&count=8"), {
                            method: 'GET',
                            headers: {
                                Accept: 'application/json',
                                'X-Subscription-Token': liveConfig_1.VIBE_HUNT_SEARCH_API_KEY,
                            },
                        })];
                case 2:
                    braveResp = _e.sent();
                    if (!braveResp.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, braveResp.json()];
                case 3:
                    payload = _e.sent();
                    braveItems = Array.isArray((_d = payload === null || payload === void 0 ? void 0 : payload.web) === null || _d === void 0 ? void 0 : _d.results) ? payload.web.results : [];
                    braveResults = normalize(braveItems);
                    if (braveResults.length > 0)
                        return [2 /*return*/, braveResults];
                    _e.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    _a = _e.sent();
                    return [3 /*break*/, 6];
                case 6:
                    _e.trys.push([6, 10, , 11]);
                    return [4 /*yield*/, fetch("https://serpapi.com/search.json?engine=google&q=".concat(encodeURIComponent(q), "&api_key=").concat(encodeURIComponent(liveConfig_1.VIBE_HUNT_SEARCH_API_KEY)))];
                case 7:
                    serpResp = _e.sent();
                    if (!serpResp.ok) return [3 /*break*/, 9];
                    return [4 /*yield*/, serpResp.json()];
                case 8:
                    payload = _e.sent();
                    serpItems = Array.isArray(payload === null || payload === void 0 ? void 0 : payload.organic_results) ? payload.organic_results : [];
                    serpResults = normalize(serpItems);
                    if (serpResults.length > 0)
                        return [2 /*return*/, serpResults];
                    _e.label = 9;
                case 9: return [3 /*break*/, 11];
                case 10:
                    _b = _e.sent();
                    return [3 /*break*/, 11];
                case 11:
                    _e.trys.push([11, 14, , 15]);
                    return [4 /*yield*/, fetch("https://api.duckduckgo.com/?q=".concat(encodeURIComponent(q), "&format=json&no_redirect=1&no_html=1&skip_disambig=1"))];
                case 12:
                    ddgResp = _e.sent();
                    if (!ddgResp.ok)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, ddgResp.json()];
                case 13:
                    payload = _e.sent();
                    topicItems_1 = [];
                    related = Array.isArray(payload === null || payload === void 0 ? void 0 : payload.RelatedTopics) ? payload.RelatedTopics : [];
                    related.forEach(function (entry) {
                        if (entry === null || entry === void 0 ? void 0 : entry.FirstURL) {
                            topicItems_1.push({
                                title: entry.Text || entry.FirstURL,
                                url: entry.FirstURL,
                                description: entry.Text || '',
                            });
                        }
                        else if (Array.isArray(entry === null || entry === void 0 ? void 0 : entry.Topics)) {
                            entry.Topics.forEach(function (child) {
                                if (child === null || child === void 0 ? void 0 : child.FirstURL) {
                                    topicItems_1.push({
                                        title: child.Text || child.FirstURL,
                                        url: child.FirstURL,
                                        description: child.Text || '',
                                    });
                                }
                            });
                        }
                    });
                    return [2 /*return*/, normalize(topicItems_1).slice(0, 8)];
                case 14:
                    _c = _e.sent();
                    return [2 /*return*/, []];
                case 15: return [2 /*return*/];
            }
        });
    }); };
    var handleSearchButton = function () { return __awaiter(void 0, void 0, void 0, function () {
        var term, usersRef, allSnap, allUsers, queryNorm_1, exactMatches, prefixMatches, fuse, fuzzyResults, seen_1, orderedResults, web, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setError(null);
                    setSuggestions([]);
                    setWebResults([]);
                    if (!searchQuery.trim()) {
                        setResults([]);
                        setSuggestions([]);
                        setError('Default: No search yet.');
                        return [2 /*return*/];
                    }
                    term = searchQuery.trim();
                    setRecentQueries(function (prev) {
                        var next = __spreadArray([
                            term
                        ], prev.filter(function (item) { return item.toLowerCase() !== term.toLowerCase(); }), true).slice(0, 8);
                        async_storage_1.default.setItem(VIBE_HUNT_RECENT_KEY, JSON.stringify(next)).catch(function () { });
                        return next;
                    });
                    setLoading(true);
                    setWebLoading(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, 5, 6]);
                    usersRef = (0, firestore_1.default)().collection('users');
                    return [4 /*yield*/, usersRef.limit(200).get()];
                case 2:
                    allSnap = _b.sent();
                    allUsers = allSnap.docs.map(function (doc) { return ({
                        uid: doc.id,
                        username: doc.data().username || 'Anonymous',
                        photoURL: doc.data().photoURL || null,
                        email: doc.data().email,
                    }); });
                    queryNorm_1 = normalizeText(searchQuery);
                    exactMatches = allUsers.filter(function (user) {
                        var usernameNorm = normalizeText(user.username);
                        var emailNorm = normalizeText(user.email);
                        return usernameNorm === queryNorm_1 || emailNorm === queryNorm_1;
                    });
                    prefixMatches = allUsers.filter(function (user) {
                        var usernameNorm = normalizeText(user.username);
                        var emailNorm = normalizeText(user.email);
                        var isPrefix = usernameNorm.startsWith(queryNorm_1) || emailNorm.startsWith(queryNorm_1);
                        var isExact = usernameNorm === queryNorm_1 || emailNorm === queryNorm_1;
                        return isPrefix && !isExact;
                    });
                    fuse = new fuse_js_1.default(allUsers, {
                        keys: ['username', 'email'],
                        threshold: 0.42,
                        ignoreLocation: true,
                        minMatchCharLength: 2,
                    });
                    fuzzyResults = fuse.search(searchQuery).map(function (res) { return res.item; });
                    seen_1 = new Set();
                    orderedResults = __spreadArray(__spreadArray(__spreadArray([], exactMatches, true), prefixMatches, true), fuzzyResults, true).filter(function (user) {
                        if (seen_1.has(user.uid))
                            return false;
                        seen_1.add(user.uid);
                        return true;
                    });
                    if (orderedResults.length === 0) {
                        setResults([]);
                        setSuggestions([]);
                        setError(null);
                    }
                    else {
                        setResults(orderedResults);
                        setSuggestions([]);
                        setError(null);
                    }
                    return [4 /*yield*/, searchWeb(searchQuery)];
                case 3:
                    web = _b.sent();
                    setWebResults(web);
                    if (orderedResults.length === 0 && web.length === 0) {
                        setError('Failed: No results.');
                    }
                    return [3 /*break*/, 6];
                case 4:
                    _a = _b.sent();
                    setResults([]);
                    setSuggestions([]);
                    setWebResults([]);
                    setError('Search failed. Please try again.');
                    return [3 /*break*/, 6];
                case 5:
                    setLoading(false);
                    setWebLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handleUserPress = function (user) { return __awaiter(void 0, void 0, void 0, function () {
        var count, inCrewRes, userDoc, userData_1, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setSelectedUser(user);
                    setCrewLoading(true);
                    setCrewCount(null);
                    setInCrew(false);
                    setBio('');
                    setModalVisible(true);
                    if (onProfilePhotoSelect)
                        onProfilePhotoSelect(user.photoURL || null);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 5, 6, 7]);
                    return [4 /*yield*/, (0, crewService_1.getCrewCount)(user.uid)];
                case 2:
                    count = _b.sent();
                    setCrewCount(count);
                    return [4 /*yield*/, (0, crewService_1.isInCrew)(user.uid)];
                case 3:
                    inCrewRes = _b.sent();
                    setInCrew(inCrewRes);
                    return [4 /*yield*/, (0, firestore_1.default)().collection('users').doc(user.uid).get()];
                case 4:
                    userDoc = _b.sent();
                    userData_1 = userDoc.data() || {};
                    setBio(userData_1.bio || '');
                    if (userData_1.photoURL && userData_1.photoURL !== user.photoURL) {
                        setSelectedUser(function (prev) {
                            return prev ? __assign(__assign({}, prev), { photoURL: userData_1.photoURL }) : prev;
                        });
                        if (onProfilePhotoSelect)
                            onProfilePhotoSelect(userData_1.photoURL);
                    }
                    return [3 /*break*/, 7];
                case 5:
                    _a = _b.sent();
                    setCrewCount(null);
                    setInCrew(false);
                    setBio('');
                    return [3 /*break*/, 7];
                case 6:
                    setCrewLoading(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var closeModal = function () {
        setModalVisible(false);
        setSelectedUser(null);
        setCrewCount(null);
        setInCrew(false);
        setBio('');
        setCrewLoading(false);
    };
    var handleConnectLeave = function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedUser)
                        return [2 /*return*/];
                    setCrewLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 6, 7]);
                    if (!inCrew) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, crewService_1.leaveCrew)(selectedUser.uid)];
                case 2:
                    _a.sent();
                    setInCrew(false);
                    setCrewCount(function (c) { return (c !== null ? c - 1 : null); });
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, (0, crewService_1.joinCrew)(selectedUser.uid)];
                case 4:
                    _a.sent();
                    setInCrew(true);
                    setCrewCount(function (c) { return (c !== null ? c + 1 : null); });
                    _a.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    setCrewLoading(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var getInitials = function (user) {
        var _a;
        var name = (user.username || '').replace(/^[@/]+/, '');
        if (!name)
            return '?';
        var parts = name.trim().split(' ');
        if (parts.length === 1)
            return ((_a = parts[0][0]) === null || _a === void 0 ? void 0 : _a.toUpperCase()) || '?';
        return (parts[0][0] + parts[1][0]).toUpperCase();
    };
    var cleanUsername = function (username) {
        return String(username || '').replace(/^[@/]+/, '');
    };
    var renderUser = function (_a) {
        var item = _a.item;
        return (<react_native_1.Pressable style={styles.userItem} onPress={function () { return handleUserPress(item); }}>
      {item.photoURL ? (<react_native_1.Image source={{ uri: item.photoURL }} style={styles.avatar}/>) : (<react_native_1.View style={[styles.avatar, styles.avatarFallback]}>
          <react_native_1.Text style={styles.initials}>{getInitials(item)}</react_native_1.Text>
        </react_native_1.View>)}
      <react_native_1.View style={styles.userInfo}>
        <react_native_1.Text style={styles.displayName}>{item.username}</react_native_1.Text>
        {!!item.username && (<react_native_1.Text style={styles.username}>{"@".concat(cleanUsername(item.username))}</react_native_1.Text>)}
      </react_native_1.View>
    </react_native_1.Pressable>);
    };
    return (<react_native_1.View style={styles.container}>
      <react_native_1.View style={styles.searchBar}>
        <react_native_1.Text style={styles.searchIcon}>🔍</react_native_1.Text>
        <react_native_1.TextInput style={styles.searchInput} placeholder="Search users or email" placeholderTextColor="rgba(255,255,255,0.5)" value={searchQuery} onChangeText={setSearchQuery} autoCapitalize="none" autoCorrect={false} editable={!loading}/>
        <react_native_1.Pressable style={function (_a) {
            var pressed = _a.pressed;
            return [
                styles.searchButton,
                pressed && styles.searchButtonPressed,
            ];
        }} onPress={handleSearchButton} disabled={loading}>
          {loading ? (<react_native_1.ActivityIndicator size="small" color="#fff"/>) : (<react_native_1.Text style={styles.searchButtonText}>Search</react_native_1.Text>)}
        </react_native_1.Pressable>
      </react_native_1.View>

      {recentQueries.length > 0 && (<react_native_1.View style={styles.recentWrap}>
          <react_native_1.View style={styles.recentHeaderRow}>
            <react_native_1.Text style={styles.sectionTitle}>Past searches</react_native_1.Text>
            <react_native_1.Pressable onPress={function () {
                setRecentQueries([]);
                async_storage_1.default.removeItem(VIBE_HUNT_RECENT_KEY).catch(function () { });
            }}>
              <react_native_1.Text style={styles.clearRecentText}>Clear</react_native_1.Text>
            </react_native_1.Pressable>
          </react_native_1.View>
          <react_native_1.View style={styles.recentChipRow}>
            {recentQueries.map(function (item) { return (<react_native_1.Pressable key={"vh-recent-".concat(item)} style={styles.recentChip} onPress={function () { return setSearchQuery(item); }}>
                <react_native_1.Text style={styles.recentChipText}>{item}</react_native_1.Text>
              </react_native_1.Pressable>); })}
          </react_native_1.View>
        </react_native_1.View>)}

      {error === 'Failed: No results.' && (<react_native_1.Text style={{ color: '#888', textAlign: 'center', marginTop: 16 }}>
          Not found.
        </react_native_1.Text>)}

      {results.length > 0 && (<react_native_1.View style={styles.resultsContainer}>
          <react_native_1.FlatList data={results} renderItem={renderUser} keyExtractor={function (item) { return item.uid; }} style={styles.resultsList} keyboardShouldPersistTaps="handled"/>
        </react_native_1.View>)}

      {(webLoading || webResults.length > 0) && (<react_native_1.View style={styles.resultsContainer}>
          <react_native_1.Text style={styles.sectionTitle}>Internet Results</react_native_1.Text>
          {webLoading ? (<react_native_1.ActivityIndicator size="small" color="#00C2FF" style={{ paddingVertical: 12 }}/>) : (<react_native_1.FlatList data={webResults} keyExtractor={function (item) { return item.id; }} keyboardShouldPersistTaps="handled" renderItem={function (_a) {
                    var item = _a.item;
                    return (<react_native_1.Pressable style={styles.webItem} onPress={function () { return react_native_1.Linking.openURL(item.url); }}>
                  <react_native_1.Text style={styles.webTitle} numberOfLines={1}>
                    {item.title}
                  </react_native_1.Text>
                  <react_native_1.Text style={styles.webUrl} numberOfLines={1}>
                    {item.url}
                  </react_native_1.Text>
                  {!!item.description && (<react_native_1.Text style={styles.webDescription} numberOfLines={2}>
                      {item.description}
                    </react_native_1.Text>)}
                </react_native_1.Pressable>);
                }}/>)}
        </react_native_1.View>)}

      {suggestions.length > 0 && (<react_native_1.View style={styles.resultsContainer}>
          <react_native_1.FlatList data={suggestions} renderItem={renderUser} keyExtractor={function (item) { return item.uid; }} style={styles.resultsList} keyboardShouldPersistTaps="handled"/>
        </react_native_1.View>)}

      <react_native_1.Modal visible={modalVisible} transparent animationType="fade" onRequestClose={closeModal}>
        <react_native_1.Pressable style={styles.modalOverlay} onPress={closeModal}>
          <react_native_1.Pressable style={styles.modalContent} onPress={function (e) { return e.stopPropagation(); }}>
            {selectedUser && (<>
                <react_native_1.ScrollView style={styles.modalBody} contentContainerStyle={styles.modalBodyContent} showsVerticalScrollIndicator={false}>
                  {selectedUser.photoURL && selectedUser.photoURL.trim() !== '' ? (<react_native_1.Image source={{ uri: selectedUser.photoURL }} style={styles.modalAvatar} onError={function () {
                    setSelectedUser(function (prev) {
                        return prev ? __assign(__assign({}, prev), { photoURL: null }) : prev;
                    });
                }}/>) : (<react_native_1.View style={[styles.modalAvatar, styles.avatarFallback]}>
                      <react_native_1.Text style={styles.initials}>{getInitials(selectedUser)}</react_native_1.Text>
                    </react_native_1.View>)}
                  <react_native_1.Text style={styles.modalDisplayName}>{selectedUser.username}</react_native_1.Text>
                  {!!selectedUser.username && (<react_native_1.Text style={styles.modalUsername}>
                      {"@".concat(cleanUsername(selectedUser.username))}
                    </react_native_1.Text>)}
                  {bio ? (<react_native_1.Text style={styles.modalBio}>{bio}</react_native_1.Text>) : (<react_native_1.Text style={styles.modalBioPlaceholder}>No bio yet.</react_native_1.Text>)}
                  <react_native_1.View style={styles.crewRow}>
                    <react_native_1.Text style={styles.crewText}>
                      Crew: {crewLoading ? '...' : crewCount !== null ? crewCount : '-'}
                    </react_native_1.Text>
                  </react_native_1.View>
                </react_native_1.ScrollView>

                <react_native_1.View style={styles.modalActions}>
                  <react_native_1.View style={styles.communicationActionsRow}>
                    <react_native_1.Pressable style={[styles.modalActionButton, styles.primaryAction, styles.messageAction]} onPress={function () {
                if (!selectedUser)
                    return;
                var name = selectedUser.username || selectedUser.email || 'User';
                closeModal();
                if (onChatUserSelect) {
                    onChatUserSelect({ uid: selectedUser.uid, name: name });
                }
            }}>
                      <react_native_1.Text style={styles.primaryActionText}>Message</react_native_1.Text>
                    </react_native_1.Pressable>
                    <react_native_1.Pressable style={[styles.iconActionButton, styles.audioAction]} onPress={function () {
                if (!selectedUser)
                    return;
                var name = selectedUser.username || selectedUser.email || 'User';
                closeModal();
                onAudioCallUserSelect === null || onAudioCallUserSelect === void 0 ? void 0 : onAudioCallUserSelect({ uid: selectedUser.uid, name: name });
            }}>
                      <react_native_1.Text style={styles.iconActionText}>📞</react_native_1.Text>
                    </react_native_1.Pressable>
                    <react_native_1.Pressable style={[styles.iconActionButton, styles.videoAction]} onPress={function () {
                if (!selectedUser)
                    return;
                var name = selectedUser.username || selectedUser.email || 'User';
                closeModal();
                onVideoCallUserSelect === null || onVideoCallUserSelect === void 0 ? void 0 : onVideoCallUserSelect({ uid: selectedUser.uid, name: name });
            }}>
                      <react_native_1.Text style={styles.iconActionText}>🎥</react_native_1.Text>
                    </react_native_1.Pressable>
                  </react_native_1.View>
                  <react_native_1.Pressable style={[
                styles.modalActionButton,
                inCrew ? styles.leaveAction : styles.connectAction,
                crewLoading && styles.disabledAction,
            ]} onPress={handleConnectLeave} disabled={crewLoading}>
                    <react_native_1.Text style={styles.secondaryActionText}>
                      {crewLoading
                ? inCrew
                    ? 'Leaving...'
                    : 'Connecting...'
                : inCrew
                    ? 'Leave Tide'
                    : 'Connect Tide'}
                    </react_native_1.Text>
                  </react_native_1.Pressable>
                  <react_native_1.Pressable style={[styles.modalActionButton, styles.closeAction]} onPress={closeModal}>
                    <react_native_1.Text style={styles.closeActionText}>Close</react_native_1.Text>
                  </react_native_1.Pressable>
                </react_native_1.View>
              </>)}
          </react_native_1.Pressable>
        </react_native_1.Pressable>
      </react_native_1.Modal>
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
        backgroundColor: '#0090BB',
        opacity: 0.8,
    },
    searchButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 15,
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
        maxHeight: 300,
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
        padding: 8,
    },
    webItem: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderBottomWidth: react_native_1.StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(0, 194, 255, 0.25)',
    },
    webTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    webUrl: {
        color: '#58C8FF',
        fontSize: 12,
        marginTop: 2,
    },
    webDescription: {
        color: 'rgba(255,255,255,0.75)',
        fontSize: 12,
        marginTop: 4,
        lineHeight: 16,
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
    avatarFallback: {
        backgroundColor: '#00C2FF33',
        justifyContent: 'center',
        alignItems: 'center',
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        width: '88%',
        maxWidth: 420,
        maxHeight: '82%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#001529',
        textAlign: 'center',
        marginBottom: 12,
    },
    modalBody: {
        maxHeight: 360,
    },
    modalBodyContent: {
        alignItems: 'center',
    },
    modalAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 12,
    },
    modalDisplayName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000',
        marginTop: 8,
        textAlign: 'center',
    },
    modalUsername: {
        fontSize: 16,
        color: '#00C2FF',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalBio: {
        color: '#334155',
        fontSize: 14,
        marginBottom: 10,
        textAlign: 'center',
        lineHeight: 20,
    },
    modalBioPlaceholder: {
        color: '#94A3B8',
        fontSize: 14,
        marginBottom: 10,
        textAlign: 'center',
    },
    crewRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    crewText: {
        color: '#00C2FF',
        fontWeight: 'bold',
        fontSize: 15,
    },
    modalActions: {
        marginTop: 16,
        gap: 10,
    },
    communicationActionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        width: '100%',
    },
    modalActionButton: {
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
        width: '100%',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.12,
        shadowRadius: 2,
    },
    primaryAction: {
        backgroundColor: '#00C2FF',
    },
    messageAction: {
        flex: 1,
    },
    iconActionButton: {
        width: 48,
        height: 44,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        backgroundColor: '#0B1220',
    },
    audioAction: {
        borderColor: '#10B981',
        backgroundColor: 'rgba(16,185,129,0.22)',
    },
    videoAction: {
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37,99,235,0.22)',
    },
    iconActionText: {
        fontSize: 18,
    },
    connectAction: {
        backgroundColor: '#0EA5E9',
    },
    leaveAction: {
        backgroundColor: '#EF4444',
    },
    closeAction: {
        backgroundColor: '#E2E8F0',
    },
    disabledAction: {
        opacity: 0.65,
    },
    initials: {
        color: '#00C2FF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    primaryActionText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
        textAlign: 'center',
    },
    secondaryActionText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 13,
        textAlign: 'center',
    },
    closeActionText: {
        color: '#1E293B',
        fontWeight: '700',
        fontSize: 13,
        textAlign: 'center',
    },
});
exports.default = VibeHuntUserSearch;
