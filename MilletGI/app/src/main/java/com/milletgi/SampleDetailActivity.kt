package com.milletgi

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity

class SampleDetailActivity : AppCompatActivity() {

    private var sampleId: Long = 0

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_sample_detail)

        val detailText = findViewById<TextView>(R.id.textDetail)
        val btnEdit = findViewById<Button>(R.id.btnEdit)
        val btnDelete = findViewById<Button>(R.id.btnDelete)
        val btnPredict = findViewById<Button>(R.id.btnPredict)

        sampleId = intent.getLongExtra("sample_id", 0)
        val db = DBHelper(this)
        val sample = db.getSample(sampleId)

        if (sample == null) {
            Toast.makeText(this, "Sample not found", Toast.LENGTH_SHORT).show()
            finish()
            return
        }

        detailText.text = buildDetailText(sample)

        btnEdit.setOnClickListener {
            val intent = Intent(this, NewSampleActivity::class.java)
            intent.putExtra("sample_id", sampleId)
            startActivity(intent)
        }

        btnDelete.setOnClickListener {
            AlertDialog.Builder(this)
                .setTitle("Delete sample")
                .setMessage("Are you sure you want to delete this sample?")
                .setPositiveButton("Delete") { _, _ ->
                    db.deleteSample(sampleId)
                    Toast.makeText(this, "Deleted", Toast.LENGTH_SHORT).show()
                    finish()
                }
                .setNegativeButton("Cancel", null)
                .show()
        }

        btnPredict.setOnClickListener {
            if (ModelManager.isModelInstalled(this)) {
                val predicted = FakeModel.predict(sample)
                val updated = sample.copy(giPredicted = predicted, modelVersion = "FAKE_MODEL_v1")
                db.updateSample(updated)
                detailText.text = buildDetailText(updated)
                Toast.makeText(this, "Predicted GI: ${"%.1f".format(predicted)}", Toast.LENGTH_SHORT).show()
            } else {
                Toast.makeText(this, "Model not installed yet", Toast.LENGTH_SHORT).show()
            }
        }
    }

    override fun onResume() {
        super.onResume()
        val db = DBHelper(this)
        val sample = db.getSample(sampleId) ?: return
        findViewById<TextView>(R.id.textDetail).text = buildDetailText(sample)
    }

    private fun buildDetailText(s: Sample): String {
        fun line(label: String, value: Any?): String {
            return "$label: ${value ?: ""}"
        }

        return listOf(
            line("Sample ID", s.sampleId),
            line("Variety", s.varietyName),
            line("Batch", s.batchId),
            line("Replicate", s.replicate),
            line("Date", s.dateMeasured),
            "",
            line("Moisture", s.moisture),
            line("Protein", s.protein),
            line("Fat", s.fat),
            line("Ash", s.ash),
            line("Fiber", s.fiber),
            line("Carbohydrate", s.carbohydrate),
            "",
            line("Phytate", s.phytate),
            line("Tannins", s.tannins),
            line("Oxalate", s.oxalate),
            line("Other Antinutrients", s.otherAntinutrients),
            "",
            line("Total Phenolics", s.totalPhenolics),
            line("Flavonoids", s.flavonoids),
            line("Other Bioactives", s.otherBioactives),
            "",
            line("Iron", s.iron),
            line("Zinc", s.zinc),
            line("Calcium", s.calcium),
            line("Magnesium", s.magnesium),
            line("Other Minerals", s.otherMinerals),
            "",
            line("Processing Method", s.processingMethod),
            line("Notes", s.notes),
            "",
            line("GI Measured", s.giMeasured),
            line("GI Predicted", s.giPredicted),
            line("Model Version", s.modelVersion)
        ).joinToString("\n")
    }
}
