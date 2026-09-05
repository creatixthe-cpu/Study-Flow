package com.example.ui.screens.dashboard

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.*
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
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.data.local.entities.TaskEntity
import com.example.ui.MainViewModel
import com.example.ui.components.*
import com.example.ui.navigation.Screen
import com.example.ui.theme.*
import java.util.Calendar

@Composable
fun DashboardScreen(
    viewModel: MainViewModel,
    onNavigateToStudy: () -> Unit,
    onNavigateToPlanner: () -> Unit,
    modifier: Modifier = Modifier
) {
    val tasks by viewModel.tasks.collectAsStateWithLifecycle()
    val todayMinutes by viewModel.todayStudiedMinutes.collectAsStateWithLifecycle()
    val todaySessions by viewModel.todaySessionsCount.collectAsStateWithLifecycle()
    val streakDays by viewModel.currentStreakDays.collectAsStateWithLifecycle()
    val weeklyData by viewModel.weeklyStudyData.collectAsStateWithLifecycle()

    val completedTasksCount = tasks.count { it.isCompleted }

    // Dialogs
    var taskToEdit by remember { mutableStateOf<TaskEntity?>(null) }
    var taskToDelete by remember { mutableStateOf<TaskEntity?>(null) }

    val greetingTime = remember {
        val hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)
        when (hour) {
            in 5..11 -> "Good morning"
            in 12..17 -> "Good afternoon"
            else -> "Good evening"
        }
    }

    val todayFormattedDate = remember {
        val sdf = java.text.SimpleDateFormat("EEEE, MMM d", java.util.Locale.getDefault())
        sdf.format(java.util.Date())
    }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBackground)
            .testTag("dashboard_screen"),
        contentPadding = PaddingValues(horizontal = 20.dp, vertical = 20.dp)
    ) {
        // Header Section matching Frosted Glass design
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Bottom
            ) {
                Column {
                    Text(
                        text = todayFormattedDate.uppercase(),
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.SemiBold,
                        color = AccentPrimary,
                        letterSpacing = 2.sp,
                        fontSize = 11.sp
                    )
                    Spacer(modifier = Modifier.height(3.dp))
                    Text(
                        text = "$greetingTime, ${viewModel.userName}",
                        style = MaterialTheme.typography.headlineMedium,
                        fontWeight = FontWeight.Medium,
                        color = TextPrimary,
                        letterSpacing = (-0.5).sp
                    )
                }

                // Frosted Fire Streak Pill
                FrostedPill(
                    modifier = Modifier.testTag("dashboard_streak_pill")
                ) {
                    Text(
                        text = "🔥",
                        fontSize = 14.sp
                    )
                    Text(
                        text = "$streakDays",
                        color = FlameOrange,
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp
                    )
                }
            }
            Spacer(modifier = Modifier.height(20.dp))
        }

        // Metrics Grid (Frosted Glass study time with progress bar + sessions trend)
        item {
            val goal = viewModel.userGoalMinutes.coerceAtLeast(1)
            val progressFraction = (todayMinutes.toFloat() / goal).coerceIn(0f, 1f)
            val timeText = if (todayMinutes >= 60) "${todayMinutes / 60}h ${todayMinutes % 60}m" else "${todayMinutes}m"
            val sessionsFormatted = String.format(java.util.Locale.US, "%02d", todaySessions)

            Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    StatMetricCard(
                        title = "Study Time",
                        value = timeText,
                        subtext = "Goal: ${goal}m",
                        progressFraction = progressFraction,
                        accentColor = AccentPrimary,
                        modifier = Modifier.weight(1f)
                    )
                    StatMetricCard(
                        title = "Sessions",
                        value = sessionsFormatted,
                        subtext = "Completed today",
                        trendText = if (todaySessions > 0) "+$todaySessions today" else "Start session",
                        accentColor = EmeraldSuccess,
                        modifier = Modifier.weight(1f)
                    )
                }
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    StatMetricCard(
                        title = "Tasks Done",
                        value = "$completedTasksCount/${tasks.size}",
                        subtext = "${tasks.count { !it.isCompleted }} remaining",
                        icon = Icons.Filled.AssignmentTurnedIn,
                        accentColor = EmeraldSuccess,
                        modifier = Modifier.weight(1f)
                    )
                    StatMetricCard(
                        title = "Current Streak",
                        value = "$streakDays ${if (streakDays == 1) "day" else "days"}",
                        subtext = "Keep momentum 🔥",
                        icon = Icons.Filled.LocalFireDepartment,
                        accentColor = FlameOrange,
                        modifier = Modifier.weight(1f)
                    )
                }
            }
            Spacer(modifier = Modifier.height(24.dp))
        }

        // Today's Plan Section
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Today's Plan",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Medium,
                        color = TextPrimary,
                        fontSize = 18.sp
                    )
                    Text(
                        text = "High priority focus tasks",
                        style = MaterialTheme.typography.labelSmall,
                        color = TextSecondary
                    )
                }
                TextButton(
                    onClick = onNavigateToPlanner,
                    modifier = Modifier.testTag("dashboard_view_all_tasks_btn")
                ) {
                    Text("Edit Plan", color = AccentPrimary, fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                }
            }
            Spacer(modifier = Modifier.height(12.dp))
        }

        if (tasks.isEmpty()) {
            item {
                EmptyStateView(
                    icon = Icons.AutoMirrored.Filled.PlaylistAddCheck,
                    title = "No tasks planned yet",
                    message = "Add your first study task to organize your day.",
                    actionLabel = "Add a Task",
                    onAction = onNavigateToPlanner
                )
            }
        } else {
            val activeTasks = tasks.take(4)
            items(activeTasks, key = { it.id }) { task ->
                DashboardTaskItem(
                    task = task,
                    onToggleComplete = { viewModel.toggleTaskCompletion(task) },
                    onStartStudy = { viewModel.startStudyForTask(task) },
                    onEdit = { taskToEdit = task },
                    onDelete = { taskToDelete = task }
                )
                Spacer(modifier = Modifier.height(10.dp))
            }
        }

        // Current Priority / Start Study Session CTA from Frosted Glass theme
        item {
            Spacer(modifier = Modifier.height(8.dp))
            CurrentPriorityCard(
                title = "Start Study Session",
                subtitle = "Current Priority",
                onClick = onNavigateToStudy,
                modifier = Modifier.testTag("dashboard_start_timer_btn")
            )
            Spacer(modifier = Modifier.height(16.dp))
        }

        // Weekly Study Chart
        item {
            Spacer(modifier = Modifier.height(20.dp))
            GlassCard(modifier = Modifier.fillMaxWidth()) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Weekly Activity",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                        Text(
                            text = "Study minutes per day",
                            style = MaterialTheme.typography.labelSmall,
                            color = TextSecondary
                        )
                    }
                    Text(
                        text = "${weeklyData.sumOf { it.minutes }} mins total",
                        style = MaterialTheme.typography.labelLarge,
                        color = AccentSecondary,
                        fontWeight = FontWeight.Bold
                    )
                }
                Spacer(modifier = Modifier.height(16.dp))
                WeeklyStudyBarChart(days = weeklyData)
            }
            Spacer(modifier = Modifier.height(20.dp))
        }

        // Recommended for You (AI Study Coach)
        item {
            GlassCard(
                modifier = Modifier.fillMaxWidth(),
                borderColor = AccentPrimary.copy(alpha = 0.3f),
                backgroundColor = DarkSurfaceElevated
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(32.dp)
                                .clip(CircleShape)
                                .background(AccentPrimary.copy(alpha = 0.2f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Filled.AutoAwesome,
                                contentDescription = null,
                                tint = AccentPrimaryGlow,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = "Recommended for you",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.SemiBold,
                            color = TextPrimary
                        )
                    }

                    IconButton(
                        onClick = { viewModel.triggerAiRecommendationRefresh() },
                        modifier = Modifier.testTag("refresh_ai_coach_button")
                    ) {
                        if (viewModel.isAiCoachLoading) {
                            CircularProgressIndicator(modifier = Modifier.size(18.dp), color = AccentPrimaryGlow, strokeWidth = 2.dp)
                        } else {
                            Icon(
                                imageVector = Icons.Filled.Refresh,
                                contentDescription = "Refresh Recommendation",
                                tint = TextSecondary
                            )
                        }
                    }
                }
                Spacer(modifier = Modifier.height(10.dp))
                Text(
                    text = viewModel.aiCoachAdvice,
                    style = MaterialTheme.typography.bodyMedium,
                    color = TextPrimary.copy(alpha = 0.9f),
                    lineHeight = 20.sp
                )
            }
            Spacer(modifier = Modifier.height(28.dp))
        }
    }

    // Edit Task Dialog
    taskToEdit?.let { task ->
        var editTitle by remember { mutableStateOf(task.title) }
        var editDuration by remember { mutableStateOf(task.estimatedMinutes.toString()) }
        var editPriority by remember { mutableStateOf(task.priority) }

        AlertDialog(
            onDismissRequest = { taskToEdit = null },
            title = { Text("Edit Task", color = TextPrimary) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedTextField(
                        value = editTitle,
                        onValueChange = { editTitle = it },
                        label = { Text("Task Title") },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = AccentPrimary,
                            unfocusedBorderColor = DarkSurfaceBorder,
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary
                        ),
                        modifier = Modifier.fillMaxWidth().testTag("edit_task_title_input")
                    )
                    OutlinedTextField(
                        value = editDuration,
                        onValueChange = { editDuration = it },
                        label = { Text("Duration (minutes)") },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = AccentPrimary,
                            unfocusedBorderColor = DarkSurfaceBorder,
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary
                        ),
                        modifier = Modifier.fillMaxWidth().testTag("edit_task_duration_input")
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val dur = editDuration.toIntOrNull() ?: task.estimatedMinutes
                        viewModel.updateTask(task.copy(title = editTitle, estimatedMinutes = dur, priority = editPriority))
                        taskToEdit = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = AccentPrimary),
                    modifier = Modifier.testTag("save_edit_task_button")
                ) {
                    Text("Save")
                }
            },
            dismissButton = {
                TextButton(onClick = { taskToEdit = null }) {
                    Text("Cancel", color = TextSecondary)
                }
            },
            containerColor = DarkSurfaceElevated
        )
    }

    // Delete Task Confirmation
    taskToDelete?.let { task ->
        AlertDialog(
            onDismissRequest = { taskToDelete = null },
            title = { Text("Delete Task", color = TextPrimary) },
            text = { Text("Are you sure you want to remove '${task.title}'?", color = TextSecondary) },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.deleteTask(task)
                        taskToDelete = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = CoralPriority),
                    modifier = Modifier.testTag("confirm_delete_task_button")
                ) {
                    Text("Delete")
                }
            },
            dismissButton = {
                TextButton(onClick = { taskToDelete = null }) {
                    Text("Cancel", color = TextSecondary)
                }
            },
            containerColor = DarkSurfaceElevated
        )
    }
}

@Composable
private fun DashboardTaskItem(
    task: TaskEntity,
    onToggleComplete: () -> Unit,
    onStartStudy: () -> Unit,
    onEdit: () -> Unit,
    onDelete: () -> Unit
) {
    val (subjectBg, subjectBorder, subjectSymbol) = when (task.subject.lowercase()) {
        "physics" -> Triple(Color(0x333B82F6), Color(0x4D3B82F6), "⚛️")
        "mathematics", "math" -> Triple(Color(0x33A855F7), Color(0x4DA855F7), "∫")
        "chemistry" -> Triple(Color(0x33EAB308), Color(0x4DEAB308), "🧪")
        "computer science", "cs" -> Triple(Color(0x3310B981), Color(0x4D10B981), "💻")
        else -> Triple(Color(0x337C3AED), Color(0x4D7C3AED), "📖")
    }

    GlassCard(
        modifier = Modifier.fillMaxWidth().testTag("task_item_${task.id}"),
        cornerRadius = 24.dp,
        backgroundColor = if (task.isCompleted) FrostedWhite5.copy(alpha = 0.03f) else FrostedWhite5,
        borderColor = if (task.isCompleted) FrostedWhite10.copy(alpha = 0.05f) else FrostedWhite10
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Subject icon container from HTML
            Box(
                modifier = Modifier
                    .size(42.dp)
                    .clip(RoundedCornerShape(14.dp))
                    .background(subjectBg)
                    .border(1.dp, subjectBorder, RoundedCornerShape(14.dp)),
                contentAlignment = Alignment.Center
            ) {
                Text(text = subjectSymbol, fontSize = 18.sp)
            }
            Spacer(modifier = Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = task.title,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Medium,
                    color = if (task.isCompleted) TextMuted else TextPrimary,
                    textDecoration = if (task.isCompleted) TextDecoration.LineThrough else null,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = "${task.subject} • ${task.topic} • ${task.estimatedMinutes} min",
                    style = MaterialTheme.typography.labelSmall,
                    color = TextSecondary,
                    fontSize = 12.sp
                )
            }

            // Circular completion button matching HTML design
            Box(
                modifier = Modifier
                    .size(32.dp)
                    .clip(CircleShape)
                    .clickable(onClick = onToggleComplete)
                    .testTag("task_checkbox_${task.id}"),
                contentAlignment = Alignment.Center
            ) {
                if (task.isCompleted) {
                    Box(
                        modifier = Modifier
                            .size(24.dp)
                            .clip(CircleShape)
                            .border(2.dp, AccentPrimary, CircleShape)
                            .padding(3.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .clip(CircleShape)
                                .background(AccentPrimary)
                        )
                    }
                } else {
                    Box(
                        modifier = Modifier
                            .size(24.dp)
                            .clip(CircleShape)
                            .border(2.dp, Color.White.copy(alpha = 0.2f), CircleShape)
                    )
                }
            }

            // Action Buttons: Start Study, Edit, Delete
            Row(verticalAlignment = Alignment.CenterVertically) {
                if (!task.isCompleted) {
                    IconButton(
                        onClick = onStartStudy,
                        modifier = Modifier.size(32.dp).testTag("task_start_study_btn_${task.id}")
                    ) {
                        Icon(
                            imageVector = Icons.Filled.PlayArrow,
                            contentDescription = "Start Study",
                            tint = AccentPrimary,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
                IconButton(
                    onClick = onEdit,
                    modifier = Modifier.size(28.dp).testTag("task_edit_btn_${task.id}")
                ) {
                    Icon(
                        imageVector = Icons.Outlined.Edit,
                        contentDescription = "Edit Task",
                        tint = TextMuted,
                        modifier = Modifier.size(15.dp)
                    )
                }
                IconButton(
                    onClick = onDelete,
                    modifier = Modifier.size(28.dp).testTag("task_delete_btn_${task.id}")
                ) {
                    Icon(
                        imageVector = Icons.Outlined.Delete,
                        contentDescription = "Delete Task",
                        tint = TextMuted,
                        modifier = Modifier.size(15.dp)
                    )
                }
            }
        }
    }
}
