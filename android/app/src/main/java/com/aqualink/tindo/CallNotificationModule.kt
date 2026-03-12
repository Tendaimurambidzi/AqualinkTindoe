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
    fun getInitialCallData(promise: Promise) {
        try {
            val activity = reactApplicationContext.currentActivity
            val intent = activity?.intent
            val action = (intent?.getStringExtra("action") ?: "").trim()
            val callId = (intent?.getStringExtra("callId") ?: "").trim()
            if (callId.isNotEmpty() && (action == "incoming_call" || action == "answer_call")) {
                val data = Arguments.createMap().apply {
                    putString("action", action)
                    putString("type", "call_invite")
                    putString("callId", callId)
                    putString("callerName", intent?.getStringExtra("callerName") ?: "")
                    putString("fromName", intent?.getStringExtra("callerName") ?: "")
                    putString("callType", intent?.getStringExtra("callType") ?: "audio")
                }
                CallIntentStore.cacheFromIntent(reactApplicationContext, intent)
                promise.resolve(data)
                return
            }

            val cached = CallIntentStore.get(reactApplicationContext)
            if (cached == null) {
                promise.resolve(null)
                return
            }
            val cachedMap = Arguments.createMap().apply {
                putString("action", cached.action)
                putString("type", "call_invite")
                putString("callId", cached.callId)
                putString("callerName", cached.callerName)
                putString("fromName", cached.callerName)
                putString("callType", cached.callType)
            }
            promise.resolve(cachedMap)
        } catch (e: Exception) {
            promise.reject("ERR_GET_INITIAL_CALL_DATA", e)
        }
    }

    @ReactMethod
    fun clearInitialCallData(promise: Promise) {
        try {
            val activity = reactApplicationContext.currentActivity
            val intent = activity?.intent
            if (intent != null) {
                intent.removeExtra("action")
                intent.removeExtra("callId")
                intent.removeExtra("callerName")
                intent.removeExtra("callType")
            }
            CallIntentStore.clear(reactApplicationContext)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERR_CLEAR_INITIAL_CALL_DATA", e)
        }
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
