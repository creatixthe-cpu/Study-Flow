package com.example.ui.screens.settings

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import com.example.ui.MainViewModel
import com.example.ui.components.GlassCard
import com.example.ui.navigation.Screen
import com.example.ui.theme.*

@Composable
fun SettingsScreen(
    viewModel: MainViewModel,
    onNavigateToLanding: () -> Unit,
    modifier: Modifier = Modifier
) {
    var showEditProfileDialog by remember { mutableStateOf(false) }
    var showGoalDialog by remember { mutableStateOf(false) }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBackground)
            .testTag("settings_screen"),
        contentPadding = PaddingValues(horizontal = 20.dp, vertical = 20.dp)
    ) {
        // Header
        item {
            Text(
                text = "Settings",
                style = MaterialTheme.typography.displayMedium,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
            Text(
                text = "Customize your profile and study experience",
                style = MaterialTheme.typography.labelSmall,
                color = TextSecondary
            )
            Spacer(modifier = Modifier.height(20.dp))
        }

        // Student Profile Section
        item {
            GlassCard(modifier = Modifier.fillMaxWidth()) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(50.dp)
                                .clip(CircleShape)
                                .background(AccentPrimary),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = viewModel.userName.take(1).uppercase(),
                                style = MaterialTheme.typography.titleLarge,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                        }
                        Spacer(modifier = Modifier.width(14.dp))
                        Column {
                            Text(
                                text = viewModel.userName,
                                style = MaterialTheme.typography.titleLarge,
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )
                            Text(
                                text = viewModel.userFocusMajor,
                                style = MaterialTheme.typography.bodyMedium,
                                color = TextSecondary,
                                fontSize = 13.sp
                            )
                        }
                    }

                    OutlinedButton(
                        onClick = { showEditProfileDialog = true },
                        colors = ButtonDefaults.outlinedButtonColors(
                            containerColor = FrostedWhite5,
                            contentColor = Color.White
                        ),
                        border = androidx.compose.foundation.BorderStroke(1.dp, FrostedWhite15),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.testTag("edit_profile_btn")
                    ) {
                        Text("Edit", fontWeight = FontWeight.SemiBold)
                    }
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
        }

        // Study Goals Section
        item {
            GlassCard(modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = "Study Goals & Targets",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
                Spacer(modifier = Modifier.height(14.dp))

                SettingRow(
                    icon = Icons.Filled.Flag,
                    title = "Daily Focus Target",
                    subtitle = "${viewModel.userGoalMinutes} minutes / day",
                    onClick = { showGoalDialog = true }
                )

                HorizontalDivider(color = DarkSurfaceBorder, modifier = Modifier.padding(vertical = 10.dp))

                SettingRow(
                    icon = Icons.Filled.Timer,
                    title = "Default Focus Session",
                    subtitle = "25 minutes (Pomodoro)",
                    onClick = {}
                )
            }
            Spacer(modifier = Modifier.height(16.dp))
        }

        // Gemini AI Coach Integration Status
        item {
            GlassCard(
                modifier = Modifier.fillMaxWidth(),
                borderColor = AccentSecondary.copy(alpha = 0.3f)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(CircleShape)
                                .background(AccentSecondary.copy(alpha = 0.15f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Filled.AutoAwesome, contentDescription = null, tint = AccentSecondary, modifier = Modifier.size(20.dp))
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(
                                text = "Gemini AI Study Coach",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.SemiBold,
                                color = TextPrimary
                            )
                            Text(
                                text = if (viewModel.aiService.isConfigured()) "Live Gemini 3.5 Connected" else "Algorithmic Coach Active (Ready for Gemini)",
                                style = MaterialTheme.typography.labelSmall,
                                color = if (viewModel.aiService.isConfigured()) EmeraldSuccess else AccentSecondary
                            )
                        }
                    }

                    Surface(
                        color = if (viewModel.aiService.isConfigured()) EmeraldSuccess.copy(alpha = 0.15f) else DarkSurfaceBorder,
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text(
                            text = if (viewModel.aiService.isConfigured()) "CONNECTED" else "READY",
                            color = if (viewModel.aiService.isConfigured()) EmeraldSuccess else TextMuted,
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                Text(
                    text = "Personalized advice, question accuracy diagnostics, and conceptual breakdowns are powered on-device with graceful fallbacks. Add your Gemini API Key in the AI Studio Secrets panel anytime.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = TextSecondary,
                    fontSize = 12.sp,
                    lineHeight = 16.sp
                )
            }
            Spacer(modifier = Modifier.height(16.dp))
        }

        // Appearance & Notifications
        item {
            GlassCard(modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = "Preferences",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
                Spacer(modifier = Modifier.height(14.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Filled.NotificationsNone, contentDescription = null, tint = AccentPrimaryGlow)
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text("Daily Study Notifications", style = MaterialTheme.typography.labelLarge, color = TextPrimary)
                            Text("Reminders to keep your streak", style = MaterialTheme.typography.labelSmall, color = TextSecondary)
                        }
                    }
                    Switch(
                        checked = viewModel.notificationsEnabled,
                        onCheckedChange = { viewModel.notificationsEnabled = it },
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = Color.White,
                            checkedTrackColor = AccentPrimary
                        )
                    )
                }

                HorizontalDivider(color = DarkSurfaceBorder, modifier = Modifier.padding(vertical = 12.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Filled.Palette, contentDescription = null, tint = AccentSecondary)
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text("Theme Style", style = MaterialTheme.typography.labelLarge, color = TextPrimary)
                            Text(viewModel.appearanceTheme, style = MaterialTheme.typography.labelSmall, color = TextSecondary)
                        }
                    }
                    Surface(
                        color = DarkSurfaceElevated,
                        shape = RoundedCornerShape(8.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, DarkSurfaceBorder)
                    ) {
                        Text(
                            text = "Dark-First",
                            style = MaterialTheme.typography.labelSmall,
                            color = TextPrimary,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                        )
                    }
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
        }

        // App Information & Landing Page link
        item {
            GlassCard(modifier = Modifier.fillMaxWidth()) {
                SettingRow(
                    icon = Icons.AutoMirrored.Filled.OpenInNew,
                    title = "View StudyFlow Landing Page",
                    subtitle = "Explore hero showcase & feature overview",
                    onClick = onNavigateToLanding
                )
                HorizontalDivider(color = DarkSurfaceBorder, modifier = Modifier.padding(vertical = 10.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("App Version", style = MaterialTheme.typography.labelMedium, color = TextSecondary)
                    Text("1.0.0 (Release)", style = MaterialTheme.typography.labelMedium, color = TextMuted)
                }
            }
            Spacer(modifier = Modifier.height(28.dp))
        }
    }

    // Edit Profile Dialog
    if (showEditProfileDialog) {
        var tempName by remember { mutableStateOf(viewModel.userName) }
        var tempMajor by remember { mutableStateOf(viewModel.userFocusMajor) }

        AlertDialog(
            onDismissRequest = { showEditProfileDialog = false },
            title = { Text("Edit Student Profile", color = TextPrimary) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedTextField(
                        value = tempName,
                        onValueChange = { tempName = it },
                        label = { Text("Student Name") },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = AccentPrimary,
                            unfocusedBorderColor = DarkSurfaceBorder,
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary
                        ),
                        modifier = Modifier.fillMaxWidth().testTag("edit_student_name_input")
                    )
                    OutlinedTextField(
                        value = tempMajor,
                        onValueChange = { tempMajor = it },
                        label = { Text("Degree / Focus Area") },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = AccentPrimary,
                            unfocusedBorderColor = DarkSurfaceBorder,
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary
                        ),
                        modifier = Modifier.fillMaxWidth().testTag("edit_student_major_input")
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (tempName.isNotBlank()) viewModel.userName = tempName
                        if (tempMajor.isNotBlank()) viewModel.userFocusMajor = tempMajor
                        showEditProfileDialog = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = AccentPrimary)
                ) {
                    Text("Save")
                }
            },
            dismissButton = {
                TextButton(onClick = { showEditProfileDialog = false }) {
                    Text("Cancel", color = TextSecondary)
                }
            },
            containerColor = DarkSurfaceElevated
        )
    }

    // Edit Goal Dialog
    if (showGoalDialog) {
        var tempGoal by remember { mutableStateOf(viewModel.userGoalMinutes.toString()) }

        AlertDialog(
            onDismissRequest = { showGoalDialog = false },
            title = { Text("Daily Study Goal", color = TextPrimary) },
            text = {
                OutlinedTextField(
                    value = tempGoal,
                    onValueChange = { tempGoal = it },
                    label = { Text("Minutes per day") },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = AccentPrimary,
                        unfocusedBorderColor = DarkSurfaceBorder,
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary
                    ),
                    modifier = Modifier.fillMaxWidth().testTag("edit_goal_input")
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        val mins = tempGoal.toIntOrNull() ?: 120
                        viewModel.userGoalMinutes = mins
                        showGoalDialog = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = AccentPrimary)
                ) {
                    Text("Save")
                }
            },
            dismissButton = {
                TextButton(onClick = { showGoalDialog = false }) {
                    Text("Cancel", color = TextSecondary)
                }
            },
            containerColor = DarkSurfaceElevated
        )
    }
}

@Composable
private fun SettingRow(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    subtitle: String,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(34.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(FrostedWhite8)
                    .border(1.dp, FrostedWhite10, RoundedCornerShape(10.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(imageVector = icon, contentDescription = null, tint = AccentPrimary, modifier = Modifier.size(18.dp))
            }
            Spacer(modifier = Modifier.width(12.dp))
            Column {
                Text(text = title, style = MaterialTheme.typography.labelLarge, color = TextPrimary)
                Text(text = subtitle, style = MaterialTheme.typography.labelSmall, color = TextSecondary)
            }
        }
        Icon(imageVector = Icons.Filled.ChevronRight, contentDescription = null, tint = TextMuted)
    }
}
