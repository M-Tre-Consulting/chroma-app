package it.mtre_consulting.chroma.ui.navigation

import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.spring
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.scaleIn
import androidx.compose.animation.scaleOut
import androidx.compose.foundation.layout.padding
import androidx.compose.ui.unit.dp
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.FileDownload
import androidx.compose.material.icons.rounded.Palette
import androidx.compose.material.icons.rounded.Style
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import it.mtre_consulting.chroma.ui.screens.export.ExportScreen
import it.mtre_consulting.chroma.ui.screens.palettes.PaletteDetailScreen
import it.mtre_consulting.chroma.ui.screens.palettes.PalettesScreen
import it.mtre_consulting.chroma.ui.screens.tokens.TokensScreen
import it.mtre_consulting.chroma.ui.theme.Background
import it.mtre_consulting.chroma.ui.theme.Outline
import it.mtre_consulting.chroma.ui.theme.Primary
import it.mtre_consulting.chroma.ui.theme.Surface
import it.mtre_consulting.chroma.ui.theme.TextDisabled
import it.mtre_consulting.chroma.ui.theme.TextSecondary
import it.mtre_consulting.chroma.viewmodel.AppViewModel

sealed class Screen(val route: String) {
    data object Palettes : Screen("palettes")
    data object PaletteDetail : Screen("palette/{paletteId}") {
        fun route(id: String) = "palette/$id"
    }
    data object Tokens : Screen("tokens")
    data object Export : Screen("export")
}

private val tabRoutes = listOf(Screen.Palettes.route, Screen.Tokens.route, Screen.Export.route)

@Composable
fun AppNavigation(vm: AppViewModel) {
    val navController = rememberNavController()
    val navBackStack by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStack?.destination?.route
    val showBottomBar = currentRoute in tabRoutes

    val enterTransition = fadeIn(spring(stiffness = Spring.StiffnessMediumLow)) +
            scaleIn(spring(stiffness = Spring.StiffnessMediumLow), initialScale = 0.96f)
    val exitTransition = fadeOut(spring(stiffness = Spring.StiffnessMediumLow)) +
            scaleOut(spring(stiffness = Spring.StiffnessMediumLow), targetScale = 0.96f)

    Scaffold(
        containerColor = Background,
        bottomBar = {
            if (showBottomBar) {
                NavigationBar(
                    containerColor = Surface,
                    tonalElevation = 0.dp,
                ) {
                    NavigationBarItem(
                        selected = currentRoute == Screen.Palettes.route,
                        onClick = {
                            navController.navigate(Screen.Palettes.route) {
                                popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                                launchSingleTop = true
                                restoreState = true
                            }
                        },
                        icon = { Icon(Icons.Rounded.Palette, contentDescription = "Palettes") },
                        label = { Text("Palettes") },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = Primary,
                            selectedTextColor = Primary,
                            unselectedIconColor = TextDisabled,
                            unselectedTextColor = TextDisabled,
                            indicatorColor = Background,
                        ),
                    )
                    NavigationBarItem(
                        selected = currentRoute == Screen.Tokens.route,
                        onClick = {
                            navController.navigate(Screen.Tokens.route) {
                                popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                                launchSingleTop = true
                                restoreState = true
                            }
                        },
                        icon = { Icon(Icons.Rounded.Style, contentDescription = "Tokens") },
                        label = { Text("Tokens") },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = Primary,
                            selectedTextColor = Primary,
                            unselectedIconColor = TextDisabled,
                            unselectedTextColor = TextDisabled,
                            indicatorColor = Background,
                        ),
                    )
                    NavigationBarItem(
                        selected = currentRoute == Screen.Export.route,
                        onClick = {
                            navController.navigate(Screen.Export.route) {
                                popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                                launchSingleTop = true
                                restoreState = true
                            }
                        },
                        icon = { Icon(Icons.Rounded.FileDownload, contentDescription = "Export") },
                        label = { Text("Export") },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = Primary,
                            selectedTextColor = Primary,
                            unselectedIconColor = TextDisabled,
                            unselectedTextColor = TextDisabled,
                            indicatorColor = Background,
                        ),
                    )
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Palettes.route,
            modifier = Modifier.padding(innerPadding),
            enterTransition = { enterTransition },
            exitTransition = { exitTransition },
            popEnterTransition = { enterTransition },
            popExitTransition = { exitTransition },
        ) {
            composable(Screen.Palettes.route) {
                PalettesScreen(vm = vm, onSelectPalette = { id ->
                    navController.navigate(Screen.PaletteDetail.route(id))
                })
            }
            composable(Screen.PaletteDetail.route) { backStack ->
                val paletteId = backStack.arguments?.getString("paletteId") ?: return@composable
                PaletteDetailScreen(vm = vm, paletteId = paletteId, onBack = { navController.popBackStack() })
            }
            composable(Screen.Tokens.route) {
                TokensScreen(vm = vm)
            }
            composable(Screen.Export.route) {
                ExportScreen(vm = vm)
            }
        }
    }
}
