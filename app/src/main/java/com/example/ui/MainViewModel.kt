package com.example.ui

import android.app.Application
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.local.AppDatabase
import com.example.data.local.entities.StudySessionEntity
import com.example.data.local.entities.SubjectEntity
import com.example.data.local.entities.TaskEntity
import com.example.data.local.entities.TopicEntity
import com.example.data.repository.DayStudyData
import com.example.data.repository.StudyRepository
import com.example.data.repository.SubjectStudyStat
import com.example.data.repository.TopicAnalytics
import com.example.domain.ai.AiResult
import com.example.domain.ai.StudyAiService
import com.example.ui.navigation.Screen
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

enum class TimerStatus {
    IDLE, RUNNING, PAUSED, FINISHED
}

class MainViewModel(application: Application) : AndroidViewModel(application) {
    private val database = AppDatabase.getDatabase(application, viewModelScope)
    val repository = StudyRepository(database)
    val aiService = StudyAiService()

    // Navigation State
    private val _currentScreen = MutableStateFlow(Screen.Landing)
    val currentScreen: StateFlow<Screen> = _currentScreen.asStateFlow()

    fun navigateTo(screen: Screen) {
        _currentScreen.value = screen
    }

    // User Profile
    var userName by mutableStateOf("Alex")
    var userGoalMinutes by mutableStateOf(120)
    var userFocusMajor by mutableStateOf("STEM / Computer Science & Physics")
    var appearanceTheme by mutableStateOf("Dark Obsidian")
    var notificationsEnabled by mutableStateOf(true)

    // Data from Room
    val tasks: StateFlow<List<TaskEntity>> = repository.tasks
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val sessions: StateFlow<List<StudySessionEntity>> = repository.sessions
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val subjects: StateFlow<List<SubjectEntity>> = repository.subjects
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val topics: StateFlow<List<TopicEntity>> = repository.topics
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // --- Study Timer State ---
    var selectedTimerSubject by mutableStateOf("Physics")
    var selectedTimerTopic by mutableStateOf("Electrostatics")
    var timerMode by mutableStateOf("Focus") // "Focus", "Short Break", "Long Break"
    var timerStatus by mutableStateOf(TimerStatus.IDLE)
    var totalSeconds by mutableStateOf(25 * 60)
    var secondsRemaining by mutableStateOf(25 * 60)

    // Post session evaluation state
    var showPostSessionDialog by mutableStateOf(false)
    var postSessionRating by mutableStateOf(5)
    var postSessionQuestionsAttempted by mutableStateOf(10)
    var postSessionQuestionsCorrect by mutableStateOf(9)
    var postSessionNotes by mutableStateOf("")
    private var completedSessionDurationSeconds: Int = 0

    private var timerJob: Job? = null

    fun setTimerConfiguration(mode: String, minutes: Int) {
        if (timerStatus == TimerStatus.RUNNING) return
        timerMode = mode
        totalSeconds = minutes * 60
        secondsRemaining = totalSeconds
        timerStatus = TimerStatus.IDLE
    }

    fun startTimer() {
        if (timerStatus == TimerStatus.RUNNING) return
        timerStatus = TimerStatus.RUNNING
        timerJob?.cancel()
        timerJob = viewModelScope.launch {
            while (secondsRemaining > 0 && timerStatus == TimerStatus.RUNNING) {
                delay(1000)
                secondsRemaining--
            }
            if (secondsRemaining <= 0) {
                finishSession(isNaturalFinish = true)
            }
        }
    }

    fun pauseTimer() {
        if (timerStatus == TimerStatus.RUNNING) {
            timerStatus = TimerStatus.PAUSED
            timerJob?.cancel()
        }
    }

    fun resumeTimer() {
        if (timerStatus == TimerStatus.PAUSED) {
            startTimer()
        }
    }

    fun cancelTimer() {
        timerJob?.cancel()
        timerStatus = TimerStatus.IDLE
        secondsRemaining = totalSeconds
    }

    fun finishSession(isNaturalFinish: Boolean = false) {
        timerJob?.cancel()
        timerStatus = TimerStatus.FINISHED
        val studied = totalSeconds - secondsRemaining
        completedSessionDurationSeconds = if (isNaturalFinish || studied <= 0) totalSeconds else studied

        // Prompt user for reflection
        postSessionRating = 5
        postSessionQuestionsAttempted = 10
        postSessionQuestionsCorrect = 9
        postSessionNotes = ""
        showPostSessionDialog = true
    }

    fun submitSessionEvaluation() {
        viewModelScope.launch {
            val session = StudySessionEntity(
                subject = selectedTimerSubject,
                topic = selectedTimerTopic,
                durationSeconds = completedSessionDurationSeconds.coerceAtLeast(60),
                timestamp = System.currentTimeMillis(),
                focusRating = postSessionRating,
                questionsAttempted = postSessionQuestionsAttempted,
                questionsCorrect = postSessionQuestionsCorrect,
                notes = postSessionNotes.trim(),
                sessionMode = timerMode
            )
            repository.recordStudySession(session)
            showPostSessionDialog = false
            timerStatus = TimerStatus.IDLE
            secondsRemaining = totalSeconds
            triggerAiRecommendationRefresh()
        }
    }

    fun dismissPostSessionDialog() {
        viewModelScope.launch {
            val session = StudySessionEntity(
                subject = selectedTimerSubject,
                topic = selectedTimerTopic,
                durationSeconds = completedSessionDurationSeconds.coerceAtLeast(60),
                timestamp = System.currentTimeMillis(),
                focusRating = 5,
                questionsAttempted = 0,
                questionsCorrect = 0,
                notes = "",
                sessionMode = timerMode
            )
            repository.recordStudySession(session)
            showPostSessionDialog = false
            timerStatus = TimerStatus.IDLE
            secondsRemaining = totalSeconds
        }
    }

    fun startStudyForTask(task: TaskEntity) {
        selectedTimerSubject = task.subject
        selectedTimerTopic = task.topic
        setTimerConfiguration("Focus", task.estimatedMinutes.coerceAtLeast(15))
        _currentScreen.value = Screen.Study
        startTimer()
    }

    // --- Task Planner Actions ---
    fun addTask(
        title: String,
        subject: String,
        topic: String,
        deadline: String,
        priority: String,
        estimatedMinutes: Int
    ) {
        viewModelScope.launch {
            val newTask = TaskEntity(
                title = title.trim(),
                subject = subject.trim(),
                topic = topic.trim(),
                deadline = deadline.trim().ifEmpty { "Today, 8:00 PM" },
                priority = priority,
                estimatedMinutes = estimatedMinutes.coerceAtLeast(10),
                isCompleted = false
            )
            repository.insertTask(newTask)
        }
    }

    fun updateTask(task: TaskEntity) {
        viewModelScope.launch {
            repository.updateTask(task)
        }
    }

    fun deleteTask(task: TaskEntity) {
        viewModelScope.launch {
            repository.deleteTask(task)
        }
    }

    fun toggleTaskCompletion(task: TaskEntity) {
        viewModelScope.launch {
            repository.setTaskCompleted(task.id, !task.isCompleted)
        }
    }

    // --- Subject & Topic Management ---
    fun addSubject(name: String, colorHex: String = "#6366F1") {
        viewModelScope.launch {
            repository.insertSubject(SubjectEntity(name = name.trim(), colorHex = colorHex))
        }
    }

    fun deleteSubject(subject: SubjectEntity) {
        viewModelScope.launch {
            repository.deleteSubject(subject)
        }
    }

    fun addTopic(subjectName: String, topicName: String, targetMinutes: Int) {
        viewModelScope.launch {
            repository.insertTopic(
                TopicEntity(
                    subjectName = subjectName,
                    name = topicName.trim(),
                    targetMinutes = targetMinutes.coerceAtLeast(30),
                    studiedMinutes = 0
                )
            )
        }
    }

    fun updateTopic(topic: TopicEntity) {
        viewModelScope.launch {
            repository.updateTopic(topic)
        }
    }

    fun deleteTopic(id: Long) {
        viewModelScope.launch {
            repository.deleteTopicById(id)
        }
    }

    // --- Computed Analytics ---
    val todayStudiedMinutes: StateFlow<Int> = sessions.map { sessionList ->
        val todayStart = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }.timeInMillis

        sessionList.filter { it.timestamp >= todayStart && it.sessionMode == "Focus" }
            .sumOf { it.durationSeconds } / 60
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    val todaySessionsCount: StateFlow<Int> = sessions.map { sessionList ->
        val todayStart = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }.timeInMillis

        sessionList.count { it.timestamp >= todayStart && it.sessionMode == "Focus" }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    val currentStreakDays: StateFlow<Int> = sessions.map { sessionList ->
        if (sessionList.isEmpty()) return@map 1
        val dates = sessionList.map {
            val cal = Calendar.getInstance().apply { timeInMillis = it.timestamp }
            "${cal.get(Calendar.YEAR)}-${cal.get(Calendar.DAY_OF_YEAR)}"
        }.distinct()
        dates.size.coerceAtLeast(1)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 1)

    val weeklyStudyData: StateFlow<List<DayStudyData>> = sessions.map { sessionList ->
        val days = listOf("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")
        val cal = Calendar.getInstance()
        val currentDayOfWeek = when (cal.get(Calendar.DAY_OF_WEEK)) {
            Calendar.MONDAY -> 0
            Calendar.TUESDAY -> 1
            Calendar.WEDNESDAY -> 2
            Calendar.THURSDAY -> 3
            Calendar.FRIDAY -> 4
            Calendar.SATURDAY -> 5
            Calendar.SUNDAY -> 6
            else -> 0
        }

        // Map past 7 days into Mon-Sun
        val dayMinutes = IntArray(7) { 0 }
        val now = System.currentTimeMillis()
        val oneDay = 24 * 60 * 60 * 1000L

        sessionList.filter { it.sessionMode == "Focus" }.forEach { session ->
            val diffDays = ((now - session.timestamp) / oneDay).toInt()
            if (diffDays in 0..6) {
                val sessionCal = Calendar.getInstance().apply { timeInMillis = session.timestamp }
                val idx = when (sessionCal.get(Calendar.DAY_OF_WEEK)) {
                    Calendar.MONDAY -> 0
                    Calendar.TUESDAY -> 1
                    Calendar.WEDNESDAY -> 2
                    Calendar.THURSDAY -> 3
                    Calendar.FRIDAY -> 4
                    Calendar.SATURDAY -> 5
                    Calendar.SUNDAY -> 6
                    else -> 0
                }
                dayMinutes[idx] += session.durationSeconds / 60
            }
        }

        days.mapIndexed { index, label ->
            DayStudyData(
                dayLabel = label,
                minutes = dayMinutes[index],
                isToday = (index == currentDayOfWeek)
            )
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val subjectBreakdown: StateFlow<List<SubjectStudyStat>> = combine(sessions, subjects) { sessionList, subjectList ->
        val focusSessions = sessionList.filter { it.sessionMode == "Focus" }
        val totalMinutes = focusSessions.sumOf { it.durationSeconds } / 60
        if (totalMinutes == 0) return@combine emptyList()

        val grouped = focusSessions.groupBy { it.subject }
        grouped.map { (subjectName, sList) ->
            val mins = sList.sumOf { it.durationSeconds } / 60
            val color = subjectList.find { it.name.equals(subjectName, ignoreCase = true) }?.colorHex ?: "#6366F1"
            SubjectStudyStat(
                subjectName = subjectName,
                minutes = mins,
                percentage = mins.toFloat() / totalMinutes.toFloat(),
                colorHex = color
            )
        }.sortedByDescending { it.minutes }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val overallAccuracy: StateFlow<Int> = sessions.map { sessionList ->
        val totalAttempted = sessionList.sumOf { it.questionsAttempted }
        val totalCorrect = sessionList.sumOf { it.questionsCorrect }
        if (totalAttempted == 0) 86 else ((totalCorrect.toFloat() / totalAttempted.toFloat()) * 100).toInt()
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 86)

    val totalQuestionsCount: StateFlow<Int> = sessions.map { sessionList ->
        sessionList.sumOf { it.questionsAttempted }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    val topicAnalytics: StateFlow<List<TopicAnalytics>> = combine(sessions, topics) { sessionList, topicList ->
        topicList.map { topic ->
            val topicSessions = sessionList.filter { it.topic.equals(topic.name, ignoreCase = true) }
            val attempted = topicSessions.sumOf { it.questionsAttempted }
            val correct = topicSessions.sumOf { it.questionsCorrect }
            val accuracy = if (attempted > 0) (correct.toFloat() / attempted.toFloat()) * 100f else 80f
            TopicAnalytics(
                topicName = topic.name,
                subjectName = topic.subjectName,
                accuracy = accuracy,
                totalQuestions = attempted,
                studiedMinutes = topic.studiedMinutes
            )
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // --- AI Study Coach Advice ---
    var aiCoachAdvice by mutableStateOf(
        "1. Prioritize Electrostatics Gauss Law problems: Target 45 min deep work before 8 PM.\n" +
        "2. Active Recall: You have 88% accuracy in Chemistry—keep momentum with 10 timed practice questions.\n" +
        "3. Review Limits: Refresh indeterminate forms 0/0 and ∞/∞ to solidify problem-solving speed."
    )
    var isAiCoachLoading by mutableStateOf(false)

    fun triggerAiRecommendationRefresh() {
        viewModelScope.launch {
            isAiCoachLoading = true
            val weak = topicAnalytics.value.filter { it.accuracy < 80 }.map { it.topicName }
            val strong = topicAnalytics.value.filter { it.accuracy >= 80 }.map { it.topicName }
            val result = aiService.getStudyCoachRecommendation(
                studentName = userName,
                studiedMinutesToday = todayStudiedMinutes.value,
                totalSessions = todaySessionsCount.value,
                weakTopics = weak,
                strongTopics = strong
            )
            when (result) {
                is AiResult.Success -> {
                    aiCoachAdvice = result.data
                }
                else -> {}
            }
            isAiCoachLoading = false
        }
    }
}
