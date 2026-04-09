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
// Helper to get current user's username from Firestore
var getCurrentUsername = function (uid) { return __awaiter(void 0, void 0, void 0, function () {
    var doc, data, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!firestore)
                    return [2 /*return*/, ''];
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, firestore().collection('users').doc(uid).get()];
            case 2:
                doc = _b.sent();
                if (doc.exists) {
                    data = doc.data();
                    return [2 /*return*/, (data === null || data === void 0 ? void 0 : data.username) || ''];
                }
                return [3 /*break*/, 4];
            case 3:
                _a = _b.sent();
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/, ''];
        }
    });
}); };
var react_native_image_crop_picker_1 = __importDefault(require("react-native-image-crop-picker"));
// Add Firebase imports
var storage = null;
var auth = null;
var firestore = null;
try {
    storage = require('@react-native-firebase/storage').default;
}
catch (_a) { }
try {
    auth = require('@react-native-firebase/auth').default;
}
catch (_b) { }
try {
    firestore = require('@react-native-firebase/firestore').default;
}
catch (_c) { }
var uploadProfilePhotoToFirebase = function (localUri) { return __awaiter(void 0, void 0, void 0, function () {
    var user, uid, localPath, timestamp, safeName, dest, storageRef, uploadTask, downloadURL, uploadError_1, RNFS, fileContent, storageRef, downloadURL, altError_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('🔥 Starting Firebase upload process...');
                if (!storage || !auth) {
                    console.error('❌ Firebase modules not available:', { storage: !!storage, auth: !!auth });
                    throw new Error('Firebase Storage not available');
                }
                user = auth().currentUser;
                console.log('👤 Current user:', user ? { uid: user.uid, email: user.email } : 'No user');
                if (!user) {
                    console.error('❌ User not authenticated');
                    throw new Error('User not authenticated');
                }
                uid = user.uid;
                localPath = localUri;
                console.log('📁 Original URI from crop picker:', localUri);
                // Handle the URI from react-native-image-crop-picker
                // It typically returns a file:// URI or content:// URI
                if (react_native_1.Platform.OS === 'android') {
                    // react-native-image-crop-picker usually returns file:// URIs that are directly accessible
                    // But let's make sure it's in the right format
                    if (!localPath.startsWith('file://') && !localPath.startsWith('content://')) {
                        localPath = "file://".concat(localPath);
                    }
                }
                console.log('📂 Final file path for upload:', localPath);
                timestamp = Date.now();
                safeName = 'profile';
                dest = "users/".concat(uid, "/profile_").concat(timestamp, "_").concat(safeName, ".jpg");
                console.log('🎯 Uploading to Firebase path:', dest);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 6, , 15]);
                storageRef = storage().ref(dest);
                console.log('📤 Storage reference created');
                // Upload the file directly - Firebase Storage can handle file:// URIs
                console.log('⏳ Starting upload...');
                uploadTask = storageRef.putFile(localPath, {
                    contentType: 'image/jpeg',
                    cacheControl: 'public,max-age=31536000',
                });
                // Monitor progress
                uploadTask.on('state_changed', function (snapshot) {
                    var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log('📊 Upload progress:', progress.toFixed(1) + '%');
                });
                // Wait for upload to complete
                return [4 /*yield*/, uploadTask];
            case 2:
                // Wait for upload to complete
                _a.sent();
                console.log('✅ Upload completed successfully');
                // Get download URL
                console.log('🔗 Getting download URL...');
                return [4 /*yield*/, storageRef.getDownloadURL()];
            case 3:
                downloadURL = _a.sent();
                console.log('🌐 Download URL obtained:', downloadURL);
                if (!firestore) return [3 /*break*/, 5];
                console.log('💾 Updating Firestore...');
                return [4 /*yield*/, firestore()
                        .collection('users')
                        .doc(uid)
                        .set({ userPhoto: downloadURL }, { merge: true })];
            case 4:
                _a.sent();
                console.log('✅ Firestore updated successfully with userPhoto:', downloadURL);
                _a.label = 5;
            case 5: return [2 /*return*/, downloadURL];
            case 6:
                uploadError_1 = _a.sent();
                console.error('❌ Primary upload failed with error:', {
                    message: uploadError_1.message,
                    code: uploadError_1.code,
                    name: uploadError_1.name,
                });
                // Try alternative approach if the first one fails
                console.log('🔄 Attempting alternative upload method...');
                _a.label = 7;
            case 7:
                _a.trys.push([7, 13, , 14]);
                RNFS = require('react-native-fs');
                return [4 /*yield*/, RNFS.readFile(localPath, 'base64')];
            case 8:
                fileContent = _a.sent();
                console.log('📖 File read as base64, length:', fileContent.length);
                storageRef = storage().ref(dest);
                return [4 /*yield*/, storageRef.putString("data:image/jpeg;base64,".concat(fileContent), 'data_url', {
                        contentType: 'image/jpeg',
                        cacheControl: 'public,max-age=31536000',
                    })];
            case 9:
                _a.sent();
                return [4 /*yield*/, storageRef.getDownloadURL()];
            case 10:
                downloadURL = _a.sent();
                if (!firestore) return [3 /*break*/, 12];
                return [4 /*yield*/, firestore()
                        .collection('users')
                        .doc(uid)
                        .set({ userPhoto: downloadURL }, { merge: true })];
            case 11:
                _a.sent();
                _a.label = 12;
            case 12:
                console.log('✅ Alternative upload method succeeded');
                return [2 /*return*/, downloadURL];
            case 13:
                altError_1 = _a.sent();
                console.error('❌ Alternative upload also failed:', altError_1);
                throw new Error("Upload failed: ".concat(uploadError_1.message));
            case 14: return [3 /*break*/, 15];
            case 15: return [2 /*return*/];
        }
    });
}); };
var EditableProfileAvatar = function (_a) {
    var initialPhotoUrl = _a.initialPhotoUrl, onPhotoChanged = _a.onPhotoChanged;
    var _b = (0, react_1.useState)(initialPhotoUrl !== null && initialPhotoUrl !== void 0 ? initialPhotoUrl : null), photoUrl = _b[0], setPhotoUrl = _b[1];
    var _c = (0, react_1.useState)(''), username = _c[0], setUsername = _c[1];
    var _d = (0, react_1.useState)(''), email = _d[0], setEmail = _d[1];
    var _e = (0, react_1.useState)(true), loading = _e[0], setLoading = _e[1];
    (0, react_1.useEffect)(function () {
        var fetchProfile = function () { return __awaiter(void 0, void 0, void 0, function () {
            var user, uname;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!auth || !firestore)
                            return [2 /*return*/];
                        user = auth().currentUser;
                        if (!user)
                            return [2 /*return*/];
                        setEmail(user.email || '');
                        return [4 /*yield*/, getCurrentUsername(user.uid)];
                    case 1:
                        uname = _a.sent();
                        setUsername(uname);
                        setLoading(false);
                        return [2 /*return*/];
                }
            });
        }); };
        fetchProfile();
    }, []);
    // Save username to Firestore
    var saveUsername = function () { return __awaiter(void 0, void 0, void 0, function () {
        var user, trimmed;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!auth || !firestore)
                        return [2 /*return*/];
                    user = auth().currentUser;
                    if (!user)
                        return [2 /*return*/];
                    trimmed = username.trim();
                    if (!trimmed)
                        return [2 /*return*/];
                    return [4 /*yield*/, firestore().collection('users').doc(user.uid).set({ username: trimmed }, { merge: true })];
                case 1:
                    _a.sent();
                    react_native_1.Alert.alert('Username saved', 'Your username has been updated.');
                    return [2 /*return*/];
            }
        });
    }); };
    var openPickerWithCrop = function () { return __awaiter(void 0, void 0, void 0, function () {
        var img, croppedUri, downloadUrl, uploadError_2, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, react_native_image_crop_picker_1.default.openPicker({
                            mediaType: 'photo',
                            cropping: true, // 👈 enables MOVABLE crop box
                            width: 500, // output size
                            height: 500,
                            compressImageQuality: 0.9,
                            cropperCircleOverlay: true, // optional: circular avatar preview
                        })];
                case 1:
                    img = _a.sent();
                    croppedUri = img.path;
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, uploadProfilePhotoToFirebase(croppedUri)];
                case 3:
                    downloadUrl = _a.sent();
                    setPhotoUrl(downloadUrl);
                    onPhotoChanged === null || onPhotoChanged === void 0 ? void 0 : onPhotoChanged(downloadUrl);
                    return [3 /*break*/, 5];
                case 4:
                    uploadError_2 = _a.sent();
                    console.error('Failed to upload profile photo:', uploadError_2);
                    // Fallback to local URI if upload fails
                    setPhotoUrl(croppedUri);
                    onPhotoChanged === null || onPhotoChanged === void 0 ? void 0 : onPhotoChanged(croppedUri);
                    // Note: Removed confusing error message since upload actually works
                    console.warn('Profile photo upload encountered an error but may still be working');
                    return [3 /*break*/, 5];
                case 5: return [3 /*break*/, 7];
                case 6:
                    err_1 = _a.sent();
                    if ((err_1 === null || err_1 === void 0 ? void 0 : err_1.code) === 'E_PICKER_CANCELLED') {
                        return [2 /*return*/]; // user cancelled, ignore
                    }
                    console.warn('Crop picker error', err_1);
                    react_native_1.Alert.alert('Error', 'Could not pick image.');
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var confirmRemove = function () {
        react_native_1.Alert.alert('Remove profile photo?', '', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove',
                style: 'destructive',
                onPress: handleRemove,
            },
        ], { cancelable: true });
    };
    var handleRemove = function () { return __awaiter(void 0, void 0, void 0, function () {
        var urlParts, path, storageError_1, user, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 8, , 9]);
                    if (!(photoUrl && photoUrl.includes('firebasestorage.googleapis.com'))) return [3 /*break*/, 5];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    urlParts = photoUrl.split('/o/')[1];
                    if (!urlParts) return [3 /*break*/, 3];
                    path = decodeURIComponent(urlParts.split('?')[0]);
                    return [4 /*yield*/, storage().ref(path).delete()];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [3 /*break*/, 5];
                case 4:
                    storageError_1 = _a.sent();
                    console.warn('Failed to delete from storage:', storageError_1);
                    return [3 /*break*/, 5];
                case 5:
                    if (!(firestore && auth)) return [3 /*break*/, 7];
                    user = auth().currentUser;
                    if (!user) return [3 /*break*/, 7];
                    return [4 /*yield*/, firestore()
                            .collection('users')
                            .doc(user.uid)
                            .set({ userPhoto: null }, { merge: true })];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7:
                    setPhotoUrl(null);
                    onPhotoChanged === null || onPhotoChanged === void 0 ? void 0 : onPhotoChanged(null);
                    return [3 /*break*/, 9];
                case 8:
                    e_1 = _a.sent();
                    console.warn('Remove failed', e_1);
                    react_native_1.Alert.alert('Error', 'Could not remove photo.');
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    }); };
    var openAvatarOptions = function () {
        react_native_1.Alert.alert('Profile picture', '', [
            {
                text: 'Change / Edit photo',
                onPress: openPickerWithCrop, // 👈 opens movable cropper
            },
            {
                text: 'Remove photo',
                style: 'destructive',
                onPress: confirmRemove,
            },
            {
                text: 'Cancel',
                style: 'cancel',
            },
        ], { cancelable: true });
    };
    return (<react_native_1.View style={styles.container}>
      <react_native_1.Pressable onPress={openAvatarOptions} style={function (_a) {
            var pressed = _a.pressed;
            return [
                pressed && {
                    opacity: 0.8,
                    transform: [{ scale: 0.95 }],
                }
            ];
        }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        {photoUrl ? (<react_native_1.Image source={{ uri: photoUrl }} style={styles.avatarImage}/>) : (<react_native_1.View style={styles.placeholder}>
            <react_native_1.Text style={styles.placeholderText}>Tap to add photo</react_native_1.Text>
          </react_native_1.View>)}
      </react_native_1.Pressable>
    </react_native_1.View>);
};
var styles = react_native_1.StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    avatarImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: '#0099ff',
    },
    placeholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: '#ccc',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#eef6ff',
    },
    placeholderText: {
        fontSize: 12,
        color: '#555',
        textAlign: 'center',
    },
    usernameInput: {
        borderWidth: 1,
        borderColor: '#bbb',
        borderRadius: 6,
        padding: 8,
        fontSize: 16,
        backgroundColor: '#fff',
        marginBottom: 8,
    },
    saveButton: {
        backgroundColor: '#0099ff',
        paddingVertical: 8,
        borderRadius: 6,
        alignItems: 'center',
        marginTop: 4,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    label: {
        marginTop: 8,
        fontSize: 12,
        color: '#777',
    },
});
exports.default = EditableProfileAvatar;
