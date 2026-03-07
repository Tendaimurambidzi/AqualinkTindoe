package com.aqualink.tindo

import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class CallNotificationModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "CallNotification"

    @ReactMethod
    fun showIncomingCallNotification(callerName: String, callId: String, callType: String) {
        val context = reactApplicationContext
        CallNotificationService.startService(context, callerName, callId, callType)
    }

    @ReactMethod
    fun hideIncomingCallNotification() {
        val context = reactApplicationContext
        CallNotificationService.stopService(context)
    }
    
    @ReactMethod
    fun addListener(eventName: String) {
        // Required for RN built-in Event Emitter Calls
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for RN built-in Event Emitter Calls
    }
}
