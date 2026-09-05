package com.example.data.repository

import com.example.data.local.AppDatabase
import com.example.data.local.entities.StudySessionEntity
import com.example.data.local.entities.SubjectEntity
import com.example.data.local.entities.TaskEntity
import com.example.data.local.entities.TopicEntity
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import java.util.Calendar

data class DayStudyData(
    val dayLabel: String, // "Mon", "Tue", etc.
    val minutes: Int,
    val isToday: Boolean = false
)

data class SubjectStudyStat(
    val subjectName: String,
    val minutes: Int,
    val percentage: Float,
    val colorHex: String
)

data class TopicAnalytics(
    val topicName: String,
    val subjectName: String,
    val accuracy: Float,
    val totalQuestions: Int,
    val studiedMinutes: Int
)

class StudyRepository(private val database: AppDatabase) {
    val tasks: Flow<List<TaskEntity>> = database.taskDao().getAllTasks()
    val sessions: Flow<List<StudySessionEntity>> = database.studySessionDao().getAllSessions()
    val subjects: Flow<List<SubjectEntity>> = database.subjectDao().getAllSubjects()
    val topics: Flow<List<TopicEntity>> = database.topicDao().getAllTopics()

    suspend fun insertTask(task: TaskEntity) = database.taskDao().insertTask(task)
    suspend fun updateTask(task: TaskEntity) = database.taskDao().updateTask(task)
    suspend fun deleteTask(task: TaskEntity) = database.taskDao().deleteTask(task)
    suspend fun deleteTaskById(id: Long) = database.taskDao().deleteTaskById(id)
    suspend fun setTaskCompleted(id: Long, completed: Boolean) = database.taskDao().setTaskCompleted(id, completed)

    suspend fun recordStudySession(session: StudySessionEntity) {
        database.studySessionDao().insertSession(session)
        // Also update studiedMinutes in topic if applicable
        val addedMinutes = session.durationSeconds / 60
        if (addedMinutes > 0 && session.sessionMode == "Focus") {
            database.topicDao().addStudiedMinutes(session.subject, session.topic, addedMinutes)
        }
    }

    suspend fun insertSubject(subject: SubjectEntity) = database.subjectDao().insertSubject(subject)
    suspend fun deleteSubject(subject: SubjectEntity) {
        database.subjectDao().deleteSubject(subject)
        database.topicDao().deleteTopicsForSubject(subject.name)
    }

    suspend fun insertTopic(topic: TopicEntity) = database.topicDao().insertTopic(topic)
    suspend fun updateTopic(topic: TopicEntity) = database.topicDao().updateTopic(topic)
    suspend fun deleteTopicById(id: Long) = database.topicDao().deleteTopicById(id)
}
