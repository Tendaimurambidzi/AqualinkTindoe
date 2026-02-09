package com.milletgi

import android.content.Intent
import android.os.Bundle
import android.widget.ArrayAdapter
import android.widget.ListView
import androidx.appcompat.app.AppCompatActivity

class SampleListActivity : AppCompatActivity() {

    private val items = mutableListOf<Pair<Long, String>>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_sample_list)

        val listView = findViewById<ListView>(R.id.listSamples)
        val adapter = ArrayAdapter(this, android.R.layout.simple_list_item_1, mutableListOf<String>())
        listView.adapter = adapter

        val db = DBHelper(this)
        val samples = db.getAllSamples()
        items.clear()
        adapter.clear()

        samples.forEach { s ->
            val label = "${s.sampleId} - ${s.varietyName} (rep ${s.replicate ?: "?"})"
            items.add(s.id to label)
            adapter.add(label)
        }

        listView.setOnItemClickListener { _, _, position, _ ->
            val id = items[position].first
            val intent = Intent(this, SampleDetailActivity::class.java)
            intent.putExtra("sample_id", id)
            startActivity(intent)
        }
    }
}
