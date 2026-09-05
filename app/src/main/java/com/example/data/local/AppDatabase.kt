package com.example.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.sqlite.db.SupportSQLiteDatabase
import com.example.data.local.dao.StudySessionDao
import com.example.data.local.dao.SubjectDao
import com.example.data.local.dao.TaskDao
import com.example.data.local.dao.TopicDao
import com.example.data.local.entities.StudySessionEntity
import com.example.data.local.entities.SubjectEntity
import com.example.data.local.entities.TaskEntity
import com.example.data.local.entities.TopicEntity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@Database(
    entities = [
        TaskEntity::class,
        StudySessionEntity::class,
        SubjectEntity::class,
        TopicEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun taskDao(): TaskDao
    abstract fun studySessionDao(): StudySessionDao
    abstract fun subjectDao(): SubjectDao
    abstract fun topicDao(): TopicDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context, scope: CoroutineScope): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "studyflow_database"
                )
                    .addCallback(DatabaseCallback(scope))
                    .build()
                INSTANCE = instance
                instance
            }
        }

        private class DatabaseCallback(
            private val scope: CoroutineScope
        ) : RoomDatabase.Callback() {
            override fun onCreate(db: SupportSQLiteDatabase) {
                super.onCreate(db)
                INSTANCE?.let { database ->
                    scope.launch(Dispatchers.IO) {
                        populateInitialData(database)
                    }
                }
            }

            private suspend fun populateInitialData(database: AppDatabase) {
                val subjectDao = database.subjectDao()
                val topicDao = database.topicDao()
                val taskDao = database.taskDao()
                val sessionDao = database.studySessionDao()

                // Seed Subjects
                subjectDao.insertSubject(SubjectEntity(name = "Physics", colorHex = "#6366F1"))
                subjectDao.insertSubject(SubjectEntity(name = "Mathematics", colorHex = "#06B6D4"))
                subjectDao.insertSubject(SubjectEntity(name = "Chemistry", colorHex = "#10B981"))
                subjectDao.insertSubject(SubjectEntity(name = "Computer Science", colorHex = "#F59E0B"))

                // Seed Topics with realistic progress
                topicDao.insertTopic(TopicEntity(subjectName = "Physics", name = "Electrostatics", targetMinutes = 180, studiedMinutes = 130))
                topicDao.insertTopic(TopicEntity(subjectName = "Physics", name = "Current Electricity", targetMinutes = 150, studiedMinutes = 68))
                topicDao.insertTopic(TopicEntity(subjectName = "Physics", name = "Rotational Motion", targetMinutes = 200, studiedMinutes = 56))

                topicDao.insertTopic(TopicEntity(subjectName = "Mathematics", name = "Limits & Continuity", targetMinutes = 120, studiedMinutes = 90))
                topicDao.insertTopic(TopicEntity(subjectName = "Mathematics", name = "Definite Integrals", targetMinutes = 160, studiedMinutes = 80))
                topicDao.insertTopic(TopicEntity(subjectName = "Mathematics", name = "Linear Algebra", targetMinutes = 140, studiedMinutes = 110))

                topicDao.insertTopic(TopicEntity(subjectName = "Chemistry", name = "Chemical Bonding", targetMinutes = 150, studiedMinutes = 75))
                topicDao.insertTopic(TopicEntity(subjectName = "Chemistry", name = "Thermodynamics", targetMinutes = 180, studiedMinutes = 45))

                topicDao.insertTopic(TopicEntity(subjectName = "Computer Science", name = "Data Structures", targetMinutes = 240, studiedMinutes = 180))

                // Seed Tasks (as requested in user prompt example tasks)
                taskDao.insertTask(
                    TaskEntity(
                        title = "Master Gauss Law problems",
                        subject = "Physics",
                        topic = "Electrostatics",
                        deadline = "Today, 6:00 PM",
                        priority = "High",
                        estimatedMinutes = 60,
                        isCompleted = false
                    )
                )
                taskDao.insertTask(
                    TaskEntity(
                        title = "Solve 15 L'Hôpital rule problems",
                        subject = "Mathematics",
                        topic = "Limits & Continuity",
                        deadline = "Today, 8:30 PM",
                        priority = "Medium",
                        estimatedMinutes = 45,
                        isCompleted = false
                    )
                )
                taskDao.insertTask(
                    TaskEntity(
                        title = "Revise Hybridization & VSEPR theory",
                        subject = "Chemistry",
                        topic = "Chemical Bonding",
                        deadline = "Tomorrow, 10:00 AM",
                        priority = "High",
                        estimatedMinutes = 50,
                        isCompleted = false
                    )
                )
                taskDao.insertTask(
                    TaskEntity(
                        title = "Implement Binary Search Tree in Kotlin",
                        subject = "Computer Science",
                        topic = "Data Structures",
                        deadline = "Tomorrow, 4:00 PM",
                        priority = "Low",
                        estimatedMinutes = 40,
                        isCompleted = true
                    )
                )

                // Seed some recent study sessions across the week for charts
                val now = System.currentTimeMillis()
                val oneDay = 24 * 60 * 60 * 1000L
                sessionDao.insertSession(
                    StudySessionEntity(
                        subject = "Physics",
                        topic = "Electrostatics",
                        durationSeconds = 60 * 60,
                        timestamp = now - (oneDay * 2),
                        focusRating = 5,
                        questionsAttempted = 18,
                        questionsCorrect = 16,
                        notes = "Very strong on electric flux derivations."
                    )
                )
                sessionDao.insertSession(
                    StudySessionEntity(
                        subject = "Mathematics",
                        topic = "Limits & Continuity",
                        durationSeconds = 45 * 60,
                        timestamp = now - (oneDay * 1),
                        focusRating = 4,
                        questionsAttempted = 14,
                        questionsCorrect = 12,
                        notes = "Need to review indeterminate forms 0^0."
                    )
                )
                sessionDao.insertSession(
                    StudySessionEntity(
                        subject = "Chemistry",
                        topic = "Chemical Bonding",
                        durationSeconds = 50 * 60,
                        timestamp = now - (oneDay * 0),
                        focusRating = 5,
                        questionsAttempted = 20,
                        questionsCorrect = 18,
                        notes = "Molecular orbital diagrams are clear now."
                    )
                )
            }
        }
    }
}
