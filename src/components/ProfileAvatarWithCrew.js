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
var firestore_1 = __importDefault(require("@react-native-firebase/firestore"));
var _a = react_native_1.Dimensions.get('window'), SCREEN_WIDTH = _a.width, SCREEN_HEIGHT = _a.height;
var ProfileAvatarWithCrew = function (_a) {
    var userId = _a.userId, _b = _a.size, size = _b === void 0 ? 50 : _b, _c = _a.showCrewCount, showCrewCount = _c === void 0 ? true : _c, _d = _a.showFleetCount, showFleetCount = _d === void 0 ? false : _d, style = _a.style, optimisticCrewCount = _a.optimisticCrewCount;
    var _e = (0, react_1.useState)(null), userData = _e[0], setUserData = _e[1];
    var _f = (0, react_1.useState)(true), loading = _f[0], setLoading = _f[1];
    var _g = (0, react_1.useState)(false), showModal = _g[0], setShowModal = _g[1];
    var _h = (0, react_1.useState)(Date.now()), cacheBustKey = _h[0], setCacheBustKey = _h[1];
    var _j = (0, react_1.useState)(false), imageFailed = _j[0], setImageFailed = _j[1];
    var _k = (0, react_1.useState)(0), crewCount = _k[0], setCrewCount = _k[1];
    var _l = (0, react_1.useState)(0), fleetCount = _l[0], setFleetCount = _l[1];
    // Debug logging for state changes
    (0, react_1.useEffect)(function () {
        console.log("[DEBUG] ProfileAvatarWithCrew fleetCount changed to ".concat(fleetCount, " for user ").concat(userId));
    }, [fleetCount, userId]);
    (0, react_1.useEffect)(function () {
        if (!userId) {
            console.log("[DEBUG] ProfileAvatarWithCrew: No userId provided");
            return;
        }
        console.log("[DEBUG] ProfileAvatarWithCrew: Setting up listeners for userId: ".concat(userId, ", showFleetCount: ").concat(showFleetCount, ", current fleetCount: ").concat(fleetCount));
        // Reset counts when userId changes
        setCrewCount(0);
        setFleetCount(0);
        setLoading(true);
        // Set up real-time listener for user data changes
        var unsubscribeUser = (0, firestore_1.default)()
            .collection('users')
            .doc(userId)
            .onSnapshot(function (userDoc) {
            if (userDoc.exists) {
                var newUserData = userDoc.data();
                console.log("[ProfileAvatarWithCrew] Firestore update for user ".concat(userId, ":"), {
                    oldPhoto: (userData === null || userData === void 0 ? void 0 : userData.photoURL) || (userData === null || userData === void 0 ? void 0 : userData.userPhoto),
                    newPhoto: (newUserData === null || newUserData === void 0 ? void 0 : newUserData.photoURL) || (newUserData === null || newUserData === void 0 ? void 0 : newUserData.userPhoto),
                    hasData: !!newUserData
                });
                setUserData(newUserData);
                setImageFailed(false);
                // Update cache-busting key when photoURL changes
                var newPhotoURL = (newUserData === null || newUserData === void 0 ? void 0 : newUserData.photoURL) || (newUserData === null || newUserData === void 0 ? void 0 : newUserData.userPhoto);
                var currentPhotoURL = (userData === null || userData === void 0 ? void 0 : userData.photoURL) || (userData === null || userData === void 0 ? void 0 : userData.userPhoto);
                if (newPhotoURL !== currentPhotoURL && newPhotoURL) {
                    console.log("[ProfileAvatarWithCrew] Photo URL changed for user ".concat(userId, ", updating cache key"));
                    setCacheBustKey(Date.now());
                }
            }
            setLoading(false);
        }, function (error) {
            console.error('[ProfileAvatarWithCrew] Error listening to user data:', error);
            setLoading(false);
        });
        // Set up real-time listener for crew count changes (followers)
        var unsubscribeCrew = (0, firestore_1.default)()
            .collection('users')
            .doc(userId)
            .collection('crew')
            .onSnapshot(function (crewSnapshot) {
            var newCount = crewSnapshot.size;
            console.log("[DEBUG] Crew count (followers) update for user ".concat(userId, ": ").concat(crewCount, " -> ").concat(newCount, " (docs: ").concat(crewSnapshot.docs.length, ")"));
            setCrewCount(newCount);
        }, function (error) {
            console.error("[DEBUG] Error listening to crew count for ".concat(userId, ":"), error);
        });
        // Set up real-time listener for fleet count changes (following)
        var unsubscribeFleet = (0, firestore_1.default)()
            .collection('users')
            .doc(userId)
            .collection('following')
            .onSnapshot(function (fleetSnapshot) {
            var newCount = fleetSnapshot.size;
            console.log("[DEBUG] ProfileAvatarWithCrew Fleet listener fired for user ".concat(userId, ": current fleetCount=").concat(fleetCount, ", newCount=").concat(newCount, ", docs:"), fleetSnapshot.docs.map(function (doc) { return ({ id: doc.id, exists: doc.exists }); }));
            console.log("[DEBUG] Setting fleetCount to ".concat(newCount, " for user ").concat(userId));
            setFleetCount(newCount);
            console.log("[DEBUG] fleetCount has been set to ".concat(newCount, " for user ").concat(userId));
        }, function (error) {
            console.error("[DEBUG] Error listening to fleet count for ".concat(userId, ":"), error);
        });
        // Cleanup listeners on unmount or userId change
        return function () {
            unsubscribeUser();
            unsubscribeCrew();
            unsubscribeFleet();
        };
    }, [userId]);
    if (loading) {
        return (<react_native_1.View style={[styles.container, style]}>
        <react_native_1.View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}/>
        {showCrewCount && (<react_native_1.Text style={styles.crewText}>Crew: ...</react_native_1.Text>)}
        {showFleetCount && (<react_native_1.Text style={styles.fleetText}>Fleet: ...</react_native_1.Text>)}
      </react_native_1.View>);
    }
    var photoURL = (userData === null || userData === void 0 ? void 0 : userData.photoURL) ||
        (userData === null || userData === void 0 ? void 0 : userData.userPhoto) ||
        (userData === null || userData === void 0 ? void 0 : userData.avatar) ||
        (userData === null || userData === void 0 ? void 0 : userData.profilePicture) ||
        'https://via.placeholder.com/50';
    // Use stable cache-busting key that only updates when photoURL actually changes
    var photoURLWithCacheBust = photoURL && !photoURL.includes('via.placeholder.com')
        ? "".concat(photoURL, "?t=").concat(cacheBustKey)
        : null;
    // Helper to get initials from displayName or username
    var getInitials = function () {
        var _a;
        var name = String((userData === null || userData === void 0 ? void 0 : userData.displayName) || (userData === null || userData === void 0 ? void 0 : userData.name) || (userData === null || userData === void 0 ? void 0 : userData.username) || '')
            .replace(/^[@/]+/, '')
            .trim();
        if (!name)
            return '?';
        var parts = name.trim().split(' ');
        if (parts.length === 1)
            return ((_a = parts[0][0]) === null || _a === void 0 ? void 0 : _a.toUpperCase()) || '?';
        return (parts[0][0] + parts[1][0]).toUpperCase();
    };
    // Format crew count (show "1k" for 1000+)
    var formatCrewCount = function (count) {
        if (count >= 1000) {
            return "".concat(Math.floor(count / 1000), "k");
        }
        return count.toString();
    };
    // Format fleet count (show "1k" for 1000+)
    var formatFleetCount = function (count) {
        if (count >= 1000) {
            return "".concat(Math.floor(count / 1000), "k");
        }
        return count.toString();
    };
    return (<>
      <react_native_1.View style={[styles.container, style]}>
        <react_native_1.Pressable onPress={function () { return setShowModal(true); }} style={function (_a) {
            var pressed = _a.pressed;
            return [
                { padding: 2 },
                pressed && {
                    opacity: 0.8,
                    transform: [{ scale: 0.95 }],
                },
            ];
        }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          {photoURLWithCacheBust && !imageFailed ? (<react_native_1.Image source={{ uri: photoURLWithCacheBust }} style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]} onError={function () { return setImageFailed(true); }}/>) : (<react_native_1.View style={[
                styles.avatar,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: '#00C2FF33',
                    justifyContent: 'center',
                    alignItems: 'center',
                },
            ]}>
              <react_native_1.Text style={styles.initials}>{getInitials()}</react_native_1.Text>
            </react_native_1.View>)}
        </react_native_1.Pressable>
        <react_native_1.View style={styles.countsContainer}>
          {showCrewCount && (<react_native_1.Text style={styles.crewText}>Crew: {formatCrewCount(optimisticCrewCount !== undefined ? optimisticCrewCount : crewCount)}</react_native_1.Text>)}
          {showFleetCount && (<react_native_1.Text style={styles.fleetText}>Fleet: {formatFleetCount(fleetCount)}</react_native_1.Text>)}
        </react_native_1.View>
      </react_native_1.View>

      {/* Full-size profile picture modal */}
      <react_native_1.Modal visible={showModal} transparent={true} animationType="fade" onRequestClose={function () { return setShowModal(false); }}>
        <react_native_1.View style={styles.modalOverlay}>
          {/* Close button */}
          <react_native_1.Pressable style={function (_a) {
            var pressed = _a.pressed;
            return [
                styles.closeButton,
                pressed && {
                    opacity: 0.8,
                    transform: [{ scale: 0.9 }],
                },
            ];
        }} onPress={function () { return setShowModal(false); }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <react_native_1.Text style={styles.closeButtonText}>✕</react_native_1.Text>
          </react_native_1.Pressable>

          {/* Image or initials in modal */}
          <react_native_1.Pressable style={styles.modalContent} onPress={function () { return setShowModal(false); }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            {photoURLWithCacheBust && !imageFailed ? (<react_native_1.Image source={{ uri: photoURLWithCacheBust }} style={styles.fullSizeImage} resizeMode="contain" onError={function () { return setImageFailed(true); }}/>) : (<react_native_1.View style={{
                width: '100%',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#00C2FF33',
                borderRadius: 10,
            }}>
                <react_native_1.Text style={[styles.initials, { fontSize: 48 }]}>{getInitials()}</react_native_1.Text>
              </react_native_1.View>)}
          </react_native_1.Pressable>
        </react_native_1.View>
      </react_native_1.Modal>
    </>);
};
var styles = react_native_1.StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    countsContainer: {
        marginLeft: 8,
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    avatar: {
        backgroundColor: '#ccc',
        borderWidth: 2,
        borderColor: '#00C2FF',
    },
    initials: {
        color: '#00C2FF',
        fontWeight: 'bold',
        fontSize: 24,
    },
    crewText: {
        fontSize: 12,
        color: '#DC143C',
        fontWeight: 'bold',
    },
    fleetText: {
        fontSize: 12,
        color: '#00C2FF',
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    closeButtonText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    modalContent: {
        width: SCREEN_WIDTH * 0.9,
        height: SCREEN_HEIGHT * 0.7,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullSizeImage: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
});
exports.default = ProfileAvatarWithCrew;
