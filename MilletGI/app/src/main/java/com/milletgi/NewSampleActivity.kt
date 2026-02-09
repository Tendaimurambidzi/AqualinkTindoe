package com.milletgi

import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
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

        val containerAntinutrients = findViewById<LinearLayout>(R.id.containerAntinutrients)
        val containerBioactives = findViewById<LinearLayout>(R.id.containerBioactives)
        val containerMinerals = findViewById<LinearLayout>(R.id.containerMinerals)
        val containerAdditional = findViewById<LinearLayout>(R.id.containerAdditional)

        findViewById<Button>(R.id.btnAddAntinutrient).setOnClickListener {
            addKeyValueRow(containerAntinutrients)
        }
        findViewById<Button>(R.id.btnAddBioactive).setOnClickListener {
            addKeyValueRow(containerBioactives)
        }
        findViewById<Button>(R.id.btnAddMineral).setOnClickListener {
            addKeyValueRow(containerMinerals)
        }
        findViewById<Button>(R.id.btnAddAdditional).setOnClickListener {
            addKeyValueRow(containerAdditional)
        }

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
                populateExtraFields(containerAntinutrients, sample.otherAntinutrients)

                inputPhenolics.setText(sample.totalPhenolics?.toString() ?: "")
                inputFlavonoids.setText(sample.flavonoids?.toString() ?: "")
                inputOtherBioactives.setText(sample.otherBioactives ?: "")
                populateExtraFields(containerBioactives, sample.otherBioactives)

                inputIron.setText(sample.iron?.toString() ?: "")
                inputZinc.setText(sample.zinc?.toString() ?: "")
                inputCalcium.setText(sample.calcium?.toString() ?: "")
                inputMagnesium.setText(sample.magnesium?.toString() ?: "")
                inputOtherMinerals.setText(sample.otherMinerals ?: "")
                populateExtraFields(containerMinerals, sample.otherMinerals)

                inputProcessing.setText(sample.processingMethod ?: "")
                inputNotes.setText(stripParamsLine(sample.notes ?: ""))
                populateExtraFields(containerAdditional, extractParamsLine(sample.notes ?: ""))
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
                otherAntinutrients = mergeOtherText(
                    inputOtherAntinutrients.text.toString().trim(),
                    collectExtraFields(containerAntinutrients)
                ),
                totalPhenolics = inputPhenolics.text.toString().trim().toDoubleOrNull(),
                flavonoids = inputFlavonoids.text.toString().trim().toDoubleOrNull(),
                otherBioactives = mergeOtherText(
                    inputOtherBioactives.text.toString().trim(),
                    collectExtraFields(containerBioactives)
                ),
                iron = inputIron.text.toString().trim().toDoubleOrNull(),
                zinc = inputZinc.text.toString().trim().toDoubleOrNull(),
                calcium = inputCalcium.text.toString().trim().toDoubleOrNull(),
                magnesium = inputMagnesium.text.toString().trim().toDoubleOrNull(),
                otherMinerals = mergeOtherText(
                    inputOtherMinerals.text.toString().trim(),
                    collectExtraFields(containerMinerals)
                ),
                processingMethod = inputProcessing.text.toString().trim().ifBlank { null },
                notes = mergeNotesWithParams(
                    inputNotes.text.toString().trim(),
                    collectExtraFields(containerAdditional)
                ),
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

    private fun addKeyValueRow(container: LinearLayout, key: String? = null, value: String? = null) {
        val row = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
        }

        val keyInput = EditText(this).apply {
            hint = "Name"
            setText(key ?: "")
            layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
        }
        val valueInput = EditText(this).apply {
            hint = "Value"
            setText(value ?: "")
            inputType = android.text.InputType.TYPE_CLASS_NUMBER or android.text.InputType.TYPE_NUMBER_FLAG_DECIMAL
            layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
        }

        row.addView(keyInput)
        row.addView(valueInput)
        container.addView(row)
    }

    private fun collectExtraFields(container: LinearLayout): String {
        val pairs = mutableListOf<String>()
        for (i in 0 until container.childCount) {
            val row = container.getChildAt(i) as? LinearLayout ?: continue
            val key = (row.getChildAt(0) as? EditText)?.text?.toString()?.trim().orEmpty()
            val value = (row.getChildAt(1) as? EditText)?.text?.toString()?.trim().orEmpty()
            if (key.isNotBlank() || value.isNotBlank()) {
                pairs.add("${key}=${value}")
            }
        }
        return pairs.joinToString("; ")
    }

    private fun populateExtraFields(container: LinearLayout, text: String?) {
        if (text.isNullOrBlank()) return
        val pairs = text.split(";").mapNotNull { part ->
            val trimmed = part.trim()
            if (trimmed.contains("=")) {
                val kv = trimmed.split("=", limit = 2)
                kv[0].trim() to kv[1].trim()
            } else {
                null
            }
        }
        pairs.forEach { (k, v) -> addKeyValueRow(container, k, v) }
    }

    private fun mergeOtherText(base: String, extras: String): String? {
        val cleanBase = base.trim()
        val cleanExtras = extras.trim()
        return when {
            cleanBase.isBlank() && cleanExtras.isBlank() -> null
            cleanBase.isBlank() -> cleanExtras
            cleanExtras.isBlank() -> cleanBase
            else -> "$cleanBase; $cleanExtras"
        }
    }

    private fun mergeNotesWithParams(base: String, params: String): String? {
        val baseClean = stripParamsLine(base).trim()
        val paramsClean = params.trim()
        if (baseClean.isBlank() && paramsClean.isBlank()) return null

        return if (paramsClean.isBlank()) {
            baseClean
        } else {
            val prefix = if (baseClean.isBlank()) "" else "$baseClean\n"
            "${prefix}PARAMS: $paramsClean"
        }
    }

    private fun extractParamsLine(notes: String): String {
        val line = notes.lines().firstOrNull { it.trim().startsWith("PARAMS:") } ?: return ""
        return line.substringAfter("PARAMS:").trim()
    }

    private fun stripParamsLine(notes: String): String {
        if (notes.isBlank()) return ""
        return notes.lines()
            .filterNot { it.trim().startsWith("PARAMS:") }
            .joinToString("\n")
    }
}
