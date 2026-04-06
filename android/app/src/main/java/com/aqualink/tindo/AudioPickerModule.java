package com.aqualink.tindo;

import android.app.Activity;
import android.content.ContentResolver;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.provider.DocumentsContract;
import android.provider.OpenableColumns;
import android.content.ActivityNotFoundException;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

public class AudioPickerModule extends ReactContextBaseJavaModule implements ActivityEventListener {
    private static final int AUDIO_PICKER_REQUEST = 9001;
    private static final int FILE_PICKER_REQUEST = 9002;
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
        launchPicker(promise, AUDIO_PICKER_REQUEST, false);
    }

    @ReactMethod
    public void pickFiles(Promise promise) {
        launchPicker(promise, FILE_PICKER_REQUEST, true);
    }

    private void launchPicker(Promise promise, int requestCode, boolean allowMultiple) {
        Activity activity = getCurrentActivity();
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "No activity found");
            return;
        }
        pickerPromise = promise;
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        if (requestCode == FILE_PICKER_REQUEST) {
            intent.setType("application/*");
            intent.putExtra(
                Intent.EXTRA_MIME_TYPES,
                new String[] {
                    "application/pdf",
                    "application/msword",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    "application/vnd.ms-powerpoint",
                    "application/vnd.openxmlformats-officedocument.presentationml.presentation"
                }
            );
        } else {
            intent.setType("audio/*");
        }
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2) {
            intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, allowMultiple);
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            intent.addFlags(Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);
            try {
                intent.putExtra(
                    DocumentsContract.EXTRA_INITIAL_URI,
                    android.provider.MediaStore.Files.getContentUri("external")
                );
            } catch (Exception ignored) {}
        }
        try {
            activity.startActivityForResult(
                Intent.createChooser(intent, requestCode == FILE_PICKER_REQUEST ? "Select file" : "Select audio"),
                requestCode
            );
        } catch (ActivityNotFoundException error) {
            pickerPromise = null;
            promise.reject("NO_PICKER", "No document picker is available on this device.");
        }
    }

    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, @Nullable Intent data) {
        if (requestCode == AUDIO_PICKER_REQUEST || requestCode == FILE_PICKER_REQUEST) {
            if (pickerPromise != null) {
                if (resultCode == Activity.RESULT_OK && data != null) {
                    if (requestCode == FILE_PICKER_REQUEST) {
                        WritableArray results = Arguments.createArray();
                        if (data.getClipData() != null) {
                            for (int i = 0; i < data.getClipData().getItemCount(); i++) {
                                Uri uri = data.getClipData().getItemAt(i).getUri();
                                results.pushMap(buildResult(activity, data, uri));
                            }
                        } else {
                            Uri uri = data.getData();
                            if (uri != null) {
                                results.pushMap(buildResult(activity, data, uri));
                            }
                        }
                        pickerPromise.resolve(results);
                    } else {
                        Uri uri = data.getData();
                        pickerPromise.resolve(buildResult(activity, data, uri));
                    }
                } else {
                    pickerPromise.reject("CANCELLED", "Audio picking cancelled");
                }
                pickerPromise = null;
            }
        }
    }

    private WritableMap buildResult(Activity activity, Intent data, @Nullable Uri uri) {
        WritableMap result = Arguments.createMap();
        result.putString("uri", uri != null ? uri.toString() : null);
        if (uri == null) {
            return result;
        }
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

        String displayName = null;
        Double sizeValue = null;

        Cursor cursor = null;
        try {
            cursor = resolver.query(uri, null, null, null, null);
            if (cursor != null && cursor.moveToFirst()) {
                int nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME);
                if (nameIndex >= 0) {
                    String name = cursor.getString(nameIndex);
                    if (name != null) {
                        displayName = name;
                        result.putString("name", name);
                    }
                }
                int sizeIndex = cursor.getColumnIndex(OpenableColumns.SIZE);
                if (sizeIndex >= 0 && !cursor.isNull(sizeIndex)) {
                    sizeValue = cursor.getDouble(sizeIndex);
                    result.putDouble("size", sizeValue);
                }
            }
        } catch (Exception ignored) {
        } finally {
            if (cursor != null) {
                cursor.close();
            }
        }
        String localPath = cacheDocumentLocally(activity, uri, displayName, mimeType);
        if (localPath != null) {
            result.putString("filePath", localPath);
            result.putString("fileCopyUri", "file://" + localPath);
        }
        return result;
    }

    @Nullable
    private String cacheDocumentLocally(Activity activity, Uri uri, @Nullable String fileName, @Nullable String mimeType) {
        InputStream inputStream = null;
        FileOutputStream outputStream = null;
        try {
            String safeName = sanitizeFileName(fileName, mimeType);
            File cacheFile = new File(activity.getCacheDir(), "picked_" + System.currentTimeMillis() + "_" + safeName);
            inputStream = activity.getContentResolver().openInputStream(uri);
            if (inputStream == null) {
                return null;
            }
            outputStream = new FileOutputStream(cacheFile);
            byte[] buffer = new byte[64 * 1024];
            int bytesRead;
            while ((bytesRead = inputStream.read(buffer)) != -1) {
                outputStream.write(buffer, 0, bytesRead);
            }
            outputStream.flush();
            return cacheFile.getAbsolutePath();
        } catch (Exception ignored) {
            return null;
        } finally {
            try {
                if (inputStream != null) {
                    inputStream.close();
                }
            } catch (Exception ignored) {}
            try {
                if (outputStream != null) {
                    outputStream.close();
                }
            } catch (Exception ignored) {}
        }
    }

    @NonNull
    private String sanitizeFileName(@Nullable String fileName, @Nullable String mimeType) {
        String fallback = "shared_file";
        String safe = fileName != null ? fileName.replaceAll("[^A-Za-z0-9._-]", "_") : fallback;
        if (safe.isEmpty()) {
            safe = fallback;
        }
        if (!safe.contains(".") && mimeType != null) {
            if ("application/pdf".equalsIgnoreCase(mimeType)) {
                safe += ".pdf";
            } else if ("application/vnd.openxmlformats-officedocument.presentationml.presentation".equalsIgnoreCase(mimeType)) {
                safe += ".pptx";
            } else if ("application/vnd.ms-powerpoint".equalsIgnoreCase(mimeType)) {
                safe += ".ppt";
            } else if ("application/vnd.openxmlformats-officedocument.wordprocessingml.document".equalsIgnoreCase(mimeType)) {
                safe += ".docx";
            } else if ("application/msword".equalsIgnoreCase(mimeType)) {
                safe += ".doc";
            }
        }
        return safe;
    }

    @Override
    public void onNewIntent(Intent intent) {}
}
