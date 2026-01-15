$modulePath = Join-Path $PSScriptRoot "..\node_modules\react-native-document-picker\android\src\main\java\com\reactnativedocumentpicker\RNDocumentPickerModule.java"

$content = Get-Content $modulePath -Raw

# Replace imports
$content = $content -replace "import com.facebook.react.bridge.GuardedResultAsyncTask;", "import com.facebook.react.bridge.UiThreadUtil;"

# Replace ProcessDataTask class
$oldProcessDataTask = @"
  private static class ProcessDataTask extends GuardedResultAsyncTask<ReadableArray> {
    private final WeakReference<Context> weakContext;
    private final List<Uri> uris;
    private final String copyTo;
    private final Promise promise;

    protected ProcessDataTask\(ReactContext reactContext, List<Uri> uris, String copyTo, Promise promise\) {
      super\(reactContext.getExceptionHandler\(\)\);
      this.weakContext = new WeakReference<>\(reactContext.getApplicationContext\(\)\);
      this.uris = uris;
      this.copyTo = copyTo;
      this.promise = promise;
    }

    @Override
    protected ReadableArray doInBackgroundGuarded\(\) {
      WritableArray results = Arguments.createArray\(\);
      for \(Uri uri : uris\) {
        results.pushMap\(getMetadata\(uri\)\);
      }
      return results;
    }

    @Override
    protected void onPostExecuteGuarded\(ReadableArray readableArray\) {
      promise.resolve\(readableArray\);
    }
"@

$newProcessDataTask = @"
  private static class ProcessDataTask implements Runnable {
    private final WeakReference<Context> weakContext;
    private final List<Uri> uris;
    private final String copyTo;
    private final Promise promise;

    protected ProcessDataTask(ReactContext reactContext, List<Uri> uris, String copyTo, Promise promise) {
      this.weakContext = new WeakReference<>(reactContext.getApplicationContext());
      this.uris = uris;
      this.copyTo = copyTo;
      this.promise = promise;
    }

    private ReadableArray produceResults() {
      WritableArray results = Arguments.createArray();
      for (Uri uri : uris) {
        results.pushMap(getMetadata(uri));
      }
      return results;
    }

    @Override
    public void run() {
      final ReadableArray readableArray = produceResults();
      UiThreadUtil.runOnUiThread(() -> promise.resolve(readableArray));
    }
"@

$content = $content -replace [regex]::Escape($oldProcessDataTask), $newProcessDataTask

# Save the changes
$content | Set-Content $modulePath -NoNewline