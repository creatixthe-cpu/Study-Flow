package com.example.data.local.entities

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "tasks")
data class TaskEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val title: String,
    val subject: String,
    val topic: String,
    val deadline: String,
    val priority: String, // "High", "Medium", "Low"
    val estimatedMinutes: Int,
    val isCompleted: Boolean = false,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "study_sessions")
data class StudySessionEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val subject: String,
    val topic: String,
    val durationSeconds: Int,
    val timestamp: Long = System.currentTimeMillis(),
    val focusRating: Int = 5, // 1 to 5
    val questionsAttempted: Int = 0,
    val questionsCorrect: Int = 0,
    val notes: String = "",
    val sessionMode: String = "Focus" // "Focus", "Short Break", "Long Break"
)

@Entity(tableName = "subjects")
data class SubjectEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val name: String,
    val colorHex: String = "#6366F1"
)

@Entity(tableName = "topics")
data class TopicEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val subjectName: String,
    val name: String,
    val targetMinutes: Int = 120,
    val studiedMinutes: Int = 0
)
