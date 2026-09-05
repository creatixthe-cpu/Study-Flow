package com.example.ui.screens.planner

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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.data.local.entities.TaskEntity
import com.example.ui.MainViewModel
import com.example.ui.components.EmptyStateView
import com.example.ui.components.GlassCard
import com.example.ui.components.PriorityBadge
import com.example.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PlannerScreen(
    viewModel: MainViewModel,
    onStartStudyForTask: (TaskEntity) -> Unit,
    modifier: Modifier = Modifier
) {
    val tasks by viewModel.tasks.collectAsStateWithLifecycle()
    val subjects by viewModel.subjects.collectAsStateWithLifecycle()
    val topics by viewModel.topics.collectAsStateWithLifecycle()

    var selectedTab by remember { mutableStateOf(0) } // 0: Today, 1: Upcoming, 2: Completed
    val tabs = listOf("Today", "Upcoming", "Completed")

    // Filtered tasks
    val displayedTasks = remember(tasks, selectedTab) {
        when (selectedTab) {
            0 -> tasks.filter { !it.isCompleted && (it.deadline.contains("Today", ignoreCase = true) || !it.deadline.contains("Tomorrow", ignoreCase = true)) }
            1 -> tasks.filter { !it.isCompleted && (it.deadline.contains("Tomorrow", ignoreCase = true) || it.deadline.contains("Next", ignoreCase = true)) }
            else -> tasks.filter { it.isCompleted }
        }
    }

    var showAddTaskDialog by remember { mutableStateOf(false) }
    var taskToEdit by remember { mutableStateOf<TaskEntity?>(null) }
    var taskToDelete by remember { mutableStateOf<TaskEntity?>(null) }

    Scaffold(
        modifier = modifier.fillMaxSize().testTag("planner_screen"),
        containerColor = DarkBackground,
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showAddTaskDialog = true },
                containerColor = AccentPrimary,
                contentColor = Color.White,
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.testTag("add_task_fab")
            ) {
                Icon(Icons.Filled.Add, contentDescription = "Add Task")
            }
        }
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(horizontal = 20.dp, vertical = 16.dp),
            contentPadding = PaddingValues(bottom = 72.dp)
        ) {
            // Header
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Study Planner",
                            style = MaterialTheme.typography.displayMedium,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                        Text(
                            text = "Stay ahead of your coursework deadlines",
                            style = MaterialTheme.typography.labelSmall,
                            color = TextSecondary
                        )
                    }

                    FilledTonalButton(
                        onClick = { showAddTaskDialog = true },
                        colors = ButtonDefaults.filledTonalButtonColors(
                            containerColor = FrostedWhite8,
                            contentColor = Color.White
                        ),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.testTag("new_task_btn_top")
                    ) {
                        Icon(Icons.Filled.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("New Task", fontWeight = FontWeight.Bold)
                    }
                }
                Spacer(modifier = Modifier.height(18.dp))
            }

            // Tab View: Today | Upcoming | Completed
            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(14.dp))
                        .background(FrostedWhite5)
                        .border(1.dp, FrostedWhite10, RoundedCornerShape(14.dp))
                        .padding(4.dp),
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    tabs.forEachIndexed { index, tabTitle ->
                        val isSelected = selectedTab == index
                        val count = when (index) {
                            0 -> tasks.count { !it.isCompleted && !it.deadline.contains("Tomorrow", ignoreCase = true) }
                            1 -> tasks.count { !it.isCompleted && it.deadline.contains("Tomorrow", ignoreCase = true) }
                            else -> tasks.count { it.isCompleted }
                        }

                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(10.dp))
                                .background(if (isSelected) AccentPrimary else Color.Transparent)
                                .clickable { selectedTab = index }
                                .padding(vertical = 10.dp)
                                .testTag("planner_tab_$index"),
                            contentAlignment = Alignment.Center
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = tabTitle,
                                    style = MaterialTheme.typography.labelMedium,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                    color = if (isSelected) Color.White else TextSecondary
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "($count)",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = if (isSelected) Color.White.copy(alpha = 0.8f) else TextMuted
                                )
                            }
                        }
                    }
                }
                Spacer(modifier = Modifier.height(18.dp))
            }

            // Task List or Empty State
            if (displayedTasks.isEmpty()) {
                item {
                    EmptyStateView(
                        icon = if (selectedTab == 2) Icons.Filled.CheckCircle else Icons.Filled.EventAvailable,
                        title = when (selectedTab) {
                            0 -> "No tasks scheduled for today"
                            1 -> "No upcoming deadlines queued"
                            else -> "No completed tasks yet"
                        },
                        message = when (selectedTab) {
                            0 -> "Tap 'New Task' to plan your study sessions."
                            1 -> "Add coursework, problem sets, or readings for this week."
                            else -> "Check off tasks as you finish your study sessions."
                        },
                        actionLabel = if (selectedTab != 2) "Create Task" else null,
                        onAction = { showAddTaskDialog = true }
                    )
                }
            } else {
                items(displayedTasks, key = { it.id }) { task ->
                    PlannerTaskCard(
                        task = task,
                        onToggle = { viewModel.toggleTaskCompletion(task) },
                        onStart = { onStartStudyForTask(task) },
                        onEdit = { taskToEdit = task },
                        onDelete = { taskToDelete = task }
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                }
            }
        }
    }

    // --- Add Task Dialog ---
    if (showAddTaskDialog) {
        var title by remember { mutableStateOf("") }
        var subject by remember { mutableStateOf(subjects.firstOrNull()?.name ?: "Physics") }
        var topic by remember { mutableStateOf("General") }
        var deadline by remember { mutableStateOf("Today, 8:00 PM") }
        var priority by remember { mutableStateOf("High") }
        var duration by remember { mutableStateOf("45") }

        AlertDialog(
            onDismissRequest = { showAddTaskDialog = false },
            title = { Text("Add Study Task", color = TextPrimary) },
            text = {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedTextField(
                        value = title,
                        onValueChange = { title = it },
                        label = { Text("Task Title") },
                        placeholder = { Text("e.g. Master Gauss Law problems") },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = AccentPrimary,
                            unfocusedBorderColor = DarkSurfaceBorder,
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary
                        ),
                        modifier = Modifier.fillMaxWidth().testTag("add_task_title_field")
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedTextField(
                            value = subject,
                            onValueChange = { subject = it },
                            label = { Text("Subject") },
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = AccentPrimary,
                                unfocusedBorderColor = DarkSurfaceBorder,
                                focusedTextColor = TextPrimary,
                                unfocusedTextColor = TextPrimary
                            ),
                            modifier = Modifier.weight(1f).testTag("add_task_subject_field")
                        )
                        OutlinedTextField(
                            value = topic,
                            onValueChange = { topic = it },
                            label = { Text("Topic") },
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = AccentPrimary,
                                unfocusedBorderColor = DarkSurfaceBorder,
                                focusedTextColor = TextPrimary,
                                unfocusedTextColor = TextPrimary
                            ),
                            modifier = Modifier.weight(1f).testTag("add_task_topic_field")
                        )
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedTextField(
                            value = deadline,
                            onValueChange = { deadline = it },
                            label = { Text("Deadline") },
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = AccentPrimary,
                                unfocusedBorderColor = DarkSurfaceBorder,
                                focusedTextColor = TextPrimary,
                                unfocusedTextColor = TextPrimary
                            ),
                            modifier = Modifier.weight(1.2f).testTag("add_task_deadline_field")
                        )
                        OutlinedTextField(
                            value = duration,
                            onValueChange = { duration = it },
                            label = { Text("Mins") },
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = AccentPrimary,
                                unfocusedBorderColor = DarkSurfaceBorder,
                                focusedTextColor = TextPrimary,
                                unfocusedTextColor = TextPrimary
                            ),
                            modifier = Modifier.weight(0.8f).testTag("add_task_duration_field")
                        )
                    }

                    // Priority Chips
                    Text("Priority", style = MaterialTheme.typography.labelSmall, color = TextSecondary)
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        listOf("High", "Medium", "Low").forEach { p ->
                            val isPSelected = priority == p
                            Surface(
                                color = if (isPSelected) AccentPrimary else DarkSurface,
                                shape = RoundedCornerShape(8.dp),
                                border = androidx.compose.foundation.BorderStroke(1.dp, if (isPSelected) AccentPrimary else DarkSurfaceBorder),
                                modifier = Modifier
                                    .weight(1f)
                                    .clickable { priority = p }
                            ) {
                                Text(
                                    text = p,
                                    color = if (isPSelected) Color.White else TextSecondary,
                                    textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                                    style = MaterialTheme.typography.labelMedium,
                                    modifier = Modifier.padding(vertical = 8.dp)
                                )
                            }
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (title.isNotBlank()) {
                            val dur = duration.toIntOrNull() ?: 45
                            viewModel.addTask(title, subject, topic, deadline, priority, dur)
                            showAddTaskDialog = false
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = AccentPrimary),
                    modifier = Modifier.testTag("submit_add_task_btn")
                ) {
                    Text("Add Task")
                }
            },
            dismissButton = {
                TextButton(onClick = { showAddTaskDialog = false }) {
                    Text("Cancel", color = TextSecondary)
                }
            },
            containerColor = DarkSurfaceElevated
        )
    }

    // --- Edit Task Dialog ---
    taskToEdit?.let { task ->
        var editTitle by remember { mutableStateOf(task.title) }
        var editSubject by remember { mutableStateOf(task.subject) }
        var editTopic by remember { mutableStateOf(task.topic) }
        var editDeadline by remember { mutableStateOf(task.deadline) }
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
                        modifier = Modifier.fillMaxWidth()
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedTextField(
                            value = editDeadline,
                            onValueChange = { editDeadline = it },
                            label = { Text("Deadline") },
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = AccentPrimary,
                                unfocusedBorderColor = DarkSurfaceBorder,
                                focusedTextColor = TextPrimary,
                                unfocusedTextColor = TextPrimary
                            ),
                            modifier = Modifier.weight(1.2f)
                        )
                        OutlinedTextField(
                            value = editDuration,
                            onValueChange = { editDuration = it },
                            label = { Text("Mins") },
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = AccentPrimary,
                                unfocusedBorderColor = DarkSurfaceBorder,
                                focusedTextColor = TextPrimary,
                                unfocusedTextColor = TextPrimary
                            ),
                            modifier = Modifier.weight(0.8f)
                        )
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val dur = editDuration.toIntOrNull() ?: task.estimatedMinutes
                        viewModel.updateTask(task.copy(title = editTitle, deadline = editDeadline, estimatedMinutes = dur))
                        taskToEdit = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = AccentPrimary)
                ) {
                    Text("Save Changes")
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

    // --- Delete Task Confirmation ---
    taskToDelete?.let { task ->
        AlertDialog(
            onDismissRequest = { taskToDelete = null },
            title = { Text("Delete Task", color = TextPrimary) },
            text = { Text("Remove '${task.title}' permanently?", color = TextSecondary) },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.deleteTask(task)
                        taskToDelete = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = CoralPriority)
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
private fun PlannerTaskCard(
    task: TaskEntity,
    onToggle: () -> Unit,
    onStart: () -> Unit,
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
        modifier = Modifier.fillMaxWidth().testTag("planner_task_${task.id}"),
        cornerRadius = 24.dp,
        backgroundColor = if (task.isCompleted) FrostedWhite5.copy(alpha = 0.03f) else FrostedWhite5,
        borderColor = if (task.isCompleted) FrostedWhite10.copy(alpha = 0.05f) else FrostedWhite10
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Subject icon container
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
                    maxLines = 1
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = "${task.subject} • ${task.topic} • ${task.estimatedMinutes} min",
                    style = MaterialTheme.typography.labelSmall,
                    color = TextSecondary,
                    fontSize = 12.sp
                )
            }

            // Circular completion button
            Box(
                modifier = Modifier
                    .size(32.dp)
                    .clip(CircleShape)
                    .clickable(onClick = onToggle)
                    .testTag("planner_task_checkbox_${task.id}"),
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

            Row(verticalAlignment = Alignment.CenterVertically) {
                if (!task.isCompleted) {
                    IconButton(onClick = onStart, modifier = Modifier.size(32.dp)) {
                        Icon(
                            imageVector = Icons.Filled.PlayArrow,
                            contentDescription = "Start Timer",
                            tint = AccentPrimary,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
                IconButton(onClick = onEdit, modifier = Modifier.size(28.dp)) {
                    Icon(Icons.Outlined.Edit, contentDescription = "Edit", tint = TextMuted, modifier = Modifier.size(15.dp))
                }
                IconButton(onClick = onDelete, modifier = Modifier.size(28.dp)) {
                    Icon(Icons.Outlined.Delete, contentDescription = "Delete", tint = TextMuted, modifier = Modifier.size(15.dp))
                }
            }
        }
    }
}
