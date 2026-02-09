package com.milletgi

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.Toast
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.app.AlertDialog
import com.milletgi.BuildConfig

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        seedMockDataIfNeeded()
        ModelManager.ensureFakeModelInstalled(this)

        findViewById<TextView>(R.id.textVersion).text = "Version ${BuildConfig.VERSION_NAME}"

        findViewById<Button>(R.id.btnNewSample).setOnClickListener {
            startActivity(Intent(this, NewSampleActivity::class.java))
        }

        findViewById<Button>(R.id.btnAllSamples).setOnClickListener {
            startActivity(Intent(this, SampleListActivity::class.java))
        }

        findViewById<Button>(R.id.btnExport).setOnClickListener {
            val db = DBHelper(this)
            val samples = db.getAllSamples()
            if (samples.isEmpty()) {
                Toast.makeText(this, "No samples to export", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            val location = ExportUtils.exportToCsv(this, samples)
            Toast.makeText(this, "Exported: $location", Toast.LENGTH_LONG).show()
        }

        findViewById<Button>(R.id.btnClearData).setOnClickListener {
            AlertDialog.Builder(this)
                .setTitle("Clear all data")
                .setMessage("This will delete all samples. Continue?")
                .setPositiveButton("Clear") { _, _ ->
                    val db = DBHelper(this)
                    db.clearAllSamples()
                    val prefs = getSharedPreferences("milletgi_prefs", MODE_PRIVATE)
                    prefs.edit().putBoolean("mock_seeded", true).apply()
                    Toast.makeText(this, "All data cleared", Toast.LENGTH_SHORT).show()
                }
                .setNegativeButton("Cancel", null)
                .show()
        }

        findViewById<Button>(R.id.btnModelStatus).setOnClickListener {
            val installed = ModelManager.isModelInstalled(this)
            val msg = if (installed) {
                "Model installed: ${ModelManager.modelFile(this).name}"
            } else {
                "No model installed"
            }
            Toast.makeText(this, msg, Toast.LENGTH_LONG).show()
        }
    }

    private fun seedMockDataIfNeeded() {
        val prefs = getSharedPreferences("milletgi_prefs", MODE_PRIVATE)
        if (prefs.getBoolean("mock_seeded", false)) return

        val db = DBHelper(this)
        val now = "2026-02-09"

        val samples = listOf(
            Sample(
                sampleId = "MOCK-001",
                varietyName = "Finger Millet A",
                batchId = "BATCH-1",
                replicate = 1,
                dateMeasured = now,
                moisture = 9.8,
                protein = 7.5,
                fat = 1.3,
                ash = 2.6,
                fiber = 3.9,
                carbohydrate = 74.9,
                phytate = 0.52,
                tannins = 0.21,
                oxalate = 0.12,
                otherAntinutrients = "",
                totalPhenolics = 1.8,
                flavonoids = 0.44,
                otherBioactives = "",
                iron = 3.4,
                zinc = 1.9,
                calcium = 310.0,
                magnesium = 120.0,
                otherMinerals = "",
                processingMethod = "milled",
                notes = "mock sample",
                giMeasured = 52.0,
                giPredicted = null,
                modelVersion = null
            ),
            Sample(
                sampleId = "MOCK-002",
                varietyName = "Finger Millet B",
                batchId = "BATCH-1",
                replicate = 2,
                dateMeasured = now,
                moisture = 10.2,
                protein = 8.1,
                fat = 1.6,
                ash = 2.4,
                fiber = 4.2,
                carbohydrate = 73.5,
                phytate = 0.60,
                tannins = 0.18,
                oxalate = 0.15,
                otherAntinutrients = "",
                totalPhenolics = 2.1,
                flavonoids = 0.50,
                otherBioactives = "",
                iron = 3.1,
                zinc = 2.0,
                calcium = 280.0,
                magnesium = 110.0,
                otherMinerals = "",
                processingMethod = "cooked",
                notes = "mock sample",
                giMeasured = 55.0,
                giPredicted = null,
                modelVersion = null
            ),
            Sample(
                sampleId = "MOCK-003",
                varietyName = "Finger Millet C",
                batchId = "BATCH-2",
                replicate = 3,
                dateMeasured = now,
                moisture = 9.4,
                protein = 7.9,
                fat = 1.4,
                ash = 2.7,
                fiber = 4.0,
                carbohydrate = 74.6,
                phytate = 0.48,
                tannins = 0.25,
                oxalate = 0.10,
                otherAntinutrients = "",
                totalPhenolics = 1.9,
                flavonoids = 0.47,
                otherBioactives = "",
                iron = 3.6,
                zinc = 1.8,
                calcium = 295.0,
                magnesium = 115.0,
                otherMinerals = "",
                processingMethod = "fermented",
                notes = "mock sample",
                giMeasured = 49.0,
                giPredicted = null,
                modelVersion = null
            )
        )

        samples.forEach { db.insertSample(it) }
        prefs.edit().putBoolean("mock_seeded", true).apply()
    }
}
