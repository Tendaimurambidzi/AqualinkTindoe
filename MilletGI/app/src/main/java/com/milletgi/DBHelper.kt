package com.milletgi

import android.content.ContentValues
import android.content.Context
import android.database.Cursor
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper

class DBHelper(context: Context) : SQLiteOpenHelper(context, DATABASE_NAME, null, DATABASE_VERSION) {

    override fun onCreate(db: SQLiteDatabase) {
        db.execSQL(
            """
            CREATE TABLE $TABLE_SAMPLES (
                $COL_ID INTEGER PRIMARY KEY AUTOINCREMENT,
                $COL_SAMPLE_ID TEXT NOT NULL,
                $COL_VARIETY_NAME TEXT NOT NULL,
                $COL_BATCH_ID TEXT,
                $COL_REPLICATE INTEGER,
                $COL_DATE_MEASURED TEXT,
                $COL_MOISTURE REAL,
                $COL_PROTEIN REAL,
                $COL_FAT REAL,
                $COL_ASH REAL,
                $COL_FIBER REAL,
                $COL_CARBOHYDRATE REAL,
                $COL_PHYTATE REAL,
                $COL_TANNINS REAL,
                $COL_OXALATE REAL,
                $COL_OTHER_ANTINUTRIENTS TEXT,
                $COL_TOTAL_PHENOLICS REAL,
                $COL_FLAVONOIDS REAL,
                $COL_OTHER_BIOACTIVES TEXT,
                $COL_IRON REAL,
                $COL_ZINC REAL,
                $COL_CALCIUM REAL,
                $COL_MAGNESIUM REAL,
                $COL_OTHER_MINERALS TEXT,
                $COL_PROCESSING_METHOD TEXT,
                $COL_NOTES TEXT,
                $COL_GI_MEASURED REAL,
                $COL_GI_PREDICTED REAL,
                $COL_MODEL_VERSION TEXT
            )
            """.trimIndent()
        )
    }

    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        db.execSQL("DROP TABLE IF EXISTS $TABLE_SAMPLES")
        onCreate(db)
    }

    fun insertSample(sample: Sample): Long {
        val values = sampleToValues(sample)
        return writableDatabase.insert(TABLE_SAMPLES, null, values)
    }

    fun updateSample(sample: Sample): Int {
        val values = sampleToValues(sample)
        return writableDatabase.update(
            TABLE_SAMPLES,
            values,
            "$COL_ID = ?",
            arrayOf(sample.id.toString())
        )
    }

    fun deleteSample(id: Long): Int {
        return writableDatabase.delete(TABLE_SAMPLES, "$COL_ID = ?", arrayOf(id.toString()))
    }

    fun getSample(id: Long): Sample? {
        val cursor = readableDatabase.query(
            TABLE_SAMPLES,
            null,
            "$COL_ID = ?",
            arrayOf(id.toString()),
            null,
            null,
            null
        )
        cursor.use {
            return if (it.moveToFirst()) cursorToSample(it) else null
        }
    }

    fun getAllSamples(): List<Sample> {
        val samples = mutableListOf<Sample>()
        val cursor = readableDatabase.query(
            TABLE_SAMPLES,
            null,
            null,
            null,
            null,
            null,
            "$COL_ID DESC"
        )
        cursor.use {
            while (it.moveToNext()) {
                samples.add(cursorToSample(it))
            }
        }
        return samples
    }

    private fun sampleToValues(sample: Sample): ContentValues {
        val values = ContentValues()
        values.put(COL_SAMPLE_ID, sample.sampleId)
        values.put(COL_VARIETY_NAME, sample.varietyName)
        putNullable(values, COL_BATCH_ID, sample.batchId)
        putNullable(values, COL_REPLICATE, sample.replicate)
        putNullable(values, COL_DATE_MEASURED, sample.dateMeasured)
        putNullable(values, COL_MOISTURE, sample.moisture)
        putNullable(values, COL_PROTEIN, sample.protein)
        putNullable(values, COL_FAT, sample.fat)
        putNullable(values, COL_ASH, sample.ash)
        putNullable(values, COL_FIBER, sample.fiber)
        putNullable(values, COL_CARBOHYDRATE, sample.carbohydrate)
        putNullable(values, COL_PHYTATE, sample.phytate)
        putNullable(values, COL_TANNINS, sample.tannins)
        putNullable(values, COL_OXALATE, sample.oxalate)
        putNullable(values, COL_OTHER_ANTINUTRIENTS, sample.otherAntinutrients)
        putNullable(values, COL_TOTAL_PHENOLICS, sample.totalPhenolics)
        putNullable(values, COL_FLAVONOIDS, sample.flavonoids)
        putNullable(values, COL_OTHER_BIOACTIVES, sample.otherBioactives)
        putNullable(values, COL_IRON, sample.iron)
        putNullable(values, COL_ZINC, sample.zinc)
        putNullable(values, COL_CALCIUM, sample.calcium)
        putNullable(values, COL_MAGNESIUM, sample.magnesium)
        putNullable(values, COL_OTHER_MINERALS, sample.otherMinerals)
        putNullable(values, COL_PROCESSING_METHOD, sample.processingMethod)
        putNullable(values, COL_NOTES, sample.notes)
        putNullable(values, COL_GI_MEASURED, sample.giMeasured)
        putNullable(values, COL_GI_PREDICTED, sample.giPredicted)
        putNullable(values, COL_MODEL_VERSION, sample.modelVersion)
        return values
    }

    private fun cursorToSample(cursor: Cursor): Sample {
        return Sample(
            id = cursor.getLong(cursor.getColumnIndexOrThrow(COL_ID)),
            sampleId = cursor.getString(cursor.getColumnIndexOrThrow(COL_SAMPLE_ID)),
            varietyName = cursor.getString(cursor.getColumnIndexOrThrow(COL_VARIETY_NAME)),
            batchId = cursor.getStringOrNull(COL_BATCH_ID),
            replicate = cursor.getIntOrNull(COL_REPLICATE),
            dateMeasured = cursor.getStringOrNull(COL_DATE_MEASURED),
            moisture = cursor.getDoubleOrNull(COL_MOISTURE),
            protein = cursor.getDoubleOrNull(COL_PROTEIN),
            fat = cursor.getDoubleOrNull(COL_FAT),
            ash = cursor.getDoubleOrNull(COL_ASH),
            fiber = cursor.getDoubleOrNull(COL_FIBER),
            carbohydrate = cursor.getDoubleOrNull(COL_CARBOHYDRATE),
            phytate = cursor.getDoubleOrNull(COL_PHYTATE),
            tannins = cursor.getDoubleOrNull(COL_TANNINS),
            oxalate = cursor.getDoubleOrNull(COL_OXALATE),
            otherAntinutrients = cursor.getStringOrNull(COL_OTHER_ANTINUTRIENTS),
            totalPhenolics = cursor.getDoubleOrNull(COL_TOTAL_PHENOLICS),
            flavonoids = cursor.getDoubleOrNull(COL_FLAVONOIDS),
            otherBioactives = cursor.getStringOrNull(COL_OTHER_BIOACTIVES),
            iron = cursor.getDoubleOrNull(COL_IRON),
            zinc = cursor.getDoubleOrNull(COL_ZINC),
            calcium = cursor.getDoubleOrNull(COL_CALCIUM),
            magnesium = cursor.getDoubleOrNull(COL_MAGNESIUM),
            otherMinerals = cursor.getStringOrNull(COL_OTHER_MINERALS),
            processingMethod = cursor.getStringOrNull(COL_PROCESSING_METHOD),
            notes = cursor.getStringOrNull(COL_NOTES),
            giMeasured = cursor.getDoubleOrNull(COL_GI_MEASURED),
            giPredicted = cursor.getDoubleOrNull(COL_GI_PREDICTED),
            modelVersion = cursor.getStringOrNull(COL_MODEL_VERSION)
        )
    }

    private fun Cursor.getStringOrNull(column: String): String? {
        val idx = getColumnIndexOrThrow(column)
        return if (isNull(idx)) null else getString(idx)
    }

    private fun Cursor.getIntOrNull(column: String): Int? {
        val idx = getColumnIndexOrThrow(column)
        return if (isNull(idx)) null else getInt(idx)
    }

    private fun Cursor.getDoubleOrNull(column: String): Double? {
        val idx = getColumnIndexOrThrow(column)
        return if (isNull(idx)) null else getDouble(idx)
    }

    private fun putNullable(values: ContentValues, key: String, value: Any?) {
        when (value) {
            null -> values.putNull(key)
            is String -> values.put(key, value)
            is Int -> values.put(key, value)
            is Long -> values.put(key, value)
            is Float -> values.put(key, value)
            is Double -> values.put(key, value)
            else -> values.put(key, value.toString())
        }
    }

    companion object {
        private const val DATABASE_NAME = "milletgi.db"
        private const val DATABASE_VERSION = 1

        const val TABLE_SAMPLES = "samples"

        const val COL_ID = "id"
        const val COL_SAMPLE_ID = "sample_id"
        const val COL_VARIETY_NAME = "variety_name"
        const val COL_BATCH_ID = "batch_id"
        const val COL_REPLICATE = "replicate"
        const val COL_DATE_MEASURED = "date_measured"
        const val COL_MOISTURE = "moisture"
        const val COL_PROTEIN = "protein"
        const val COL_FAT = "fat"
        const val COL_ASH = "ash"
        const val COL_FIBER = "fiber"
        const val COL_CARBOHYDRATE = "carbohydrate"
        const val COL_PHYTATE = "phytate"
        const val COL_TANNINS = "tannins"
        const val COL_OXALATE = "oxalate"
        const val COL_OTHER_ANTINUTRIENTS = "other_antinutrients"
        const val COL_TOTAL_PHENOLICS = "total_phenolics"
        const val COL_FLAVONOIDS = "flavonoids"
        const val COL_OTHER_BIOACTIVES = "other_bioactives"
        const val COL_IRON = "iron"
        const val COL_ZINC = "zinc"
        const val COL_CALCIUM = "calcium"
        const val COL_MAGNESIUM = "magnesium"
        const val COL_OTHER_MINERALS = "other_minerals"
        const val COL_PROCESSING_METHOD = "processing_method"
        const val COL_NOTES = "notes"
        const val COL_GI_MEASURED = "gi_measured"
        const val COL_GI_PREDICTED = "gi_predicted"
        const val COL_MODEL_VERSION = "model_version"
    }
}
