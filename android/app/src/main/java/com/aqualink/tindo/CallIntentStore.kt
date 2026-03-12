package com.aqualink.tindo

import android.content.Context
import android.content.Intent

object CallIntentStore {
    private const val PREF_NAME = "aqualink_call_intent_store_v1"
    private const val KEY_ACTION = "action"
    private const val KEY_CALL_ID = "callId"
    private const val KEY_CALLER_NAME = "callerName"
    private const val KEY_CALL_TYPE = "callType"

    data class Payload(
        val action: String,
        val callId: String,
        val callerName: String,
        val callType: String,
    )

    @Volatile
    private var inMemoryPayload: Payload? = null

    fun cacheFromIntent(context: Context?, intent: Intent?) {
        val payload = parseIntent(intent) ?: return
        inMemoryPayload = payload
        persist(context, payload)
    }

    fun get(context: Context?): Payload? {
        inMemoryPayload?.let { return it }
        val prefs = context?.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE) ?: return null
        val action = (prefs.getString(KEY_ACTION, "") ?: "").trim()
        val callId = (prefs.getString(KEY_CALL_ID, "") ?: "").trim()
        if (!isCallAction(action) || callId.isEmpty()) return null
        val payload = Payload(
            action = action,
            callId = callId,
            callerName = prefs.getString(KEY_CALLER_NAME, "") ?: "",
            callType = prefs.getString(KEY_CALL_TYPE, "audio") ?: "audio",
        )
        inMemoryPayload = payload
        return payload
    }

    fun clear(context: Context?) {
        inMemoryPayload = null
        val prefs = context?.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE) ?: return
        prefs.edit().clear().apply()
    }

    private fun parseIntent(intent: Intent?): Payload? {
        if (intent == null) return null
        val action = (intent.getStringExtra("action") ?: "").trim()
        val callId = (intent.getStringExtra("callId") ?: "").trim()
        if (!isCallAction(action) || callId.isEmpty()) return null
        return Payload(
            action = action,
            callId = callId,
            callerName = intent.getStringExtra("callerName") ?: "",
            callType = intent.getStringExtra("callType") ?: "audio",
        )
    }

    private fun isCallAction(action: String): Boolean {
        return action == "incoming_call" || action == "answer_call"
    }

    private fun persist(context: Context?, payload: Payload) {
        val prefs = context?.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE) ?: return
        prefs.edit()
            .putString(KEY_ACTION, payload.action)
            .putString(KEY_CALL_ID, payload.callId)
            .putString(KEY_CALLER_NAME, payload.callerName)
            .putString(KEY_CALL_TYPE, payload.callType)
            .apply()
    }
}

