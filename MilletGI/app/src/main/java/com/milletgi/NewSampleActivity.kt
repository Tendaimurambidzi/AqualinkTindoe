package com.milletgi

import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class NewSampleActivity : AppCompatActivity() {

    private var editId: Long = 0

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_new_sample)

        val inputSampleId = findViewById<EditText>(R.id.inputSampleId)
        val inputVariety = findViewById<EditText>(R.id.inputVariety)
        val inputBatch = findViewById<EditText>(R.id.inputBatch)
        val inputReplicate = findViewById<EditText>(R.id.inputReplicate)
        val inputDate = findViewById<EditText>(R.id.inputDate)

        val inputMoisture = findViewById<EditText>(R.id.inputMoisture)
        val inputProtein = findViewById<EditText>(R.id.inputProtein)
        val inputFat = findViewById<EditText>(R.id.inputFat)
        val inputAsh = findViewById<EditText>(R.id.inputAsh)
        val inputFiber = findViewById<EditText>(R.id.inputFiber)
        val inputCarb = findViewById<EditText>(R.id.inputCarb)

        val inputPhytate = findViewById<EditText>(R.id.inputPhytate)
        val inputTannins = findViewById<EditText>(R.id.inputTannins)
        val inputOxalate = findViewById<EditText>(R.id.inputOxalate)
        val inputOtherAntinutrients = findViewById<EditText>(R.id.inputOtherAntinutrients)

        val inputPhenolics = findViewById<EditText>(R.id.inputPhenolics)
        val inputFlavonoids = findViewById<EditText>(R.id.inputFlavonoids)
        val inputOtherBioactives = findViewById<EditText>(R.id.inputOtherBioactives)

        val inputIron = findViewById<EditText>(R.id.inputIron)
        val inputZinc = findViewById<EditText>(R.id.inputZinc)
        val inputCalcium = findViewById<EditText>(R.id.inputCalcium)
        val inputMagnesium = findViewById<EditText>(R.id.inputMagnesium)
        val inputOtherMinerals = findViewById<EditText>(R.id.inputOtherMinerals)

        val inputProcessing = findViewById<EditText>(R.id.inputProcessing)
        val inputNotes = findViewById<EditText>(R.id.inputNotes)
        val inputGI = findViewById<EditText>(R.id.inputGI)

        editId = intent.getLongExtra("sample_id", 0)
        if (editId > 0) {
            val db = DBHelper(this)
            val sample = db.getSample(editId)
            if (sample != null) {
                inputSampleId.setText(sample.sampleId)
                inputVariety.setText(sample.varietyName)
                inputBatch.setText(sample.batchId)
                inputReplicate.setText(sample.replicate?.toString() ?: "")
                inputDate.setText(sample.dateMeasured)

                inputMoisture.setText(sample.moisture?.toString() ?: "")
                inputProtein.setText(sample.protein?.toString() ?: "")
                inputFat.setText(sample.fat?.toString() ?: "")
                inputAsh.setText(sample.ash?.toString() ?: "")
                inputFiber.setText(sample.fiber?.toString() ?: "")
                inputCarb.setText(sample.carbohydrate?.toString() ?: "")

                inputPhytate.setText(sample.phytate?.toString() ?: "")
                inputTannins.setText(sample.tannins?.toString() ?: "")
                inputOxalate.setText(sample.oxalate?.toString() ?: "")
                inputOtherAntinutrients.setText(sample.otherAntinutrients ?: "")

                inputPhenolics.setText(sample.totalPhenolics?.toString() ?: "")
                inputFlavonoids.setText(sample.flavonoids?.toString() ?: "")
                inputOtherBioactives.setText(sample.otherBioactives ?: "")

                inputIron.setText(sample.iron?.toString() ?: "")
                inputZinc.setText(sample.zinc?.toString() ?: "")
                inputCalcium.setText(sample.calcium?.toString() ?: "")
                inputMagnesium.setText(sample.magnesium?.toString() ?: "")
                inputOtherMinerals.setText(sample.otherMinerals ?: "")

                inputProcessing.setText(sample.processingMethod ?: "")
                inputNotes.setText(sample.notes ?: "")
                inputGI.setText(sample.giMeasured?.toString() ?: "")
            }
        } else if (inputDate.text.isNullOrBlank()) {
            val today = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date())
            inputDate.setText(today)
        }

        findViewById<Button>(R.id.btnSave).setOnClickListener {
            val variety = inputVariety.text.toString().trim()
            if (variety.isBlank()) {
                Toast.makeText(this, "Variety name is required", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val sampleId = inputSampleId.text.toString().trim().ifBlank {
                "S-" + System.currentTimeMillis()
            }

            val sample = Sample(
                id = editId,
                sampleId = sampleId,
                varietyName = variety,
                batchId = inputBatch.text.toString().trim().ifBlank { null },
                replicate = inputReplicate.text.toString().trim().toIntOrNull(),
                dateMeasured = inputDate.text.toString().trim().ifBlank { null },
                moisture = inputMoisture.text.toString().trim().toDoubleOrNull(),
                protein = inputProtein.text.toString().trim().toDoubleOrNull(),
                fat = inputFat.text.toString().trim().toDoubleOrNull(),
                ash = inputAsh.text.toString().trim().toDoubleOrNull(),
                fiber = inputFiber.text.toString().trim().toDoubleOrNull(),
                carbohydrate = inputCarb.text.toString().trim().toDoubleOrNull(),
                phytate = inputPhytate.text.toString().trim().toDoubleOrNull(),
                tannins = inputTannins.text.toString().trim().toDoubleOrNull(),
                oxalate = inputOxalate.text.toString().trim().toDoubleOrNull(),
                otherAntinutrients = inputOtherAntinutrients.text.toString().trim().ifBlank { null },
                totalPhenolics = inputPhenolics.text.toString().trim().toDoubleOrNull(),
                flavonoids = inputFlavonoids.text.toString().trim().toDoubleOrNull(),
                otherBioactives = inputOtherBioactives.text.toString().trim().ifBlank { null },
                iron = inputIron.text.toString().trim().toDoubleOrNull(),
                zinc = inputZinc.text.toString().trim().toDoubleOrNull(),
                calcium = inputCalcium.text.toString().trim().toDoubleOrNull(),
                magnesium = inputMagnesium.text.toString().trim().toDoubleOrNull(),
                otherMinerals = inputOtherMinerals.text.toString().trim().ifBlank { null },
                processingMethod = inputProcessing.text.toString().trim().ifBlank { null },
                notes = inputNotes.text.toString().trim().ifBlank { null },
                giMeasured = inputGI.text.toString().trim().toDoubleOrNull(),
                giPredicted = null,
                modelVersion = null
            )

            val db = DBHelper(this)
            if (editId > 0) {
                db.updateSample(sample)
                Toast.makeText(this, "Sample updated", Toast.LENGTH_SHORT).show()
            } else {
                db.insertSample(sample)
                Toast.makeText(this, "Sample saved", Toast.LENGTH_SHORT).show()
            }
            finish()
        }
    }
}
