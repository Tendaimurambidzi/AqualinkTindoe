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

      val general = NotificationChannel(
        "aqualink_notifications",
        "Aqualink Notifications",
        NotificationManager.IMPORTANCE_HIGH
      ).apply {
        description = "General notifications for Aqualink"
        enableVibration(true)
        vibrationPattern = longArrayOf(0, 250, 250, 250)
        val soundUri = Uri.parse("android.resource://" + packageName + "/" + R.raw.notification)
        val audioAttributes = AudioAttributes.Builder()
          .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
          .setUsage(AudioAttributes.USAGE_NOTIFICATION)
          .build()
        setSound(soundUri, audioAttributes)
      }

      val calls = NotificationChannel(
        "aqualink_calls_progress",
        "Aqualink Calls",
        NotificationManager.IMPORTANCE_HIGH
      ).apply {
        description = "Incoming call alerts"
        lockscreenVisibility = android.app.Notification.VISIBILITY_PUBLIC
        enableVibration(true)
        vibrationPattern = longArrayOf(0, 500, 300, 500, 300, 500)
        val soundUri = Uri.parse("android.resource://" + packageName + "/" + R.raw.call_progress)
        val audioAttributes = AudioAttributes.Builder()
          .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
          .setUsage(AudioAttributes.USAGE_NOTIFICATION_RINGTONE)
          .build()
        setSound(soundUri, audioAttributes)
      }

      notificationManager.createNotificationChannel(general)
      notificationManager.createNotificationChannel(calls)
    }
  }
}
