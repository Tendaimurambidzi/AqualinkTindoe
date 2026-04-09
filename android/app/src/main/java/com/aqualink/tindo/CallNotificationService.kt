package com.aqualink.tindo

import android.app.*
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.RingtoneManager
import android.net.Uri
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import androidx.core.app.Person

class CallNotificationService : Service() {

    companion object {
        const val CHANNEL_ID = "aqualink_calls_lg_cat_ring_vibe"
        const val LEGACY_CHANNEL_ID = "aqualink_calls_lg_cat_ring"
        const val NOTIFICATION_ID = 1001
        const val ACTION_ANSWER = "com.aqualink.tindo.ANSWER_CALL"
        const val ACTION_DECLINE = "com.aqualink.tindo.DECLINE_CALL"
        
        fun startService(context: Context, callerName: String, callId: String, callType: String) {
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
        
        val notification = createCallNotification(callerName, callId, callType)
        startForeground(NOTIFICATION_ID, notification)
        
        return START_NOT_STICKY
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val soundUri = try {
                Uri.parse("android.resource://$packageName/${R.raw.lg_cat_ring_freetone_org}")
            } catch (_: Exception) {
                RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE)
            }
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
                setShowBadge(false)
                setSound(soundUri, audioAttributes)
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 1000, 500, 1000)
                lockscreenVisibility = Notification.VISIBILITY_PUBLIC
            }
            val legacyChannel = NotificationChannel(
                LEGACY_CHANNEL_ID,
                "Incoming Calls (Legacy)",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Notifications for incoming calls"
                setShowBadge(false)
                setSound(soundUri, audioAttributes)
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 1000, 500, 1000)
                lockscreenVisibility = Notification.VISIBILITY_PUBLIC
            }
            
            val notificationManager = getSystemService(NotificationManager::class.java)
            notificationManager.createNotificationChannel(channel)
            notificationManager.createNotificationChannel(legacyChannel)
        }
    }

    private fun createCallNotification(callerName: String, callId: String, callType: String): Notification {
        val fullScreenIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("callId", callId)
            putExtra("action", "incoming_call")
        }
        val fullScreenPendingIntent = PendingIntent.getActivity(
            this, callId.hashCode(), fullScreenIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val answerIntent = Intent(this, CallActionReceiver::class.java).apply {
            action = ACTION_ANSWER
            putExtra("callId", callId)
        }
        val answerPendingIntent = PendingIntent.getBroadcast(
            this, callId.hashCode() + 1, answerIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val declineIntent = Intent(this, CallActionReceiver::class.java).apply {
            action = ACTION_DECLINE
            putExtra("callId", callId)
        }
        val declinePendingIntent = PendingIntent.getBroadcast(
            this, callId.hashCode() + 2, declineIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val soundUri = try {
            Uri.parse("android.resource://$packageName/${R.raw.lg_cat_ring_freetone_org}")
        } catch (_: Exception) {
            RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE)
        }
        
        val callTypeText = if (callType == "video") "Video Call" else "Audio Call"
        val callerPerson = Person.Builder()
            .setName(callerName)
            .setImportant(true)
            .build()

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
            .setStyle(
                NotificationCompat.CallStyle.forIncomingCall(
                    callerPerson,
                    declinePendingIntent,
                    answerPendingIntent,
                )
            )

        return builder.build()
    }

    override fun onDestroy() {
        super.onDestroy()
        stopForeground(true)
    }
}
