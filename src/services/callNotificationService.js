"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("react-native");
var CallNotification = react_native_1.NativeModules.CallNotification;
var CallNotificationManager = /** @class */ (function () {
    function CallNotificationManager() {
        this.eventEmitter = null;
        if (react_native_1.Platform.OS === 'android' && CallNotification) {
            this.eventEmitter = new react_native_1.NativeEventEmitter(CallNotification);
        }
    }
    CallNotificationManager.prototype.showIncomingCallNotification = function (callerName, callId, callType) {
        if (react_native_1.Platform.OS === 'android' && CallNotification) {
            CallNotification.showIncomingCallNotification(callerName, callId, callType);
        }
    };
    CallNotificationManager.prototype.hideIncomingCallNotification = function () {
        if (react_native_1.Platform.OS === 'android' && CallNotification) {
            CallNotification.hideIncomingCallNotification();
        }
    };
    CallNotificationManager.prototype.addCallEventListener = function (eventName, callback) {
        if (this.eventEmitter) {
            return this.eventEmitter.addListener(eventName, callback);
        }
        return { remove: function () { } };
    };
    return CallNotificationManager;
}());
exports.default = new CallNotificationManager();
