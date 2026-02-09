package com.milletgi

import android.content.Context
import java.io.File
import java.io.FileWriter
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

object ExportUtils {
    fun exportToCsv(context: Context, samples: List<Sample>): File {
        val exportDir = File(context.getExternalFilesDir(null), "exports")
        if (!exportDir.exists()) exportDir.mkdirs()

        val timestamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(Date())
        val file = File(exportDir, "milletgi_$timestamp.csv")

        FileWriter(file).use { writer ->
            writer.append(
                "id,sample_id,variety_name,batch_id,replicate,date_measured,moisture,protein,fat,ash,fiber,carbohydrate,phytate,tannins,oxalate,other_antinutrients,total_phenolics,flavonoids,other_bioactives,iron,zinc,calcium,magnesium,other_minerals,processing_method,notes,gi_measured,gi_predicted,model_version\n"
            )
            samples.forEach { s ->
                val row = listOf(
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
                writer.append(row)
                writer.append("\n")
            }
        }

        return file
    }

    private fun escapeCsv(value: Any?): String {
        val text = value?.toString() ?: ""
        val needsQuotes = text.contains(",") || text.contains("\"") || text.contains("\n") || text.contains("\r")
        val escaped = text.replace("\"", "\"\"")
        return if (needsQuotes) "\"$escaped\"" else escaped
    }
}
