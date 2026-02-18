package com.aqualink.tindo;

import android.app.Activity;
import android.content.ContentResolver;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.provider.DocumentsContract;
import android.provider.OpenableColumns;
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
        intent.setType("*/*");
        intent.putExtra(Intent.EXTRA_MIME_TYPES, new String[] {
            "image/*",
            "video/*",
            "audio/*"
        });
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            intent.addFlags(Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);
        }
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
                    if (uri != null) {
                        try {
                            int flags = data.getFlags() & (Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
                                activity.getContentResolver().takePersistableUriPermission(uri, flags);
                            }
                        } catch (Exception ignored) {}

                        ContentResolver resolver = activity.getContentResolver();
                        String mimeType = resolver.getType(uri);
                        if (mimeType != null) {
                            result.putString("type", mimeType);
                        }

                        Cursor cursor = null;
                        try {
                            cursor = resolver.query(uri, null, null, null, null);
                            if (cursor != null && cursor.moveToFirst()) {
                                int nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME);
                                if (nameIndex >= 0) {
                                    String name = cursor.getString(nameIndex);
                                    if (name != null) {
                                        result.putString("name", name);
                                    }
                                }
                                int sizeIndex = cursor.getColumnIndex(OpenableColumns.SIZE);
                                if (sizeIndex >= 0 && !cursor.isNull(sizeIndex)) {
                                    result.putDouble("size", cursor.getDouble(sizeIndex));
                                }
                            }
                        } catch (Exception ignored) {
                        } finally {
                            if (cursor != null) {
                                cursor.close();
                            }
                        }
                    }
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
