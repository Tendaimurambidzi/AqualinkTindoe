package com.aqualink.tindo

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.media.AudioAttributes
import android.net.Uri
import android.os.Build
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // add(MyReactNativePackage())
          add(AudioPickerPackage())
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
    createNotificationChannel()
  }

  private fun createNotificationChannel() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

      val toneToRaw = linkedMapOf(
        "default_notification" to "notification",
        "notification" to "notification",
        "lg_cat_ring" to "lg_cat_ring_freetone_org",
        "call_progress" to "call_progress",
        "falcon" to "falcon",
        "downfall" to "downfall_3_208028",
        "underwater_explosion" to "large_underwater_explosion_190270",
        "sci_fi_hum" to "sci_fi_sound_effect_designed_circuits_hum_10_200831",
        // Old ring asset is not currently bundled into Android raw resources.
        "old_ring" to "notification",
        "none" to null,
      )

      fun resolveRawId(rawName: String?): Int {
        if (rawName.isNullOrBlank()) return 0
        return resources.getIdentifier(rawName, "raw", packageName)
      }

      fun createNotificationToneChannel(
        id: String,
        title: String,
        rawName: String?,
        callStyle: Boolean,
      ) {
        val channel = NotificationChannel(
          id,
          title,
          NotificationManager.IMPORTANCE_HIGH,
        ).apply {
          description = if (callStyle) {
            "Incoming call alerts"
          } else {
            "General notifications for Aqualink"
          }
          lockscreenVisibility = android.app.Notification.VISIBILITY_PUBLIC
          enableLights(true)
          val vibration = if (callStyle) {
            longArrayOf(0, 500, 300, 500, 300, 500)
          } else {
            longArrayOf(0, 250, 250, 250)
          }
          if (rawName == null) {
            enableVibration(false)
            vibrationPattern = longArrayOf(0L)
            setSound(null, null)
          } else {
            enableVibration(true)
            vibrationPattern = vibration
            val rawId = resolveRawId(rawName)
            if (rawId != 0) {
              val soundUri = Uri.parse("android.resource://$packageName/$rawId")
              val audioAttributes = AudioAttributes.Builder()
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .setUsage(
                  if (callStyle) {
                    AudioAttributes.USAGE_NOTIFICATION_RINGTONE
                  } else {
                    AudioAttributes.USAGE_NOTIFICATION
                  },
                )
                .build()
              setSound(soundUri, audioAttributes)
            } else {
              setSound(null, null)
            }
          }
        }
        notificationManager.createNotificationChannel(channel)
      }

      // Backward-compatible default channels.
      createNotificationToneChannel(
        "aqualink_notifications",
        "Aqualink Notifications",
        "notification",
        false,
      )
      createNotificationToneChannel(
        "aqualink_calls_progress",
        "Aqualink Calls",
        "lg_cat_ring_freetone_org",
        true,
      )

      // Tone-specific channels for server-selected background sounds.
      toneToRaw.forEach { (toneId, rawName) ->
        createNotificationToneChannel(
          "aqualink_notifications_$toneId",
          "Aqualink Notifications ($toneId)",
          rawName,
          false,
        )
        createNotificationToneChannel(
          "aqualink_calls_$toneId",
          "Aqualink Calls ($toneId)",
          rawName,
          true,
        )
      }
    }
  }
}
