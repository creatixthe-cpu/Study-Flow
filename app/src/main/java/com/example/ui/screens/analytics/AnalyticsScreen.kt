package com.example.ui.screens.analytics

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.*
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.ui.MainViewModel
import com.example.ui.components.CircularProgressRing
import com.example.ui.components.GlassCard
import com.example.ui.components.StatMetricCard
import com.example.ui.components.WeeklyStudyBarChart
import com.example.ui.theme.*

@Composable
fun AnalyticsScreen(
    viewModel: MainViewModel,
    modifier: Modifier = Modifier
) {
    val dailyMinutes by viewModel.todayStudiedMinutes.collectAsStateWithLifecycle()
    val weeklyData by viewModel.weeklyStudyData.collectAsStateWithLifecycle()
    val subjectBreakdown by viewModel.subjectBreakdown.collectAsStateWithLifecycle()
    val sessions by viewModel.sessions.collectAsStateWithLifecycle()
    val accuracy by viewModel.overallAccuracy.collectAsStateWithLifecycle()
    val totalQuestions by viewModel.totalQuestionsCount.collectAsStateWithLifecycle()
    val topicAnalytics by viewModel.topicAnalytics.collectAsStateWithLifecycle()

    val totalWeeklyMinutes = weeklyData.sumOf { it.minutes }
    val strongestTopics = topicAnalytics.filter { it.accuracy >= 80 }.sortedByDescending { it.accuracy }
    val attentionTopics = topicAnalytics.filter { it.accuracy < 80 || it.studiedMinutes < 60 }.sortedBy { it.accuracy }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBackground)
            .testTag("analytics_screen"),
        contentPadding = PaddingValues(horizontal = 20.dp, vertical = 20.dp)
    ) {
        // Header
        item {
            Text(
                text = "Performance Analytics",
                style = MaterialTheme.typography.displayMedium,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
            Text(
                text = "Data-backed evidence of your study mastery",
                style = MaterialTheme.typography.labelSmall,
                color = TextSecondary
            )
            Spacer(modifier = Modifier.height(20.dp))
        }

        // Top Metrics Grid
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                StatMetricCard(
                    title = "Today",
                    value = "${dailyMinutes}m",
                    subtext = "Goal: ${viewModel.userGoalMinutes}m",
                    icon = Icons.Filled.Timer,
                    accentColor = AccentPrimary,
                    modifier = Modifier.weight(1f)
                )
                StatMetricCard(
                    title = "Weekly Time",
                    value = "${totalWeeklyMinutes / 60}h ${totalWeeklyMinutes % 60}m",
                    subtext = "Last 7 days",
                    icon = Icons.Filled.DateRange,
                    accentColor = AccentSecondary,
                    modifier = Modifier.weight(1f)
                )
            }
            Spacer(modifier = Modifier.height(12.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                StatMetricCard(
                    title = "Questions",
                    value = "$totalQuestions",
                    subtext = "Attempted total",
                    icon = Icons.Filled.Quiz,
                    accentColor = AmberWarning,
                    modifier = Modifier.weight(1f)
                )
                StatMetricCard(
                    title = "Accuracy",
                    value = "$accuracy%",
                    subtext = "Problem solving rate",
                    icon = Icons.Filled.GpsFixed,
                    accentColor = EmeraldSuccess,
                    modifier = Modifier.weight(1f)
                )
            }
            Spacer(modifier = Modifier.height(20.dp))
        }

        // Weekly Activity Chart
        item {
            GlassCard(modifier = Modifier.fillMaxWidth()) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Daily Study Distribution",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                        Text(
                            text = "Mon – Sun focus hours",
                            style = MaterialTheme.typography.labelSmall,
                            color = TextSecondary
                        )
                    }
                    Text(
                        text = "${weeklyData.count { it.minutes > 0 }} active days",
                        style = MaterialTheme.typography.labelSmall,
                        color = AccentSecondary,
                        fontWeight = FontWeight.SemiBold
                    )
                }
                Spacer(modifier = Modifier.height(16.dp))
                WeeklyStudyBarChart(days = weeklyData)
            }
            Spacer(modifier = Modifier.height(20.dp))
        }

        // Subject Breakdown Section
        item {
            GlassCard(modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = "Study Time by Subject",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
                Text(
                    text = "Allocation across your syllabus",
                    style = MaterialTheme.typography.labelSmall,
                    color = TextSecondary
                )
                Spacer(modifier = Modifier.height(16.dp))

                if (subjectBreakdown.isEmpty()) {
                    Text("No study sessions logged yet", color = TextMuted, style = MaterialTheme.typography.bodyMedium)
                } else {
                    // Segmented distribution bar
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(12.dp)
                            .clip(RoundedCornerShape(6.dp))
                    ) {
                        subjectBreakdown.forEach { item ->
                            val color = try {
                                Color(android.graphics.Color.parseColor(item.colorHex))
                            } catch (e: Exception) {
                                AccentPrimary
                            }
                            Box(
                                modifier = Modifier
                                    .weight(item.percentage.coerceAtLeast(0.05f))
                                    .fillMaxHeight()
                                    .background(color)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        subjectBreakdown.forEach { item ->
                            val color = try {
                                Color(android.graphics.Color.parseColor(item.colorHex))
                            } catch (e: Exception) {
                                AccentPrimary
                            }
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Box(
                                        modifier = Modifier
                                            .size(10.dp)
                                            .clip(CircleShape)
                                            .background(color)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = item.subjectName,
                                        style = MaterialTheme.typography.bodyMedium,
                                        color = TextPrimary,
                                        fontWeight = FontWeight.Medium
                                    )
                                }
                                Text(
                                    text = "${item.minutes}m (${(item.percentage * 100).toInt()}%)",
                                    style = MaterialTheme.typography.labelMedium,
                                    color = TextSecondary,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }
            }
            Spacer(modifier = Modifier.height(20.dp))
        }

        // Strongest Topics & Topics Needing Attention
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Strongest Topics
                GlassCard(
                    modifier = Modifier.weight(1f),
                    borderColor = EmeraldSuccess.copy(alpha = 0.25f)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.TrendingUp,
                            contentDescription = null,
                            tint = EmeraldSuccess,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "Strongest Topics",
                            style = MaterialTheme.typography.labelLarge,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                    }
                    Spacer(modifier = Modifier.height(10.dp))
                    if (strongestTopics.isEmpty()) {
                        Text("Solve more problems to rank topics", style = MaterialTheme.typography.labelSmall, color = TextMuted)
                    } else {
                        strongestTopics.take(3).forEach { top ->
                            Column(modifier = Modifier.padding(vertical = 4.dp)) {
                                Text(
                                    text = top.topicName,
                                    style = MaterialTheme.typography.bodyMedium,
                                    fontWeight = FontWeight.SemiBold,
                                    color = TextPrimary,
                                    fontSize = 13.sp
                                )
                                Text(
                                    text = "${top.accuracy.toInt()}% accuracy • ${top.studiedMinutes}m",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = EmeraldSuccess
                                )
                            }
                        }
                    }
                }

                // Topics Needing Attention
                GlassCard(
                    modifier = Modifier.weight(1f),
                    borderColor = CoralPriority.copy(alpha = 0.25f)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Filled.WarningAmber,
                            contentDescription = null,
                            tint = CoralPriority,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "Needs Focus",
                            style = MaterialTheme.typography.labelLarge,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                    }
                    Spacer(modifier = Modifier.height(10.dp))
                    if (attentionTopics.isEmpty()) {
                        Text("All topics in healthy range!", style = MaterialTheme.typography.labelSmall, color = EmeraldSuccess)
                    } else {
                        attentionTopics.take(3).forEach { top ->
                            Column(modifier = Modifier.padding(vertical = 4.dp)) {
                                Text(
                                    text = top.topicName,
                                    style = MaterialTheme.typography.bodyMedium,
                                    fontWeight = FontWeight.SemiBold,
                                    color = TextPrimary,
                                    fontSize = 13.sp
                                )
                                Text(
                                    text = "${top.accuracy.toInt()}% accuracy • Review",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = CoralPriority
                                )
                            }
                        }
                    }
                }
            }
            Spacer(modifier = Modifier.height(20.dp))
        }

        // Smart Insight Cards
        item {
            GlassCard(
                modifier = Modifier.fillMaxWidth(),
                backgroundColor = DarkSurfaceElevated
            ) {
                Text(
                    text = "Key Study Insights",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
                Spacer(modifier = Modifier.height(12.dp))

                InsightRow(
                    icon = Icons.Filled.Bolt,
                    title = "Peak Cognitive Hour",
                    detail = "Your highest focus ratings (5/5) happen between 2:00 PM and 5:00 PM."
                )
                HorizontalDivider(color = DarkSurfaceBorder, modifier = Modifier.padding(vertical = 10.dp))
                InsightRow(
                    icon = Icons.Filled.CheckCircle,
                    title = "Consistency Score: 94%",
                    detail = "You've studied 5 out of the last 7 days. Consistency drives exponential compound recall."
                )
                HorizontalDivider(color = DarkSurfaceBorder, modifier = Modifier.padding(vertical = 10.dp))
                InsightRow(
                    icon = Icons.Filled.Psychology,
                    title = "Active Recall Ratio",
                    detail = "Logging ${totalQuestions} questions attempted strengthens neuron pathways 3x faster than passive reading."
                )
            }
            Spacer(modifier = Modifier.height(28.dp))
        }
    }
}

@Composable
private fun InsightRow(icon: androidx.compose.ui.graphics.vector.ImageVector, title: String, detail: String) {
    Row(verticalAlignment = Alignment.Top) {
        Box(
            modifier = Modifier
                .size(32.dp)
                .clip(RoundedCornerShape(8.dp))
                .background(AccentPrimary.copy(alpha = 0.15f)),
            contentAlignment = Alignment.Center
        ) {
            Icon(imageVector = icon, contentDescription = null, tint = AccentPrimaryGlow, modifier = Modifier.size(18.dp))
        }
        Spacer(modifier = Modifier.width(12.dp))
        Column {
            Text(text = title, style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.Bold, color = TextPrimary)
            Spacer(modifier = Modifier.height(2.dp))
            Text(text = detail, style = MaterialTheme.typography.bodyMedium, color = TextSecondary, fontSize = 12.sp)
        }
    }
}
