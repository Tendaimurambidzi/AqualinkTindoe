package com.milletgi

import android.content.ContentValues
import android.content.Context
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import java.io.File
import java.io.FileWriter
import java.io.OutputStreamWriter
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

object ExportUtils {
    fun exportToCsv(context: Context, samples: List<Sample>): String {
        val timestamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(Date())
        val fileName = "milletgi_$timestamp.csv"
        val csvHeader =
            "id,sample_id,variety_name,batch_id,replicate,date_measured,moisture,protein,fat,ash,fiber,carbohydrate,phytate,tannins,oxalate,other_antinutrients,total_phenolics,flavonoids,other_bioactives,iron,zinc,calcium,magnesium,other_minerals,processing_method,notes,gi_measured,gi_predicted,model_version\n"

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val values = ContentValues().apply {
                put(MediaStore.Downloads.DISPLAY_NAME, fileName)
                put(MediaStore.Downloads.MIME_TYPE, "text/csv")
                put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/MilletGI")
            }
            val resolver = context.contentResolver
            val uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values)
            if (uri != null) {
                resolver.openOutputStream(uri)?.use { out ->
                    OutputStreamWriter(out).use { writer ->
                        writer.append(csvHeader)
                        samples.forEach { s -> writer.append(rowForSample(s)).append("\n") }
                    }
                }
                return "Downloads/MilletGI/$fileName"
            }
        }

        // Fallback (older Android or insert failure): app-private external directory.
        val exportDir = File(context.getExternalFilesDir(null), "exports")
        if (!exportDir.exists()) exportDir.mkdirs()
        val file = File(exportDir, fileName)
        FileWriter(file).use { writer ->
            writer.append(csvHeader)
            samples.forEach { s -> writer.append(rowForSample(s)).append("\n") }
        }
        return file.absolutePath
    }

    private fun rowForSample(s: Sample): String {
        return listOf(
            s.id,
            s.sampleId,
            s.varietyName,
            s.batchId,
            s.replicate,
            s.dateMeasured,
            s.moisture,
            s.protein,
            s.fat,
            s.ash,
            s.fiber,
            s.carbohydrate,
            s.phytate,
            s.tannins,
            s.oxalate,
            s.otherAntinutrients,
            s.totalPhenolics,
            s.flavonoids,
            s.otherBioactives,
            s.iron,
            s.zinc,
            s.calcium,
            s.magnesium,
            s.otherMinerals,
            s.processingMethod,
            s.notes,
            s.giMeasured,
            s.giPredicted,
            s.modelVersion
        ).joinToString(",") { escapeCsv(it) }
    }

    private fun escapeCsv(value: Any?): String {
        val text = value?.toString() ?: ""
        val needsQuotes = text.contains(",") || text.contains("\"") || text.contains("\n") || text.contains("\r")
        val escaped = text.replace("\"", "\"\"")
        return if (needsQuotes) "\"$escaped\"" else escaped
    }
}
