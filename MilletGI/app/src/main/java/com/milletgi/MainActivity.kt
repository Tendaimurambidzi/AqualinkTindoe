package com.milletgi

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

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
            val file = ExportUtils.exportToCsv(this, samples)
            Toast.makeText(this, "Exported: ${file.absolutePath}", Toast.LENGTH_LONG).show()
        }
    }
}
