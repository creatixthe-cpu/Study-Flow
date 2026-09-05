package com.example.ui.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.repository.DayStudyData
import com.example.ui.theme.*

@Composable
fun GlassCard(
    modifier: Modifier = Modifier,
    cornerRadius: Dp = 28.dp,
    backgroundColor: Color = FrostedWhite5,
    borderColor: Color = FrostedWhite10,
    onClick: (() -> Unit)? = null,
    content: @Composable ColumnScope.() -> Unit
) {
    val shape = RoundedCornerShape(cornerRadius)
    val cardModifier = modifier
        .clip(shape)
        .background(backgroundColor)
        .border(1.dp, borderColor, shape)
        .then(
            if (onClick != null) Modifier.clickable(onClick = onClick) else Modifier
        )
        .padding(20.dp)

    Column(
        modifier = cardModifier,
        content = content
    )
}

@Composable
fun FrostedPill(
    modifier: Modifier = Modifier,
    content: @Composable RowScope.() -> Unit
) {
    Row(
        modifier = modifier
            .clip(CircleShape)
            .background(FrostedWhite5)
            .border(1.dp, FrostedWhite10, CircleShape)
            .padding(horizontal = 14.dp, vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(6.dp),
        content = content
    )
}

@Composable
fun StatMetricCard(
    title: String,
    value: String,
    subtext: String,
    icon: ImageVector? = null,
    accentColor: Color = AccentPrimary,
    progressFraction: Float? = null,
    trendText: String? = null,
    modifier: Modifier = Modifier
) {
    GlassCard(
        modifier = modifier.testTag("stat_card_${title.lowercase().replace(" ", "_")}"),
        cornerRadius = 28.dp,
        backgroundColor = FrostedWhite5,
        borderColor = FrostedWhite10
    ) {
        // Label at the top: text-[10px] uppercase tracking-widest text-slate-400 mb-2
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = title.uppercase(),
                style = MaterialTheme.typography.labelSmall,
                color = TextSecondary,
                letterSpacing = 2.sp,
                fontSize = 10.sp,
                fontWeight = FontWeight.Medium
            )
            if (icon != null) {
                Box(
                    modifier = Modifier
                        .size(28.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(accentColor.copy(alpha = 0.15f))
                        .border(1.dp, accentColor.copy(alpha = 0.3f), RoundedCornerShape(8.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        tint = accentColor,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }
        }
        Spacer(modifier = Modifier.height(6.dp))
        // Value: text-2xl font-light
        Text(
            text = value,
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Light,
            color = TextPrimary,
            fontSize = 26.sp
        )

        // Progress bar if present (e.g., 75% for study time)
        if (progressFraction != null) {
            Spacer(modifier = Modifier.height(10.dp))
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(4.dp)
                    .clip(CircleShape)
                    .background(FrostedWhite10)
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth(progressFraction.coerceIn(0f, 1f))
                        .fillMaxHeight()
                        .clip(CircleShape)
                        .background(AccentPrimary)
                )
            }
        }

        if (trendText != null) {
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = trendText,
                style = MaterialTheme.typography.labelSmall,
                color = EmeraldSuccess,
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium
            )
        } else if (subtext.isNotBlank() && progressFraction == null) {
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = subtext,
                style = MaterialTheme.typography.labelSmall,
                color = TextSecondary,
                fontSize = 11.sp,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        }
    }
}

@Composable
fun CurrentPriorityCard(
    title: String = "Start Study Session",
    subtitle: String = "Current Priority",
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(28.dp))
            .background(
                Brush.horizontalGradient(
                    listOf(AccentPrimary, AccentPrimaryDark)
                )
            )
            .clickable(onClick = onClick)
            .padding(22.dp)
            .testTag("current_priority_cta_card")
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = subtitle.uppercase(),
                    style = MaterialTheme.typography.labelSmall,
                    fontWeight = FontWeight.Bold,
                    color = Color.White.copy(alpha = 0.75f),
                    letterSpacing = 2.5.sp,
                    fontSize = 10.sp
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.SemiBold,
                    color = Color.White,
                    fontSize = 20.sp
                )
            }
            Box(
                modifier = Modifier
                    .size(46.dp)
                    .clip(CircleShape)
                    .background(Color.White),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Filled.PlayArrow,
                    contentDescription = "Start",
                    tint = AccentPrimary,
                    modifier = Modifier.size(24.dp)
                )
            }
        }
    }
}

@Composable
fun PriorityBadge(priority: String) {
    val (bgColor, textColor) = when (priority.lowercase()) {
        "high" -> CoralPriority.copy(alpha = 0.18f) to CoralPriority
        "medium" -> AmberWarning.copy(alpha = 0.18f) to AmberWarning
        else -> AccentSecondary.copy(alpha = 0.18f) to AccentSecondary
    }

    Surface(
        color = bgColor,
        shape = RoundedCornerShape(8.dp),
        border = androidx.compose.foundation.BorderStroke(0.5.dp, textColor.copy(alpha = 0.3f))
    ) {
        Text(
            text = priority.uppercase(),
            color = textColor,
            style = MaterialTheme.typography.labelSmall,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
        )
    }
}

@Composable
fun WeeklyStudyBarChart(
    days: List<DayStudyData>,
    modifier: Modifier = Modifier,
    barColor: Color = AccentPrimary,
    activeDayColor: Color = AccentSecondary
) {
    val maxMinutes = (days.maxOfOrNull { it.minutes } ?: 60).coerceAtLeast(60).toFloat()

    Column(modifier = modifier.testTag("weekly_study_chart")) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(130.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.Bottom
        ) {
            days.forEach { day ->
                val barFraction = (day.minutes / maxMinutes).coerceIn(0.06f, 1f)
                val animatedHeight by animateFloatAsState(
                    targetValue = barFraction,
                    animationSpec = tween(durationMillis = 600),
                    label = "barHeight"
                )

                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.weight(1f)
                ) {
                    Text(
                        text = if (day.minutes > 0) "${day.minutes}m" else "-",
                        style = MaterialTheme.typography.labelSmall,
                        color = if (day.isToday) activeDayColor else TextMuted,
                        fontSize = 9.sp
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Box(
                        modifier = Modifier
                            .width(22.dp)
                            .height(85.dp * animatedHeight)
                            .clip(RoundedCornerShape(topStart = 8.dp, topEnd = 8.dp))
                            .background(
                                if (day.isToday) {
                                    Brush.verticalGradient(
                                        listOf(AccentPrimaryGlow, AccentPrimary)
                                    )
                                } else if (day.minutes > 0) {
                                    Brush.verticalGradient(
                                        listOf(barColor.copy(alpha = 0.9f), barColor.copy(alpha = 0.4f))
                                    )
                                } else {
                                    Brush.verticalGradient(
                                        listOf(FrostedWhite10, FrostedWhite5)
                                    )
                                }
                            )
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = day.dayLabel,
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = if (day.isToday) FontWeight.Bold else FontWeight.Medium,
                        color = if (day.isToday) TextPrimary else TextSecondary
                    )
                }
            }
        }
    }
}

@Composable
fun CircularProgressRing(
    progress: Float,
    modifier: Modifier = Modifier,
    strokeWidth: Dp = 10.dp,
    progressColor: Color = AccentPrimary,
    trackColor: Color = FrostedWhite10
) {
    val animatedProgress by animateFloatAsState(
        targetValue = progress.coerceIn(0f, 1f),
        animationSpec = tween(durationMillis = 800),
        label = "progress"
    )

    Canvas(modifier = modifier) {
        val stroke = Stroke(width = strokeWidth.toPx(), cap = StrokeCap.Round)
        // Background track
        drawCircle(
            color = trackColor,
            radius = size.minDimension / 2 - strokeWidth.toPx() / 2,
            style = stroke
        )
        // Foreground arc
        drawArc(
            brush = Brush.sweepGradient(
                listOf(progressColor, AccentPrimaryGlow, progressColor)
            ),
            startAngle = -90f,
            sweepAngle = animatedProgress * 360f,
            useCenter = false,
            style = stroke,
            topLeft = Offset(strokeWidth.toPx() / 2, strokeWidth.toPx() / 2),
            size = Size(
                size.width - strokeWidth.toPx(),
                size.height - strokeWidth.toPx()
            )
        )
    }
}

@Composable
fun EmptyStateView(
    icon: ImageVector,
    title: String,
    message: String,
    actionLabel: String? = null,
    onAction: (() -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Box(
            modifier = Modifier
                .size(64.dp)
                .clip(CircleShape)
                .background(FrostedWhite5)
                .border(1.dp, FrostedWhite10, CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = AccentPrimaryGlow,
                modifier = Modifier.size(32.dp)
            )
        }
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = title,
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.SemiBold,
            color = TextPrimary,
            textAlign = TextAlign.Center
        )
        Spacer(modifier = Modifier.height(6.dp))
        Text(
            text = message,
            style = MaterialTheme.typography.bodyMedium,
            color = TextSecondary,
            textAlign = TextAlign.Center
        )
        if (actionLabel != null && onAction != null) {
            Spacer(modifier = Modifier.height(16.dp))
            Button(
                onClick = onAction,
                colors = ButtonDefaults.buttonColors(
                    containerColor = AccentPrimary
                ),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.testTag("empty_state_action_button")
            ) {
                Text(text = actionLabel, fontWeight = FontWeight.SemiBold)
            }
        }
    }
}
