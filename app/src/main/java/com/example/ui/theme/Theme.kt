package com.example.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val StudyFlowDarkColorScheme = darkColorScheme(
  primary = AccentPrimary,
  onPrimary = TextPrimary,
  primaryContainer = AccentPrimary.copy(alpha = 0.2f),
  onPrimaryContainer = AccentPrimaryGlow,
  secondary = AccentSecondary,
  onSecondary = DarkBackground,
  secondaryContainer = AccentSecondary.copy(alpha = 0.2f),
  onSecondaryContainer = AccentSecondary,
  tertiary = AccentTertiary,
  onTertiary = TextPrimary,
  background = DarkBackground,
  onBackground = TextPrimary,
  surface = DarkSurface,
  onSurface = TextPrimary,
  surfaceVariant = DarkSurfaceElevated,
  onSurfaceVariant = TextSecondary,
  outline = DarkSurfaceBorder,
  outlineVariant = TextMuted.copy(alpha = 0.3f),
  error = CoralPriority,
  onError = TextPrimary
)

@Composable
fun MyApplicationTheme(
  darkTheme: Boolean = true,
  dynamicColor: Boolean = false, // Force cohesive dark-first aesthetic
  content: @Composable () -> Unit,
) {
  val colorScheme = StudyFlowDarkColorScheme
  val view = LocalView.current
  if (!view.isInEditMode) {
    SideEffect {
      val window = (view.context as? Activity)?.window
      window?.let {
        it.statusBarColor = DarkBackground.toArgb()
        it.navigationBarColor = DarkBackground.toArgb()
        WindowCompat.getInsetsController(it, view).isAppearanceLightStatusBars = false
        WindowCompat.getInsetsController(it, view).isAppearanceLightNavigationBars = false
      }
    }
  }

  MaterialTheme(
    colorScheme = colorScheme,
    typography = Typography,
    content = content
  )
}
