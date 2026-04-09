package com.aqualink.tindo

import android.content.Intent
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.bridge.Arguments
import com.facebook.react.jstasks.HeadlessJsTaskConfig

class CallEventService : HeadlessJsTaskService() {
    override fun getTaskConfig(intent: Intent?): HeadlessJsTaskConfig? {
        val eventName = intent?.getStringExtra("eventName") ?: return null
        val callId = intent?.getStringExtra("callId") ?: return null
        
        val data = Arguments.createMap().apply {
            putString("eventName", eventName)
            putString("callId", callId)
        }
        
        return HeadlessJsTaskConfig(
            "CallEvent",
            data,
            5000, // timeout in milliseconds
            true // allow task in foreground
        )
    }
}
