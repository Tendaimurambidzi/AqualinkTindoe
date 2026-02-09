package com.milletgi

import kotlin.math.max
import kotlin.math.min

object FakeModel {
    fun predict(sample: Sample): Double {
        // Simple deterministic formula for demo only.
        val carb = sample.carbohydrate ?: 0.0
        val fiber = sample.fiber ?: 0.0
        val protein = sample.protein ?: 0.0
        val fat = sample.fat ?: 0.0
        val moisture = sample.moisture ?: 0.0
        val phenolics = sample.totalPhenolics ?: 0.0
        val phytate = sample.phytate ?: 0.0

        val score = 40.0 +
            (0.4 * carb) -
            (1.2 * fiber) -
            (0.6 * protein) -
            (0.4 * fat) -
            (0.1 * moisture) -
            (2.0 * phenolics) -
            (3.0 * phytate)

        return min(90.0, max(35.0, score))
    }
}
