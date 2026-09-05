package com.example.ui.screens.topics

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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.data.local.entities.SubjectEntity
import com.example.data.local.entities.TopicEntity
import com.example.domain.ai.AiResult
import com.example.ui.MainViewModel
import com.example.ui.components.EmptyStateView
import com.example.ui.components.GlassCard
import com.example.ui.navigation.Screen
import com.example.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun TopicsScreen(
    viewModel: MainViewModel,
    modifier: Modifier = Modifier
) {
    val subjects by viewModel.subjects.collectAsStateWithLifecycle()
    val topics by viewModel.topics.collectAsStateWithLifecycle()
    val scope = rememberCoroutineScope()

    var showAddSubjectDialog by remember { mutableStateOf(false) }
    var showAddTopicDialogForSubject by remember { mutableStateOf<String?>(null) }
    var topicToEdit by remember { mutableStateOf<TopicEntity?>(null) }
    var topicToDelete by remember { mutableStateOf<TopicEntity?>(null) }
    var subjectToDelete by remember { mutableStateOf<SubjectEntity?>(null) }

    // AI Explanation Dialog
    var aiExplanationTitle by remember { mutableStateOf<String?>(null) }
    var aiExplanationText by remember { mutableStateOf<String?>(null) }
    var isAiExplaining by remember { mutableStateOf(false) }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBackground)
            .testTag("topics_screen"),
        contentPadding = PaddingValues(horizontal = 20.dp, vertical = 20.dp)
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
                        text = "Curriculum Topics",
                        style = MaterialTheme.typography.displayMedium,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )
                    Text(
                        text = "Track syllabus coverage and master core concepts",
                        style = MaterialTheme.typography.labelSmall,
                        color = TextSecondary
                    )
                }

                Button(
                    onClick = { showAddSubjectDialog = true },
                    colors = ButtonDefaults.buttonColors(containerColor = AccentPrimary),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.testTag("add_subject_btn")
                ) {
                    Icon(Icons.Filled.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Subject", fontWeight = FontWeight.Bold)
                }
            }
            Spacer(modifier = Modifier.height(20.dp))
        }

        if (subjects.isEmpty()) {
            item {
                EmptyStateView(
                    icon = Icons.AutoMirrored.Filled.MenuBook,
                    title = "No subjects added",
                    message = "Add your school or university subjects to organize your study topics.",
                    actionLabel = "Add Subject",
                    onAction = { showAddSubjectDialog = true }
                )
            }
        } else {
            items(subjects, key = { it.id }) { subject ->
                val subjectTopics = topics.filter { it.subjectName.equals(subject.name, ignoreCase = true) }
                SubjectGroupCard(
                    subject = subject,
                    topics = subjectTopics,
                    onAddTopic = { showAddTopicDialogForSubject = subject.name },
                    onDeleteSubject = { subjectToDelete = subject },
                    onStudyTopic = { topic ->
                        viewModel.selectedTimerSubject = subject.name
                        viewModel.selectedTimerTopic = topic.name
                        viewModel.setTimerConfiguration("Focus", 25)
                        viewModel.navigateTo(Screen.Study)
                    },
                    onAiExplain = { topic ->
                        aiExplanationTitle = "${topic.name} • ${subject.name}"
                        isAiExplaining = true
                        scope.launch {
                            val res = viewModel.aiService.getTopicExplanation(topic.name, subject.name)
                            when (res) {
                                is AiResult.Success -> aiExplanationText = res.data
                                is AiResult.Error -> aiExplanationText = "Error: ${res.message}"
                                else -> {}
                            }
                            isAiExplaining = false
                        }
                    },
                    onEditTopic = { topicToEdit = it },
                    onDeleteTopic = { topicToDelete = it }
                )
                Spacer(modifier = Modifier.height(16.dp))
            }
        }
    }

    // Add Subject Dialog
    if (showAddSubjectDialog) {
        var newSubjectName by remember { mutableStateOf("") }
        var selectedColor by remember { mutableStateOf("#6366F1") }
        val colorPalette = listOf("#6366F1", "#06B6D4", "#10B981", "#F59E0B", "#EC4899", "#8B5CF6")

        AlertDialog(
            onDismissRequest = { showAddSubjectDialog = false },
            title = { Text("Add New Subject", color = TextPrimary) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    OutlinedTextField(
                        value = newSubjectName,
                        onValueChange = { newSubjectName = it },
                        label = { Text("Subject Name") },
                        placeholder = { Text("e.g. Biology, Calculus") },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = AccentPrimary,
                            unfocusedBorderColor = DarkSurfaceBorder,
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary
                        ),
                        modifier = Modifier.fillMaxWidth().testTag("add_subject_name_input")
                    )
                    Text("Theme Color", style = MaterialTheme.typography.labelSmall, color = TextSecondary)
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        colorPalette.forEach { hex ->
                            val color = Color(android.graphics.Color.parseColor(hex))
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .clip(CircleShape)
                                    .background(color)
                                    .clickable { selectedColor = hex }
                                    .then(
                                        if (selectedColor == hex) Modifier.border(2.dp, Color.White, CircleShape) else Modifier
                                    )
                            )
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (newSubjectName.isNotBlank()) {
                            viewModel.addSubject(newSubjectName, selectedColor)
                            showAddSubjectDialog = false
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = AccentPrimary),
                    modifier = Modifier.testTag("submit_add_subject_btn")
                ) {
                    Text("Add")
                }
            },
            dismissButton = {
                TextButton(onClick = { showAddSubjectDialog = false }) {
                    Text("Cancel", color = TextSecondary)
                }
            },
            containerColor = DarkSurfaceElevated
        )
    }

    // Add Topic Dialog
    showAddTopicDialogForSubject?.let { subName ->
        var newTopicName by remember { mutableStateOf("") }
        var targetMinutes by remember { mutableStateOf("120") }

        AlertDialog(
            onDismissRequest = { showAddTopicDialogForSubject = null },
            title = { Text("Add Topic to $subName", color = TextPrimary) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedTextField(
                        value = newTopicName,
                        onValueChange = { newTopicName = it },
                        label = { Text("Topic Name") },
                        placeholder = { Text("e.g. Organic Chemistry Reactions") },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = AccentPrimary,
                            unfocusedBorderColor = DarkSurfaceBorder,
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary
                        ),
                        modifier = Modifier.fillMaxWidth().testTag("add_topic_name_input")
                    )
                    OutlinedTextField(
                        value = targetMinutes,
                        onValueChange = { targetMinutes = it },
                        label = { Text("Goal Study Time (minutes)") },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = AccentPrimary,
                            unfocusedBorderColor = DarkSurfaceBorder,
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (newTopicName.isNotBlank()) {
                            val mins = targetMinutes.toIntOrNull() ?: 120
                            viewModel.addTopic(subName, newTopicName, mins)
                            showAddTopicDialogForSubject = null
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = AccentPrimary),
                    modifier = Modifier.testTag("submit_add_topic_btn")
                ) {
                    Text("Add Topic")
                }
            },
            dismissButton = {
                TextButton(onClick = { showAddTopicDialogForSubject = null }) {
                    Text("Cancel", color = TextSecondary)
                }
            },
            containerColor = DarkSurfaceElevated
        )
    }

    // Edit Topic Dialog
    topicToEdit?.let { topic ->
        var editName by remember { mutableStateOf(topic.name) }
        var editTarget by remember { mutableStateOf(topic.targetMinutes.toString()) }

        AlertDialog(
            onDismissRequest = { topicToEdit = null },
            title = { Text("Edit Topic", color = TextPrimary) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedTextField(
                        value = editName,
                        onValueChange = { editName = it },
                        label = { Text("Topic Name") },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = AccentPrimary,
                            unfocusedBorderColor = DarkSurfaceBorder,
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = editTarget,
                        onValueChange = { editTarget = it },
                        label = { Text("Target Minutes") },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = AccentPrimary,
                            unfocusedBorderColor = DarkSurfaceBorder,
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val mins = editTarget.toIntOrNull() ?: topic.targetMinutes
                        viewModel.updateTopic(topic.copy(name = editName, targetMinutes = mins))
                        topicToEdit = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = AccentPrimary)
                ) {
                    Text("Save")
                }
            },
            dismissButton = {
                TextButton(onClick = { topicToEdit = null }) {
                    Text("Cancel", color = TextSecondary)
                }
            },
            containerColor = DarkSurfaceElevated
        )
    }

    // Delete Topic Confirmation
    topicToDelete?.let { topic ->
        AlertDialog(
            onDismissRequest = { topicToDelete = null },
            title = { Text("Delete Topic", color = TextPrimary) },
            text = { Text("Remove topic '${topic.name}'?", color = TextSecondary) },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.deleteTopic(topic.id)
                        topicToDelete = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = CoralPriority)
                ) {
                    Text("Delete")
                }
            },
            dismissButton = {
                TextButton(onClick = { topicToDelete = null }) {
                    Text("Cancel", color = TextSecondary)
                }
            },
            containerColor = DarkSurfaceElevated
        )
    }

    // Delete Subject Confirmation
    subjectToDelete?.let { subject ->
        AlertDialog(
            onDismissRequest = { subjectToDelete = null },
            title = { Text("Delete Subject", color = TextPrimary) },
            text = { Text("Remove subject '${subject.name}' and all associated topics?", color = TextSecondary) },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.deleteSubject(subject)
                        subjectToDelete = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = CoralPriority)
                ) {
                    Text("Delete")
                }
            },
            dismissButton = {
                TextButton(onClick = { subjectToDelete = null }) {
                    Text("Cancel", color = TextSecondary)
                }
            },
            containerColor = DarkSurfaceElevated
        )
    }

    // AI Explanation Dialog
    if (aiExplanationTitle != null) {
        AlertDialog(
            onDismissRequest = {
                aiExplanationTitle = null
                aiExplanationText = null
            },
            title = {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(imageVector = Icons.Filled.AutoAwesome, contentDescription = null, tint = AccentPrimaryGlow)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(text = aiExplanationTitle ?: "Topic Breakdown", color = TextPrimary, style = MaterialTheme.typography.titleMedium)
                }
            },
            text = {
                if (isAiExplaining) {
                    Column(
                        modifier = Modifier.fillMaxWidth().padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        CircularProgressIndicator(color = AccentPrimaryGlow)
                        Spacer(modifier = Modifier.height(12.dp))
                        Text("Synthesizing high-yield study breakdown...", color = TextSecondary, style = MaterialTheme.typography.bodyMedium)
                    }
                } else {
                    Text(
                        text = aiExplanationText ?: "",
                        color = TextPrimary,
                        style = MaterialTheme.typography.bodyMedium,
                        lineHeight = 22.sp
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        aiExplanationTitle = null
                        aiExplanationText = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = AccentPrimary)
                ) {
                    Text("Done")
                }
            },
            containerColor = DarkSurfaceElevated
        )
    }
}

@Composable
private fun SubjectGroupCard(
    subject: SubjectEntity,
    topics: List<TopicEntity>,
    onAddTopic: () -> Unit,
    onDeleteSubject: () -> Unit,
    onStudyTopic: (TopicEntity) -> Unit,
    onAiExplain: (TopicEntity) -> Unit,
    onEditTopic: (TopicEntity) -> Unit,
    onDeleteTopic: (TopicEntity) -> Unit
) {
    val subjectColor = try {
        Color(android.graphics.Color.parseColor(subject.colorHex))
    } catch (e: Exception) {
        AccentPrimary
    }

    GlassCard(
        modifier = Modifier.fillMaxWidth().testTag("subject_card_${subject.name.lowercase().replace(" ", "_")}")
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(12.dp)
                        .clip(CircleShape)
                        .background(subjectColor)
                )
                Spacer(modifier = Modifier.width(10.dp))
                Text(
                    text = subject.name,
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "(${topics.size})",
                    style = MaterialTheme.typography.labelSmall,
                    color = TextMuted
                )
            }

            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onAddTopic, modifier = Modifier.size(32.dp)) {
                    Icon(Icons.Filled.Add, contentDescription = "Add Topic", tint = AccentPrimaryGlow, modifier = Modifier.size(18.dp))
                }
                IconButton(onClick = onDeleteSubject, modifier = Modifier.size(32.dp)) {
                    Icon(Icons.Outlined.Delete, contentDescription = "Delete Subject", tint = TextMuted, modifier = Modifier.size(16.dp))
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        if (topics.isEmpty()) {
            Text(
                text = "No topics added yet. Tap '+' to create one.",
                style = MaterialTheme.typography.bodyMedium,
                color = TextMuted,
                modifier = Modifier.padding(vertical = 8.dp)
            )
        } else {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                topics.forEach { topic ->
                    val progressFraction = if (topic.targetMinutes > 0) {
                        (topic.studiedMinutes.toFloat() / topic.targetMinutes.toFloat()).coerceIn(0f, 1f)
                    } else 0f

                    Surface(
                        color = FrostedWhite8,
                        shape = RoundedCornerShape(14.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, FrostedWhite10)
                    ) {
                        Column(modifier = Modifier.fillMaxWidth().padding(12.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = topic.name,
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.SemiBold,
                                    color = TextPrimary
                                )

                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    // Study Now
                                    IconButton(
                                        onClick = { onStudyTopic(topic) },
                                        modifier = Modifier.size(28.dp).testTag("study_topic_btn_${topic.id}")
                                    ) {
                                        Icon(Icons.Filled.PlayArrow, contentDescription = "Study", tint = EmeraldSuccess, modifier = Modifier.size(18.dp))
                                    }
                                    // AI Explain
                                    IconButton(
                                        onClick = { onAiExplain(topic) },
                                        modifier = Modifier.size(28.dp).testTag("ai_explain_btn_${topic.id}")
                                    ) {
                                        Icon(Icons.Filled.AutoAwesome, contentDescription = "AI Breakdown", tint = AccentSecondary, modifier = Modifier.size(16.dp))
                                    }
                                    // Edit
                                    IconButton(
                                        onClick = { onEditTopic(topic) },
                                        modifier = Modifier.size(28.dp)
                                    ) {
                                        Icon(Icons.Outlined.Edit, contentDescription = "Edit", tint = TextMuted, modifier = Modifier.size(14.dp))
                                    }
                                    // Delete
                                    IconButton(
                                        onClick = { onDeleteTopic(topic) },
                                        modifier = Modifier.size(28.dp)
                                    ) {
                                        Icon(Icons.Outlined.Delete, contentDescription = "Delete", tint = TextMuted, modifier = Modifier.size(14.dp))
                                    }
                                }
                            }

                            Spacer(modifier = Modifier.height(6.dp))

                            // Progress Bar
                            LinearProgressIndicator(
                                progress = { progressFraction },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(6.dp)
                                    .clip(RoundedCornerShape(3.dp)),
                                color = subjectColor,
                                trackColor = DarkSurface
                            )

                            Spacer(modifier = Modifier.height(6.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    text = "${topic.studiedMinutes}m logged",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = TextSecondary
                                )
                                Text(
                                    text = "Target: ${topic.targetMinutes}m (${(progressFraction * 100).toInt()}%)",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = TextMuted
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
