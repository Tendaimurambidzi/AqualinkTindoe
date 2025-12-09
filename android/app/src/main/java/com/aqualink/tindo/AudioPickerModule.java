package com.aqualink.tindo;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.DocumentsContract;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

public class AudioPickerModule extends ReactContextBaseJavaModule implements ActivityEventListener {
    private static final int AUDIO_PICKER_REQUEST = 9001;
    private Promise pickerPromise;

    public AudioPickerModule(ReactApplicationContext reactContext) {
        super(reactContext);
        reactContext.addActivityEventListener(this);
    }

    @NonNull
    @Override
    public String getName() {
        return "AudioPicker";
    }

    @ReactMethod
    public void pickAudio(Promise promise) {
        Activity activity = getCurrentActivity();
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "No activity found");
            return;
        }
        pickerPromise = promise;
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("audio/*");
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            intent.putExtra(DocumentsContract.EXTRA_INITIAL_URI, android.provider.MediaStore.Audio.Media.EXTERNAL_CONTENT_URI);
        }
        activity.startActivityForResult(intent, AUDIO_PICKER_REQUEST);
    }

    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, @Nullable Intent data) {
        if (requestCode == AUDIO_PICKER_REQUEST) {
            if (pickerPromise != null) {
                if (resultCode == Activity.RESULT_OK && data != null) {
                    Uri uri = data.getData();
                    WritableMap result = Arguments.createMap();
                    result.putString("uri", uri != null ? uri.toString() : null);
                    pickerPromise.resolve(result);
                } else {
                    pickerPromise.reject("CANCELLED", "Audio picking cancelled");
                }
                pickerPromise = null;
            }
        }
    }

    @Override
    public void onNewIntent(Intent intent) {}
}
