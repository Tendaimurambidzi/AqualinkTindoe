package com.aqualink.tindo

import android.app.*
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.RingtoneManager
import android.net.Uri
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.Person

class CallNotificationService : Service() {
    companion object {
        private const val TAG = "CallNotificationSvc"
        const val CHANNEL_ID = "aqualink_calls_default_ringtone_v3"
        const val NOTIFICATION_ID = 1001
        const val ACTION_ANSWER = "com.aqualink.tindo.ANSWER_CALL"
        const val ACTION_DECLINE = "com.aqualink.tindo.DECLINE_CALL"

        fun startService(context: Context, callerName: String, callId: String, callType: String) {
            Log.i(TAG, "startService callId=$callId caller=$callerName type=$callType")
            val intent = Intent(context, CallNotificationService::class.java).apply {
                putExtra("callerName", callerName)
                putExtra("callId", callId)
                putExtra("callType", callType)
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }
        
        fun stopService(context: Context) {
            try {
                val nm = context.getSystemService(NotificationManager::class.java)
                nm?.cancel(NOTIFICATION_ID)
            } catch (_: Exception) {}
            val intent = Intent(context, CallNotificationService::class.java)
            context.stopService(intent)
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val callerName = intent?.getStringExtra("callerName") ?: "Unknown"
        val callId = intent?.getStringExtra("callId") ?: ""
        val callType = intent?.getStringExtra("callType") ?: "audio"
        Log.i(TAG, "onStartCommand callId=$callId caller=$callerName type=$callType")
        try {
            val seedIntent = Intent().apply {
                putExtra("action", "incoming_call")
                putExtra("callId", callId)
                putExtra("callerName", callerName)
                putExtra("callType", callType)
            }
            CallIntentStore.cacheFromIntent(this, seedIntent)
        } catch (_: Exception) {}
        
        val notification = createCallNotification(callerName, callId, callType)
        startForeground(NOTIFICATION_ID, notification)
        launchIncomingCallActivity(callerName, callId, callType)
        
        return START_NOT_STICKY
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val soundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE)
            val audioAttributes = AudioAttributes.Builder()
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .setUsage(AudioAttributes.USAGE_NOTIFICATION_RINGTONE)
                .build()
            
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Incoming Calls",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Notifications for incoming calls"
                setSound(soundUri, audioAttributes)
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 1000, 500, 1000)
                lockscreenVisibility = Notification.VISIBILITY_PUBLIC
                setShowBadge(true)
                try {
                    setBypassDnd(true)
                } catch (_: Exception) {}
            }
            
            val notificationManager = getSystemService(NotificationManager::class.java)
            notificationManager.createNotificationChannel(channel)
        }
    }

    private fun createCallNotification(callerName: String, callId: String, callType: String): Notification {
        val fullScreenIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("callId", callId)
            putExtra("action", "incoming_call")
            putExtra("callerName", callerName)
            putExtra("callType", callType)
        }
        val reqCode = callId.hashCode()
        val fullScreenPendingIntent = PendingIntent.getActivity(
            this, reqCode, fullScreenIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val answerIntent = Intent(this, CallActionReceiver::class.java).apply {
            action = ACTION_ANSWER
            putExtra("callId", callId)
            putExtra("callerName", callerName)
            putExtra("callType", callType)
        }
        val answerPendingIntent = PendingIntent.getBroadcast(
            this, reqCode + 1, answerIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val declineIntent = Intent(this, CallActionReceiver::class.java).apply {
            action = ACTION_DECLINE
            putExtra("callId", callId)
        }
        val declinePendingIntent = PendingIntent.getBroadcast(
            this, reqCode + 2, declineIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val soundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE)
        
        val callTypeText = if (callType == "video") "Video Call" else "Audio Call"
        val builder = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_menu_call)
            .setContentTitle("Incoming $callTypeText")
            .setContentText("$callerName is calling...")
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_CALL)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setFullScreenIntent(fullScreenPendingIntent, true)
            .setContentIntent(fullScreenPendingIntent)
            .setOngoing(true)
            .setAutoCancel(false)
            .setSound(soundUri)
            .setVibrate(longArrayOf(0, 1000, 500, 1000))
            .addAction(android.R.drawable.ic_menu_call, "Answer", answerPendingIntent)
            .addAction(android.R.drawable.ic_menu_close_clear_cancel, "Decline", declinePendingIntent)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val person = Person.Builder()
                .setName(callerName)
                .build()
            builder.setStyle(
                NotificationCompat.CallStyle.forIncomingCall(
                    person,
                    declinePendingIntent,
                    answerPendingIntent,
                ),
            )
            builder.setForegroundServiceBehavior(NotificationCompat.FOREGROUND_SERVICE_IMMEDIATE)
        }

        return builder.build()
    }

    private fun launchIncomingCallActivity(callerName: String, callId: String, callType: String) {
        if (callId.isBlank()) return
        try {
            Log.i(TAG, "launchIncomingCallActivity callId=$callId")
            val launchIntent = Intent(this, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or 
                        Intent.FLAG_ACTIVITY_CLEAR_TOP or
                        Intent.FLAG_ACTIVITY_SINGLE_TOP or
                        Intent.FLAG_ACTIVITY_NO_USER_ACTION
                putExtra("callId", callId)
                putExtra("action", "incoming_call")
                putExtra("callerName", callerName)
                putExtra("callType", callType)
            }
            CallIntentStore.cacheFromIntent(this, launchIntent)
            startActivity(launchIntent)
        } catch (e: Exception) {
            Log.e(TAG, "launchIncomingCallActivity failed", e)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        try {
            val nm = getSystemService(NotificationManager::class.java)
            nm?.cancel(NOTIFICATION_ID)
        } catch (_: Exception) {}
        stopForeground(true)
    }
}
