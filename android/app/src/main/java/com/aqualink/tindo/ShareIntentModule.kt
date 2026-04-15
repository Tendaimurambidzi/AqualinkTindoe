package com.aqualink.tindo

import android.content.Intent
import android.net.Uri
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.lang.ref.WeakReference

class ShareIntentModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "ShareIntentModule"

  @ReactMethod
  fun getPendingSharePayload(promise: Promise) {
    promise.resolve(pendingPayload)
  }

  @ReactMethod
  fun clearPendingSharePayload() {
    pendingPayload = null
  }

  @ReactMethod
  fun addListener(eventName: String) {
  }

  @ReactMethod
  fun removeListeners(count: Double) {
  }

  companion object {
    private var pendingPayload: WritableMap? = null
    private var reactContextRef: WeakReference<ReactApplicationContext>? = null

    fun registerReactContext(context: ReactApplicationContext) {
      reactContextRef = WeakReference(context)
    }

    fun handleIntent(intent: Intent?) {
      val context = reactContextRef?.get()
      val payload = buildPayload(intent, context) ?: return
      pendingPayload = payload
      context
        ?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
        ?.emit("ShareIntentReceived", payload)
    }

    private fun buildPayload(intent: Intent?, context: ReactApplicationContext?): WritableMap? {
      if (intent == null) return null
      val action = intent.action ?: return null
      if (action != Intent.ACTION_SEND && action != Intent.ACTION_SEND_MULTIPLE) {
        return null
      }

      val text = intent.getStringExtra(Intent.EXTRA_TEXT)?.trim().orEmpty()
      val subject = intent.getStringExtra(Intent.EXTRA_SUBJECT)?.trim().orEmpty()
      val overallMimeType = intent.type?.trim().orEmpty()
      val files: WritableArray = Arguments.createArray()

      fun pushUri(uri: Uri?) {
        if (uri == null) return
        val file = Arguments.createMap().apply {
          putString("uri", uri.toString())
          putString("fileName", uri.lastPathSegment ?: "shared_file")
          putString(
            "mimeType",
            context?.contentResolver?.getType(uri)?.trim().takeUnless { it.isNullOrBlank() }
              ?: overallMimeType.ifBlank { null },
          )
        }
        files.pushMap(file)
      }

      if (action == Intent.ACTION_SEND) {
        @Suppress("DEPRECATION")
        pushUri(intent.getParcelableExtra(Intent.EXTRA_STREAM))
      } else {
        @Suppress("DEPRECATION")
        val streams = intent.getParcelableArrayListExtra<Uri>(Intent.EXTRA_STREAM)
        streams?.forEach { pushUri(it) }
      }

      if (text.isBlank() && subject.isBlank() && files.size() == 0) {
        return null
      }

      return Arguments.createMap().apply {
        putString("action", action)
        putString("text", text.ifBlank { null })
        putString("subject", subject.ifBlank { null })
        putString("mimeType", overallMimeType.ifBlank { null })
        putArray("files", files)
      }
    }
  }
}
