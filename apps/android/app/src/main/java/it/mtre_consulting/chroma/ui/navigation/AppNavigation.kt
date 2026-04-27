package it.mtre_consulting.chroma.ui.navigation

import androidx.compose.animation.core.EaseIn
import androidx.compose.animation.core.EaseOut
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.FileDownload
import androidx.compose.material.icons.rounded.Palette
import androidx.compose.material.icons.rounded.Style
import androidx.compose.material3.Icon
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
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
import it.mtre_consulting.chroma.ui.theme.OnPrimaryContainer
import it.mtre_consulting.chroma.ui.theme.PrimaryContainer
import it.mtre_consulting.chroma.ui.theme.Surface
import it.mtre_consulting.chroma.ui.theme.TextDisabled
import it.mtre_consulting.chroma.viewmodel.AppViewModel

private val PILL_ITEM_SIZE: Dp = 56.dp
private val PILL_PADDING: Dp = 4.dp

data class NavItem(val route: String, val icon: ImageVector, val label: String)

sealed class Screen(val route: String) {
    data object Palettes : Screen("palettes")
    data object PaletteDetail : Screen("palette/{paletteId}") {
        fun route(id: String) = "palette/$id"
    }
    data object Tokens : Screen("tokens")
    data object Export : Screen("export")
}

private val navItems = listOf(
    NavItem(Screen.Palettes.route, Icons.Rounded.Palette, "Palettes"),
    NavItem(Screen.Tokens.route, Icons.Rounded.Style, "Tokens"),
    NavItem(Screen.Export.route, Icons.Rounded.FileDownload, "Export"),
)

private val tabRoutes = navItems.map { it.route }

@Composable
fun AppNavigation(vm: AppViewModel) {
    val navController = rememberNavController()
    val navBackStack by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStack?.destination?.route
    val showBottomBar = currentRoute in tabRoutes
    val selectedIndex = navItems.indexOfFirst { it.route == currentRoute }.coerceAtLeast(0)

    Scaffold(
        containerColor = Background,
        contentWindowInsets = WindowInsets(0),
        bottomBar = {
            if (showBottomBar) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .navigationBarsPadding()
                        .padding(bottom = 16.dp),
                    contentAlignment = Alignment.Center,
                ) {
                    NavigationPill(
                        items = navItems,
                        selectedIndex = selectedIndex,
                        onItemSelected = { index ->
                            navController.navigate(navItems[index].route) {
                                popUpTo(navController.graph.findStartDestination().id) {
                                    saveState = true
                                }
                                launchSingleTop = true
                                restoreState = true
                            }
                        },
                    )
                }
            }
        },
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Palettes.route,
            modifier = Modifier.padding(innerPadding),
            enterTransition = {
                fadeIn(tween(200, easing = EaseOut)) +
                        slideInVertically(tween(200, easing = EaseOut)) { (it * 0.05f).toInt() }
            },
            exitTransition = {
                fadeOut(tween(150, easing = EaseIn))
            },
            popEnterTransition = {
                fadeIn(tween(200, easing = EaseOut))
            },
            popExitTransition = {
                fadeOut(tween(150, easing = EaseIn)) +
                        slideOutVertically(tween(150, easing = EaseIn)) { (it * 0.05f).toInt() }
            },
        ) {
            composable(Screen.Palettes.route) {
                PalettesScreen(vm = vm, onSelectPalette = { id ->
                    navController.navigate(Screen.PaletteDetail.route(id))
                })
            }
            composable(Screen.PaletteDetail.route) { backStack ->
                val paletteId = backStack.arguments?.getString("paletteId") ?: return@composable
                PaletteDetailScreen(
                    vm = vm,
                    paletteId = paletteId,
                    onBack = { navController.popBackStack() },
                )
            }
            composable(Screen.Tokens.route) { TokensScreen(vm = vm) }
            composable(Screen.Export.route) { ExportScreen(vm = vm) }
        }
    }
}

@Composable
private fun NavigationPill(
    items: List<NavItem>,
    selectedIndex: Int,
    onItemSelected: (Int) -> Unit,
    modifier: Modifier = Modifier,
) {
    val indicatorOffset by animateDpAsState(
        targetValue = PILL_ITEM_SIZE * selectedIndex,
        animationSpec = spring(
            dampingRatio = Spring.DampingRatioMediumBouncy,
            stiffness = Spring.StiffnessMedium,
        ),
        label = "pillIndicator",
    )

    Box(
        modifier = modifier
            .shadow(
                elevation = 12.dp,
                shape = RoundedCornerShape(999.dp),
                ambientColor = Color.Black.copy(alpha = 0.5f),
                spotColor = Color.Black.copy(alpha = 0.5f),
            )
            .clip(RoundedCornerShape(999.dp))
            .background(Surface)
            .padding(PILL_PADDING),
    ) {
        // Sliding indicator underneath icons
        Box(
            modifier = Modifier
                .offset(x = indicatorOffset)
                .size(PILL_ITEM_SIZE)
                .clip(RoundedCornerShape(999.dp))
                .background(PrimaryContainer),
        )

        // Icon row on top of indicator
        Row {
            items.forEachIndexed { index, item ->
                val isSelected = index == selectedIndex
                val iconScale by animateFloatAsState(
                    targetValue = if (isSelected) 1.12f else 1f,
                    animationSpec = spring(
                        dampingRatio = Spring.DampingRatioMediumBouncy,
                        stiffness = Spring.StiffnessMedium,
                    ),
                    label = "iconScale$index",
                )
                Box(
                    modifier = Modifier
                        .size(PILL_ITEM_SIZE)
                        .clickable(
                            interactionSource = remember { MutableInteractionSource() },
                            indication = null,
                        ) { onItemSelected(index) },
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(
                        imageVector = item.icon,
                        contentDescription = item.label,
                        tint = if (isSelected) OnPrimaryContainer else TextDisabled,
                        modifier = Modifier
                            .size(22.dp)
                            .graphicsLayer(scaleX = iconScale, scaleY = iconScale),
                    )
                }
            }
        }
    }
}
