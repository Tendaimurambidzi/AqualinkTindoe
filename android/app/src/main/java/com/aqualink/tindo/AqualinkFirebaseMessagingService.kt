package com.aqualink.tindo

import android.app.ActivityManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.RemoteMessage
import io.invertase.firebase.messaging.ReactNativeFirebaseMessagingService
import java.util.Locale

class AqualinkFirebaseMessagingService : ReactNativeFirebaseMessagingService() {
    companion object {
        private const val TAG = "AqualinkFCM"
        private const val DEFAULT_CHANNEL_ID = "aqualink_notifications_v2"
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)

        val data = remoteMessage.data
        Log.i(TAG, "onMessageReceived data=$data notification=${remoteMessage.notification != null}")
        val type = (data["type"] ?: "")
            .trim()
            .lowercase(Locale.ROOT)
        val fullScreenCall = (data["fullScreenCall"] ?: "0").trim() == "1"
        val isIncomingCall =
            type == "call_invite" || type == "incoming_call" || fullScreenCall
        if (!isIncomingCall) {
            if (!isAppInForeground()) {
                showBackgroundNotification(remoteMessage)
            } else {
                Log.i(TAG, "App in foreground; skipping native background notification")
            }
            return
        }

        val callId = (data["callId"] ?: "").trim()
        if (callId.isEmpty()) {
            Log.w(TAG, "Incoming call message missing callId")
            return
        }

        val callType = when ((data["callType"] ?: "audio").trim().lowercase(Locale.ROOT)) {
            "video" -> "video"
            else -> "audio"
        }
        val callerName = sequenceOf(
            data["callerName"],
            data["fromName"],
            data["actorName"],
            remoteMessage.getNotification()?.title,
            "Someone",
        ).map { (it ?: "").trim() }
            .firstOrNull { it.isNotEmpty() } ?: "Someone"

        Log.i(TAG, "Starting CallNotificationService callId=$callId caller=$callerName type=$callType")
        CallNotificationService.startService(this, callerName, callId, callType)
    }

    private fun isAppInForeground(): Boolean {
        return try {
            val manager = getSystemService(Context.ACTIVITY_SERVICE) as? ActivityManager ?: return false
            val running = manager.runningAppProcesses ?: return false
            running.any {
                it.processName == packageName &&
                    it.importance == ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND
            }
        } catch (_: Exception) {
            false
        }
    }

    private fun showBackgroundNotification(remoteMessage: RemoteMessage) {
        try {
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager ?: return
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val existing = manager.getNotificationChannel(DEFAULT_CHANNEL_ID)
                if (existing == null) {
                    val channel = NotificationChannel(
                        DEFAULT_CHANNEL_ID,
                        "Aqualink Alerts",
                        NotificationManager.IMPORTANCE_HIGH,
                    ).apply {
                        description = "General notifications for Aqualink"
                        setShowBadge(true)
                    }
                    manager.createNotificationChannel(channel)
                }
            }

            val data = remoteMessage.data
            val type = (data["type"] ?: "notification").trim().lowercase(Locale.ROOT)
            val title = when (type) {
                "echo" -> "New Echo"
                "splash" -> "New Splash"
                "hug" -> "New Hug"
                else -> data["title"]?.trim().takeUnless { it.isNullOrEmpty() } ?: "Aqualink"
            }
            val body = data["text"]?.trim().takeUnless { it.isNullOrEmpty() }
                ?: remoteMessage.notification?.body
                ?: "You have a new notification"
            val number = data["unreadCount"]?.toIntOrNull() ?: data["badgeCount"]?.toIntOrNull() ?: 1
            val waveId = (data["waveId"] ?: "").trim()

            val launchIntent = Intent(this, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                putExtra("type", type)
                putExtra("waveId", waveId)
            }
            val requestCode = ((System.currentTimeMillis() % Int.MAX_VALUE).toInt())
            val contentIntent = PendingIntent.getActivity(
                this,
                requestCode,
                launchIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )

            val notification = NotificationCompat.Builder(this, DEFAULT_CHANNEL_ID)
                .setSmallIcon(android.R.drawable.ic_dialog_info)
                .setContentTitle(title)
                .setContentText(body)
                .setStyle(NotificationCompat.BigTextStyle().bigText(body))
                .setAutoCancel(true)
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_SOCIAL)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setDefaults(NotificationCompat.DEFAULT_ALL)
                .setNumber(number)
                .setContentIntent(contentIntent)
                .build()

            manager.notify(requestCode, notification)
            Log.i(TAG, "Posted background notification id=$requestCode type=$type number=$number")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to post background notification", e)
        }
    }
}
