package com.aqualink.tindo

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.bridge.Arguments
import com.facebook.react.modules.core.DeviceEventManagerModule

class CallActionReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val callId = intent.getStringExtra("callId") ?: return
        
        when (intent.action) {
            CallNotificationService.ACTION_ANSWER -> {
                // Send event to React Native
                sendEventToReactNative(context, "onCallAnswered", callId)
                // Stop the notification service
                CallNotificationService.stopService(context)
                // Launch the app
                val launchIntent = Intent(context, MainActivity::class.java).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                    putExtra("callId", callId)
                    putExtra("action", "answer_call")
                }
                context.startActivity(launchIntent)
            }
            CallNotificationService.ACTION_DECLINE -> {
                // Send event to React Native
                sendEventToReactNative(context, "onCallDeclined", callId)
                // Stop the notification service
                CallNotificationService.stopService(context)
            }
        }
    }
    
    private fun sendEventToReactNative(context: Context, eventName: String, callId: String) {
        try {
            val params = Arguments.createMap().apply {
                putString("callId", callId)
            }
            // This will be handled by the React Native event emitter
            val intent = Intent(context, CallEventService::class.java).apply {
                putExtra("eventName", eventName)
                putExtra("callId", callId)
            }
            context.startService(intent)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
