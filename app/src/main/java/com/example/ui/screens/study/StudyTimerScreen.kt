package com.example.ui.screens.study

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.ui.MainViewModel
import com.example.ui.TimerStatus
import com.example.ui.components.CircularProgressRing
import com.example.ui.components.GlassCard
import com.example.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StudyTimerScreen(
    viewModel: MainViewModel,
    modifier: Modifier = Modifier
) {
    val subjects by viewModel.subjects.collectAsStateWithLifecycle()
    val topics by viewModel.topics.collectAsStateWithLifecycle()

    val filteredTopics = remember(viewModel.selectedTimerSubject, topics) {
        topics.filter { it.subjectName.equals(viewModel.selectedTimerSubject, ignoreCase = true) }
    }

    var showSubjectMenu by remember { mutableStateOf(false) }
    var showTopicMenu by remember { mutableStateOf(false) }

    val minutes = viewModel.secondsRemaining / 60
    val seconds = viewModel.secondsRemaining % 60
    val formattedTime = String.format("%02d:%02d", minutes, seconds)
    val progress = if (viewModel.totalSeconds > 0) {
        (viewModel.totalSeconds - viewModel.secondsRemaining).toFloat() / viewModel.totalSeconds.toFloat()
    } else 0f

    val scrollState = rememberScrollState()

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBackground)
            .verticalScroll(scrollState)
            .padding(horizontal = 20.dp, vertical = 20.dp)
            .testTag("study_timer_screen"),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Top Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Study Timer",
                    style = MaterialTheme.typography.displayMedium,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
                Text(
                    text = "Distraction-free focus zone",
                    style = MaterialTheme.typography.labelSmall,
                    color = TextSecondary
                )
            }

            Surface(
                color = when (viewModel.timerStatus) {
                    TimerStatus.RUNNING -> EmeraldSuccess.copy(alpha = 0.15f)
                    TimerStatus.PAUSED -> FlameOrange.copy(alpha = 0.15f)
                    else -> FrostedWhite8
                },
                shape = RoundedCornerShape(12.dp),
                border = androidx.compose.foundation.BorderStroke(
                    1.dp,
                    when (viewModel.timerStatus) {
                        TimerStatus.RUNNING -> EmeraldSuccess.copy(alpha = 0.3f)
                        TimerStatus.PAUSED -> FlameOrange.copy(alpha = 0.3f)
                        else -> FrostedWhite10
                    }
                )
            ) {
                Text(
                    text = when (viewModel.timerStatus) {
                        TimerStatus.RUNNING -> "ACTIVE"
                        TimerStatus.PAUSED -> "PAUSED"
                        else -> "STANDBY"
                    },
                    color = when (viewModel.timerStatus) {
                        TimerStatus.RUNNING -> EmeraldSuccess
                        TimerStatus.PAUSED -> FlameOrange
                        else -> TextSecondary
                    },
                    style = MaterialTheme.typography.labelSmall,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp,
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Mode Selectors: Focus (25m), Short Break (5m), Long Break (15m)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(16.dp))
                .background(FrostedWhite5)
                .border(1.dp, FrostedWhite10, RoundedCornerShape(16.dp))
                .padding(4.dp),
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            TimerModePill(
                label = "Focus (25m)",
                isSelected = viewModel.timerMode == "Focus",
                onClick = { viewModel.setTimerConfiguration("Focus", 25) },
                modifier = Modifier.weight(1f)
            )
            TimerModePill(
                label = "Short Break (5m)",
                isSelected = viewModel.timerMode == "Short Break",
                onClick = { viewModel.setTimerConfiguration("Short Break", 5) },
                modifier = Modifier.weight(1f)
            )
            TimerModePill(
                label = "Long Break (15m)",
                isSelected = viewModel.timerMode == "Long Break",
                onClick = { viewModel.setTimerConfiguration("Long Break", 15) },
                modifier = Modifier.weight(1f)
            )
        }

        Spacer(modifier = Modifier.height(18.dp))

        // Subject & Topic Pickers
        GlassCard(modifier = Modifier.fillMaxWidth()) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                // Subject Dropdown
                ExposedDropdownMenuBox(
                    expanded = showSubjectMenu,
                    onExpandedChange = { if (viewModel.timerStatus != TimerStatus.RUNNING) showSubjectMenu = it },
                    modifier = Modifier.weight(1f)
                ) {
                    OutlinedTextField(
                        value = viewModel.selectedTimerSubject,
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Subject") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = showSubjectMenu) },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = AccentPrimary,
                            unfocusedBorderColor = DarkSurfaceBorder,
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary
                        ),
                        modifier = Modifier
                            .menuAnchor()
                            .fillMaxWidth()
                            .testTag("timer_subject_select")
                    )
                    ExposedDropdownMenu(
                        expanded = showSubjectMenu,
                        onDismissRequest = { showSubjectMenu = false },
                        modifier = Modifier.background(DarkSurfaceElevated)
                    ) {
                        val availableSubjects = if (subjects.isEmpty()) listOf("Physics", "Mathematics", "Chemistry") else subjects.map { it.name }
                        availableSubjects.forEach { sub ->
                            DropdownMenuItem(
                                text = { Text(sub, color = TextPrimary) },
                                onClick = {
                                    viewModel.selectedTimerSubject = sub
                                    val firstTopic = topics.find { it.subjectName.equals(sub, ignoreCase = true) }?.name ?: "General Study"
                                    viewModel.selectedTimerTopic = firstTopic
                                    showSubjectMenu = false
                                }
                            )
                        }
                    }
                }

                // Topic Dropdown
                ExposedDropdownMenuBox(
                    expanded = showTopicMenu,
                    onExpandedChange = { if (viewModel.timerStatus != TimerStatus.RUNNING) showTopicMenu = it },
                    modifier = Modifier.weight(1f)
                ) {
                    OutlinedTextField(
                        value = viewModel.selectedTimerTopic,
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Topic") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = showTopicMenu) },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = AccentPrimary,
                            unfocusedBorderColor = DarkSurfaceBorder,
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary
                        ),
                        modifier = Modifier
                            .menuAnchor()
                            .fillMaxWidth()
                            .testTag("timer_topic_select")
                    )
                    ExposedDropdownMenu(
                        expanded = showTopicMenu,
                        onDismissRequest = { showTopicMenu = false },
                        modifier = Modifier.background(DarkSurfaceElevated)
                    ) {
                        val availableTopics = if (filteredTopics.isEmpty()) listOf("General Review", "Practice Questions") else filteredTopics.map { it.name }
                        availableTopics.forEach { top ->
                            DropdownMenuItem(
                                text = { Text(top, color = TextPrimary) },
                                onClick = {
                                    viewModel.selectedTimerTopic = top
                                    showTopicMenu = false
                                }
                            )
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(28.dp))

        // Center Countdown Display with Circular Ring
        Box(
            modifier = Modifier
                .size(240.dp)
                .testTag("timer_clock_circle"),
            contentAlignment = Alignment.Center
        ) {
            CircularProgressRing(
                progress = progress,
                modifier = Modifier.fillMaxSize(),
                strokeWidth = 12.dp,
                progressColor = if (viewModel.timerMode == "Focus") AccentPrimary else AccentSecondary
            )

            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = formattedTime,
                    style = MaterialTheme.typography.displayLarge.copy(fontSize = 46.sp),
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary,
                    letterSpacing = 2.sp
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "${viewModel.selectedTimerSubject} • ${viewModel.selectedTimerTopic}",
                    style = MaterialTheme.typography.labelSmall,
                    color = AccentSecondary,
                    textAlign = TextAlign.Center,
                    maxLines = 1
                )
            }
        }

        Spacer(modifier = Modifier.height(32.dp))

        // Timer Controls: Start, Pause, Resume, Finish, Cancel
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            when (viewModel.timerStatus) {
                TimerStatus.IDLE -> {
                    Button(
                        onClick = { viewModel.startTimer() },
                        colors = ButtonDefaults.buttonColors(containerColor = AccentPrimary),
                        shape = RoundedCornerShape(16.dp),
                        contentPadding = PaddingValues(horizontal = 36.dp, vertical = 14.dp),
                        modifier = Modifier.testTag("timer_start_btn")
                    ) {
                        Icon(imageVector = Icons.Filled.PlayArrow, contentDescription = null, tint = Color.White)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Start Session", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                    }
                }
                TimerStatus.RUNNING -> {
                    FilledTonalButton(
                        onClick = { viewModel.pauseTimer() },
                        colors = ButtonDefaults.filledTonalButtonColors(
                            containerColor = AmberWarning.copy(alpha = 0.2f),
                            contentColor = AmberWarning
                        ),
                        shape = RoundedCornerShape(14.dp),
                        contentPadding = PaddingValues(horizontal = 24.dp, vertical = 12.dp),
                        modifier = Modifier.testTag("timer_pause_btn")
                    ) {
                        Icon(imageVector = Icons.Filled.Pause, contentDescription = null)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Pause", fontWeight = FontWeight.Bold)
                    }

                    Spacer(modifier = Modifier.width(12.dp))

                    Button(
                        onClick = { viewModel.finishSession(isNaturalFinish = false) },
                        colors = ButtonDefaults.buttonColors(containerColor = EmeraldSuccess),
                        shape = RoundedCornerShape(14.dp),
                        contentPadding = PaddingValues(horizontal = 24.dp, vertical = 12.dp),
                        modifier = Modifier.testTag("timer_finish_btn")
                    ) {
                        Icon(imageVector = Icons.Filled.Check, contentDescription = null, tint = Color.White)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Finish", fontWeight = FontWeight.Bold)
                    }

                    Spacer(modifier = Modifier.width(12.dp))

                    IconButton(
                        onClick = { viewModel.cancelTimer() },
                        modifier = Modifier.testTag("timer_cancel_btn")
                    ) {
                        Icon(imageVector = Icons.Outlined.Close, contentDescription = "Cancel", tint = TextMuted)
                    }
                }
                TimerStatus.PAUSED -> {
                    Button(
                        onClick = { viewModel.resumeTimer() },
                        colors = ButtonDefaults.buttonColors(containerColor = AccentPrimary),
                        shape = RoundedCornerShape(14.dp),
                        contentPadding = PaddingValues(horizontal = 26.dp, vertical = 12.dp),
                        modifier = Modifier.testTag("timer_resume_btn")
                    ) {
                        Icon(imageVector = Icons.Filled.PlayArrow, contentDescription = null)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Resume", fontWeight = FontWeight.Bold)
                    }

                    Spacer(modifier = Modifier.width(12.dp))

                    FilledTonalButton(
                        onClick = { viewModel.finishSession(isNaturalFinish = false) },
                        colors = ButtonDefaults.filledTonalButtonColors(
                            containerColor = EmeraldSuccess.copy(alpha = 0.2f),
                            contentColor = EmeraldSuccess
                        ),
                        shape = RoundedCornerShape(14.dp),
                        contentPadding = PaddingValues(horizontal = 22.dp, vertical = 12.dp),
                        modifier = Modifier.testTag("timer_finish_paused_btn")
                    ) {
                        Icon(imageVector = Icons.Filled.Check, contentDescription = null)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Finish", fontWeight = FontWeight.Bold)
                    }

                    Spacer(modifier = Modifier.width(12.dp))

                    IconButton(
                        onClick = { viewModel.cancelTimer() },
                        modifier = Modifier.testTag("timer_cancel_paused_btn")
                    ) {
                        Icon(imageVector = Icons.Outlined.Close, contentDescription = "Cancel", tint = TextMuted)
                    }
                }
                TimerStatus.FINISHED -> {
                    Button(
                        onClick = { viewModel.startTimer() },
                        colors = ButtonDefaults.buttonColors(containerColor = AccentPrimary),
                        shape = RoundedCornerShape(16.dp),
                        contentPadding = PaddingValues(horizontal = 32.dp, vertical = 14.dp)
                    ) {
                        Text("Start Another Session", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(28.dp))

        // Distraction-free tip
        Surface(
            color = DarkSurfaceElevated,
            shape = RoundedCornerShape(12.dp),
            border = androidx.compose.foundation.BorderStroke(1.dp, DarkSurfaceBorder)
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Filled.Lightbulb,
                    contentDescription = null,
                    tint = AmberWarning,
                    modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(10.dp))
                Text(
                    text = "Pro Tip: Keep phone face down and conquer one specific concept per block.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = TextSecondary,
                    fontSize = 12.sp
                )
            }
        }
    }

    // --- Post-Session Reflection Dialog ---
    if (viewModel.showPostSessionDialog) {
        AlertDialog(
            onDismissRequest = { viewModel.dismissPostSessionDialog() },
            title = {
                Column {
                    Text(
                        text = "Session complete.",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = "How did that session feel?",
                        style = MaterialTheme.typography.bodyMedium,
                        color = TextSecondary
                    )
                }
            },
            text = {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    // Focus Rating 1-5 Stars
                    Text(
                        text = "Focus Rating",
                        style = MaterialTheme.typography.labelMedium,
                        color = TextPrimary,
                        fontWeight = FontWeight.SemiBold
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        (1..5).forEach { star ->
                            IconButton(
                                onClick = { viewModel.postSessionRating = star },
                                modifier = Modifier.size(36.dp).testTag("star_rating_$star")
                            ) {
                                Icon(
                                    imageVector = if (star <= viewModel.postSessionRating) Icons.Filled.Star else Icons.Outlined.StarBorder,
                                    contentDescription = "Rating $star",
                                    tint = if (star <= viewModel.postSessionRating) AmberWarning else TextMuted
                                )
                            }
                        }
                    }

                    // Questions Attempted & Questions Correct Stepper
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Attempted", style = MaterialTheme.typography.labelSmall, color = TextSecondary)
                            Spacer(modifier = Modifier.height(4.dp))
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                IconButton(
                                    onClick = { if (viewModel.postSessionQuestionsAttempted > 0) viewModel.postSessionQuestionsAttempted-- },
                                    modifier = Modifier.size(32.dp)
                                ) {
                                    Icon(Icons.Filled.Remove, contentDescription = "Decrease", tint = TextPrimary)
                                }
                                Text(
                                    text = "${viewModel.postSessionQuestionsAttempted}",
                                    style = MaterialTheme.typography.titleMedium,
                                    color = TextPrimary,
                                    modifier = Modifier.padding(horizontal = 8.dp)
                                )
                                IconButton(
                                    onClick = { viewModel.postSessionQuestionsAttempted++ },
                                    modifier = Modifier.size(32.dp)
                                ) {
                                    Icon(Icons.Filled.Add, contentDescription = "Increase", tint = TextPrimary)
                                }
                            }
                        }

                        Column(modifier = Modifier.weight(1f)) {
                            Text("Correct", style = MaterialTheme.typography.labelSmall, color = TextSecondary)
                            Spacer(modifier = Modifier.height(4.dp))
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                IconButton(
                                    onClick = { if (viewModel.postSessionQuestionsCorrect > 0) viewModel.postSessionQuestionsCorrect-- },
                                    modifier = Modifier.size(32.dp)
                                ) {
                                    Icon(Icons.Filled.Remove, contentDescription = "Decrease", tint = TextPrimary)
                                }
                                Text(
                                    text = "${viewModel.postSessionQuestionsCorrect}",
                                    style = MaterialTheme.typography.titleMedium,
                                    color = EmeraldSuccess,
                                    modifier = Modifier.padding(horizontal = 8.dp)
                                )
                                IconButton(
                                    onClick = {
                                        if (viewModel.postSessionQuestionsCorrect < viewModel.postSessionQuestionsAttempted) {
                                            viewModel.postSessionQuestionsCorrect++
                                        }
                                    },
                                    modifier = Modifier.size(32.dp)
                                ) {
                                    Icon(Icons.Filled.Add, contentDescription = "Increase", tint = TextPrimary)
                                }
                            }
                        }
                    }

                    // Optional Notes
                    OutlinedTextField(
                        value = viewModel.postSessionNotes,
                        onValueChange = { viewModel.postSessionNotes = it },
                        label = { Text("Optional Notes") },
                        placeholder = { Text("What did you solve or derive?") },
                        maxLines = 3,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = AccentPrimary,
                            unfocusedBorderColor = DarkSurfaceBorder,
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary
                        ),
                        modifier = Modifier.fillMaxWidth().testTag("post_session_notes_input")
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = { viewModel.submitSessionEvaluation() },
                    colors = ButtonDefaults.buttonColors(containerColor = AccentPrimary),
                    modifier = Modifier.testTag("submit_session_eval_btn")
                ) {
                    Text("Save Log")
                }
            },
            dismissButton = {
                TextButton(onClick = { viewModel.dismissPostSessionDialog() }) {
                    Text("Skip", color = TextSecondary)
                }
            },
            containerColor = DarkSurfaceElevated
        )
    }
}

@Composable
private fun TimerModePill(
    label: String,
    isSelected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(12.dp))
            .background(if (isSelected) AccentPrimary else Color.Transparent)
            .clickable(onClick = onClick)
            .padding(vertical = 10.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall,
            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
            color = if (isSelected) Color.White else TextSecondary
        )
    }
}
