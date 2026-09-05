package com.example.ui

import androidx.compose.animation.Crossfade
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.ui.navigation.Screen
import com.example.ui.screens.analytics.AnalyticsScreen
import com.example.ui.screens.dashboard.DashboardScreen
import com.example.ui.screens.landing.LandingScreen
import com.example.ui.screens.planner.PlannerScreen
import com.example.ui.screens.settings.SettingsScreen
import com.example.ui.screens.study.StudyTimerScreen
import com.example.ui.screens.topics.TopicsScreen
import com.example.ui.theme.*

@Composable
fun StudyFlowApp(
    viewModel: MainViewModel = viewModel()
) {
    val currentScreen by viewModel.currentScreen.collectAsStateWithLifecycle()

    BoxWithConstraints(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBackground)
    ) {
        val isWideScreen = maxWidth >= 600.dp

        if (currentScreen == Screen.Landing) {
            LandingScreen(
                onStartStudying = { viewModel.navigateTo(Screen.Dashboard) },
                onSeeHowItWorks = { viewModel.navigateTo(Screen.Dashboard) }
            )
        } else {
            if (isWideScreen) {
                // Desktop / Tablet Layout: Elegant Left Sidebar
                Row(modifier = Modifier.fillMaxSize()) {
                    NavigationRail(
                        modifier = Modifier
                            .fillMaxHeight()
                            .width(88.dp)
                            .background(FrostedWhite5)
                            .testTag("app_navigation_rail"),
                        containerColor = FrostedWhite5,
                        contentColor = TextPrimary,
                        header = {
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                modifier = Modifier.padding(vertical = 16.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(42.dp)
                                        .clip(RoundedCornerShape(14.dp))
                                        .background(AccentPrimary),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        imageVector = Icons.Filled.Bolt,
                                        contentDescription = "StudyFlow Logo",
                                        tint = Color.White,
                                        modifier = Modifier.size(26.dp)
                                    )
                                }
                            }
                        }
                    ) {
                        Spacer(modifier = Modifier.height(12.dp))
                        Screen.navItems.forEach { screen ->
                            val isSelected = currentScreen == screen
                            NavigationRailItem(
                                selected = isSelected,
                                onClick = { viewModel.navigateTo(screen) },
                                icon = {
                                    Icon(
                                        imageVector = if (isSelected) screen.selectedIcon else screen.unselectedIcon,
                                        contentDescription = screen.title
                                    )
                                },
                                label = {
                                    Text(
                                        text = screen.title.uppercase(),
                                        fontSize = 9.sp,
                                        fontWeight = FontWeight.Bold,
                                        letterSpacing = 1.sp
                                    )
                                },
                                colors = NavigationRailItemDefaults.colors(
                                    selectedIconColor = AccentPrimary,
                                    selectedTextColor = AccentPrimary,
                                    unselectedIconColor = Color.White.copy(alpha = 0.4f),
                                    unselectedTextColor = Color.White.copy(alpha = 0.4f),
                                    indicatorColor = AccentPrimary.copy(alpha = 0.15f)
                                ),
                                modifier = Modifier.testTag("nav_rail_item_${screen.route}")
                            )
                        }
                    }

                    Box(
                        modifier = Modifier
                            .fillMaxHeight()
                            .weight(1f)
                    ) {
                        AppScreenContent(
                            currentScreen = currentScreen,
                            viewModel = viewModel
                        )
                    }
                }
            } else {
                // Mobile Layout: Bottom Navigation Bar
                Scaffold(
                    modifier = Modifier.fillMaxSize(),
                    containerColor = DarkBackground,
                    bottomBar = {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(FrostedWhite5)
                        ) {
                            NavigationBar(
                                containerColor = FrostedWhite5,
                                contentColor = TextPrimary,
                                tonalElevation = 0.dp,
                                modifier = Modifier.testTag("app_bottom_nav_bar")
                            ) {
                                Screen.navItems.forEach { screen ->
                                    val isSelected = currentScreen == screen
                                    NavigationBarItem(
                                        selected = isSelected,
                                        onClick = { viewModel.navigateTo(screen) },
                                        icon = {
                                            Icon(
                                                imageVector = if (isSelected) screen.selectedIcon else screen.unselectedIcon,
                                                contentDescription = screen.title
                                            )
                                        },
                                        label = {
                                            Text(
                                                text = screen.title.uppercase(),
                                                fontSize = 9.sp,
                                                fontWeight = FontWeight.Bold,
                                                letterSpacing = 1.sp
                                            )
                                        },
                                        colors = NavigationBarItemDefaults.colors(
                                            selectedIconColor = AccentPrimary,
                                            selectedTextColor = AccentPrimary,
                                            unselectedIconColor = Color.White.copy(alpha = 0.4f),
                                            unselectedTextColor = Color.White.copy(alpha = 0.4f),
                                            indicatorColor = AccentPrimary.copy(alpha = 0.15f)
                                        ),
                                        modifier = Modifier.testTag("nav_bottom_item_${screen.route}")
                                    )
                                }
                            }
                        }
                    }
                ) { paddingValues ->
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(paddingValues)
                    ) {
                        AppScreenContent(
                            currentScreen = currentScreen,
                            viewModel = viewModel
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun AppScreenContent(
    currentScreen: Screen,
    viewModel: MainViewModel
) {
    Crossfade(targetState = currentScreen, label = "screen_crossfade") { screen ->
        when (screen) {
            Screen.Landing -> {
                LandingScreen(
                    onStartStudying = { viewModel.navigateTo(Screen.Dashboard) },
                    onSeeHowItWorks = { viewModel.navigateTo(Screen.Dashboard) }
                )
            }
            Screen.Dashboard -> {
                DashboardScreen(
                    viewModel = viewModel,
                    onNavigateToStudy = { viewModel.navigateTo(Screen.Study) },
                    onNavigateToPlanner = { viewModel.navigateTo(Screen.Planner) }
                )
            }
            Screen.Planner -> {
                PlannerScreen(
                    viewModel = viewModel,
                    onStartStudyForTask = { task ->
                        viewModel.startStudyForTask(task)
                    }
                )
            }
            Screen.Study -> {
                StudyTimerScreen(viewModel = viewModel)
            }
            Screen.Analytics -> {
                AnalyticsScreen(viewModel = viewModel)
            }
            Screen.Topics -> {
                TopicsScreen(viewModel = viewModel)
            }
            Screen.Settings -> {
                SettingsScreen(
                    viewModel = viewModel,
                    onNavigateToLanding = { viewModel.navigateTo(Screen.Landing) }
                )
            }
        }
    }
}
