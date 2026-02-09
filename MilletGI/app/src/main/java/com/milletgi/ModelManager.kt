package com.milletgi

import android.content.Context
import java.io.File

object ModelManager {
    private const val MODEL_FILENAME = "model.tflite"

    fun modelFile(context: Context): File {
        return File(context.filesDir, MODEL_FILENAME)
    }

    fun isModelInstalled(context: Context): Boolean {
        return modelFile(context).exists()
    }

    fun ensureFakeModelInstalled(context: Context) {
        val file = modelFile(context)
        if (file.exists()) return
        // Tiny placeholder file to simulate a model bundle.
        file.writeText("FAKE_MODEL_v1")
    }
}
