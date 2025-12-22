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
      val channelId = "aqualink_notifications"
      val channelName = "Aqualink Notifications"
      val channelDescription = "Notifications for Aqualink app"
      val importance = NotificationManager.IMPORTANCE_HIGH

      val channel = NotificationChannel(channelId, channelName, importance).apply {
        description = channelDescription
        enableVibration(true)
        vibrationPattern = longArrayOf(0, 250, 250, 250)

        // Set custom sound
        val soundUri = Uri.parse("android.resource://" + packageName + "/" + R.raw.notification)
        val audioAttributes = AudioAttributes.Builder()
          .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
          .setUsage(AudioAttributes.USAGE_NOTIFICATION)
          .build()
        setSound(soundUri, audioAttributes)
      }

      val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
      notificationManager.createNotificationChannel(channel)
    }
  }
}
