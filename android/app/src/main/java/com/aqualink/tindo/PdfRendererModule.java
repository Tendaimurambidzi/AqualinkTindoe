package com.aqualink.tindo;

import android.graphics.Bitmap;
import android.graphics.pdf.PdfRenderer;
import android.net.Uri;
import android.os.ParcelFileDescriptor;
import androidx.annotation.NonNull;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

public class PdfRendererModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;

    public PdfRendererModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return "PdfRenderer";
    }

    @ReactMethod
    public void getPageCount(String localPath, Promise promise) {
        try (PdfRenderer renderer = openRenderer(localPath)) {
            WritableMap result = Arguments.createMap();
            result.putInt("pageCount", renderer.getPageCount());
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("PDF_PAGE_COUNT_FAILED", e);
        }
    }

    @ReactMethod
    public void renderPage(String localPath, int pageIndex, int targetWidth, Promise promise) {
        try (PdfRenderer renderer = openRenderer(localPath)) {
            if (pageIndex < 0 || pageIndex >= renderer.getPageCount()) {
                promise.reject("PDF_PAGE_OUT_OF_RANGE", "Requested PDF page is out of range");
                return;
            }
            try (PdfRenderer.Page page = renderer.openPage(pageIndex)) {
                int safeWidth = targetWidth > 0 ? targetWidth : 1400;
                float scale = safeWidth / (float) page.getWidth();
                int bitmapWidth = Math.max(1, Math.round(page.getWidth() * scale));
                int bitmapHeight = Math.max(1, Math.round(page.getHeight() * scale));
                Bitmap bitmap = Bitmap.createBitmap(bitmapWidth, bitmapHeight, Bitmap.Config.ARGB_8888);
                bitmap.eraseColor(0xFFFFFFFF);
                page.render(bitmap, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY);

                File dir = new File(reactContext.getCacheDir(), "pdf_previews");
                if (!dir.exists() && !dir.mkdirs()) {
                    throw new IOException("Could not create pdf preview cache");
                }
                String key = String.valueOf(Math.abs(localPath.hashCode()));
                File imageFile = new File(dir, key + "_page_" + pageIndex + ".png");
                FileOutputStream outputStream = new FileOutputStream(imageFile, false);
                try {
                    bitmap.compress(Bitmap.CompressFormat.PNG, 100, outputStream);
                    outputStream.flush();
                } finally {
                    outputStream.close();
                    bitmap.recycle();
                }

                WritableMap result = Arguments.createMap();
                result.putString("uri", Uri.fromFile(imageFile).toString());
                result.putInt("pageCount", renderer.getPageCount());
                result.putInt("pageIndex", pageIndex);
                result.putInt("width", bitmapWidth);
                result.putInt("height", bitmapHeight);
                promise.resolve(result);
            }
        } catch (Exception e) {
            promise.reject("PDF_RENDER_FAILED", e);
        }
    }

    private PdfRenderer openRenderer(String localPath) throws IOException {
        String normalized = localPath == null ? "" : localPath.trim();
        if (normalized.startsWith("file://")) {
            normalized = Uri.parse(normalized).getPath();
        }
        if (normalized.isEmpty()) {
            throw new IOException("Empty PDF path");
        }
        File file = new File(normalized);
        if (!file.exists()) {
            throw new IOException("PDF file not found");
        }
        ParcelFileDescriptor descriptor = ParcelFileDescriptor.open(file, ParcelFileDescriptor.MODE_READ_ONLY);
        return new PdfRenderer(descriptor);
    }
}
