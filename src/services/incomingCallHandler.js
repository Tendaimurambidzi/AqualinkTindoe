"use strict";
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
exports.initializeCallNotifications = initializeCallNotifications;
exports.showIncomingCallNotification = showIncomingCallNotification;
exports.hideCallNotification = hideCallNotification;
var react_native_1 = require("react-native");
var messaging_1 = __importDefault(require("@react-native-firebase/messaging"));
var callNotificationService_1 = __importDefault(require("./callNotificationService"));
var firestore_1 = __importDefault(require("@react-native-firebase/firestore"));
var currentCallNotificationId = null;
/**
 * Initialize call notification handlers
 * This should be called once when the app starts
 */
function initializeCallNotifications() {
    var _this = this;
    // Handle foreground messages
    var unsubscribeForeground = (0, messaging_1.default)().onMessage(function (remoteMessage) { return __awaiter(_this, void 0, void 0, function () {
        var callerName, callId, callType;
        var _a;
        return __generator(this, function (_b) {
            console.log('Foreground FCM message:', remoteMessage);
            if (((_a = remoteMessage.data) === null || _a === void 0 ? void 0 : _a.type) === 'call_invite') {
                callerName = remoteMessage.data.callerName || remoteMessage.data.fromName || 'Unknown';
                callId = remoteMessage.data.callId || '';
                callType = remoteMessage.data.callType || 'audio';
                if (callId && react_native_1.Platform.OS === 'android') {
                    // Show notification even in foreground to ensure ringtone plays
                    callNotificationService_1.default.showIncomingCallNotification(callerName, callId, callType);
                    currentCallNotificationId = callId;
                }
            }
            return [2 /*return*/];
        });
    }); });
    // Handle notification opened (user tapped on notification)
    var unsubscribeNotificationOpened = (0, messaging_1.default)().onNotificationOpenedApp(function (remoteMessage) {
        var _a;
        console.log('Notification opened:', remoteMessage);
        if (((_a = remoteMessage.data) === null || _a === void 0 ? void 0 : _a.type) === 'call_invite') {
            var callId = remoteMessage.data.callId || '';
            if (callId) {
                // The app will handle showing the call modal
                // Just hide the notification
                hideCallNotification();
            }
        }
    });
    // Check if app was opened from a notification (when app was quit)
    (0, messaging_1.default)()
        .getInitialNotification()
        .then(function (remoteMessage) {
        var _a;
        if (((_a = remoteMessage === null || remoteMessage === void 0 ? void 0 : remoteMessage.data) === null || _a === void 0 ? void 0 : _a.type) === 'call_invite') {
            var callId = remoteMessage.data.callId || '';
            if (callId) {
                // The app will handle showing the call modal
                hideCallNotification();
            }
        }
    });
    // Listen for call answered/declined from notification actions
    var answerListener = callNotificationService_1.default.addCallEventListener('onCallAnswered', function (_a) {
        var callId = _a.callId;
        console.log('Call answered from notification:', callId);
        hideCallNotification();
        // The app will handle the rest
    });
    var declineListener = callNotificationService_1.default.addCallEventListener('onCallDeclined', function (_a) {
        var callId = _a.callId;
        console.log('Call declined from notification:', callId);
        hideCallNotification();
        // Update call status in Firestore
        updateCallStatus(callId, 'declined');
    });
    // Hide notification when app comes to foreground
    var appStateListener = react_native_1.AppState.addEventListener('change', function (nextAppState) {
        if (nextAppState === 'active' && currentCallNotificationId) {
            // Give a small delay to let the app show its own modal
            setTimeout(function () {
                hideCallNotification();
            }, 500);
        }
    });
    // Return cleanup function
    return function () {
        unsubscribeForeground();
        unsubscribeNotificationOpened();
        answerListener.remove();
        declineListener.remove();
        appStateListener.remove();
    };
}
/**
 * Show incoming call notification
 */
function showIncomingCallNotification(callerName, callId, callType) {
    if (react_native_1.Platform.OS === 'android') {
        callNotificationService_1.default.showIncomingCallNotification(callerName, callId, callType);
        currentCallNotificationId = callId;
    }
}
/**
 * Hide incoming call notification
 */
function hideCallNotification() {
    if (react_native_1.Platform.OS === 'android' && currentCallNotificationId) {
        callNotificationService_1.default.hideIncomingCallNotification();
        currentCallNotificationId = null;
    }
}
/**
 * Update call status in Firestore
 */
function updateCallStatus(callId, status) {
    return __awaiter(this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, firestore_1.default)()
                            .collection('direct_calls')
                            .doc(callId)
                            .update({
                            status: status,
                            endedAt: firestore_1.default.FieldValue.serverTimestamp(),
                        })];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error updating call status:', error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
