package it.mtre_consulting.chroma.ui.navigation

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.EaseIn
import androidx.compose.animation.core.EaseOut
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.animation.expandHorizontally
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkHorizontally
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.FileDownload
import androidx.compose.material.icons.rounded.Palette
import androidx.compose.material.icons.rounded.Style
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
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

// Pill geometry: 4dp outer padding × 2 + 14dp item padding × 2 + 22dp icon = 58dp tall
internal val PILL_HEIGHT: Dp = 58.dp
internal val PILL_GAP: Dp = 8.dp

@Composable
fun AppNavigation(vm: AppViewModel) {
    val navController = rememberNavController()
    val navBackStack by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStack?.destination?.route
    val showBottomBar = currentRoute in tabRoutes
    val selectedIndex = navItems.indexOfFirst { it.route == currentRoute }.coerceAtLeast(0)

    // Stable callback — doesn't change on every recomposition
    val onTabSelected = remember(navController) {
        { index: Int ->
            navController.navigate(navItems[index].route) {
                popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                launchSingleTop = true
                restoreState = true
            }
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Background),
    ) {
        NavHost(
            navController = navController,
            startDestination = Screen.Palettes.route,
            modifier = Modifier.fillMaxSize(),
            // Tab switches → crossfade only (no slide — slides look like a reload)
            // Stack push/pop → subtle upward slide
            enterTransition = {
                val tabSwitch = initialState.destination.route in tabRoutes &&
                        targetState.destination.route in tabRoutes
                if (tabSwitch) fadeIn(tween(180))
                else fadeIn(tween(200, easing = EaseOut)) +
                        slideInVertically(tween(200, easing = EaseOut)) { (it * 0.04f).toInt() }
            },
            exitTransition = {
                fadeOut(tween(130, easing = EaseIn))
            },
            popEnterTransition = {
                fadeIn(tween(180, easing = EaseOut))
            },
            popExitTransition = {
                fadeOut(tween(130, easing = EaseIn)) +
                        slideOutVertically(tween(130, easing = EaseIn)) { (it * 0.04f).toInt() }
            },
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
            composable(Screen.Tokens.route) { TokensScreen(vm = vm) }
            composable(Screen.Export.route) { ExportScreen(vm = vm) }
        }

        // True floating pill — pure overlay, no space reserved below it.
        // Screens add their own bottom content padding equal to
        // PILL_HEIGHT + PILL_GAP + navigationBarsHeight so the last item
        // can scroll fully into view.
        AnimatedVisibility(
            visible = showBottomBar,
            modifier = Modifier.align(Alignment.BottomCenter),
            enter = fadeIn(tween(220)) + slideInVertically(tween(220, easing = EaseOut)) { it / 2 },
            exit = fadeOut(tween(160)) + slideOutVertically(tween(160, easing = EaseIn)) { it / 2 },
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .navigationBarsPadding()
                    .padding(bottom = PILL_GAP),
                contentAlignment = Alignment.Center,
            ) {
                NavigationPill(
                    items = navItems,
                    selectedIndex = selectedIndex,
                    onItemSelected = onTabSelected,
                )
            }
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
    Row(
        modifier = modifier
            .shadow(
                elevation = 16.dp,
                shape = RoundedCornerShape(999.dp),
                ambientColor = Color.Black.copy(alpha = 0.55f),
                spotColor = Color.Black.copy(alpha = 0.55f),
            )
            .clip(RoundedCornerShape(999.dp))
            .background(Surface)
            .padding(4.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(2.dp),
    ) {
        items.forEachIndexed { index, item ->
            val isSelected = index == selectedIndex

            val bgColor by animateColorAsState(
                targetValue = if (isSelected) PrimaryContainer else Color.Transparent,
                animationSpec = spring(dampingRatio = Spring.DampingRatioNoBouncy, stiffness = Spring.StiffnessMedium),
                label = "pillBg$index",
            )
            val iconTint by animateColorAsState(
                targetValue = if (isSelected) OnPrimaryContainer else TextDisabled,
                animationSpec = tween(180),
                label = "pillTint$index",
            )
            val hPadding by animateDpAsState(
                targetValue = if (isSelected) 18.dp else 13.dp,
                animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy, stiffness = Spring.StiffnessMedium),
                label = "pillHPad$index",
            )

            Row(
                modifier = Modifier
                    .clip(RoundedCornerShape(999.dp))
                    .background(bgColor)
                    .clickable(
                        interactionSource = remember { MutableInteractionSource() },
                        indication = null,
                    ) { onItemSelected(index) }
                    .padding(horizontal = hPadding, vertical = 14.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Icon(
                    imageVector = item.icon,
                    contentDescription = item.label,
                    tint = iconTint,
                    modifier = Modifier.size(22.dp),
                )
                AnimatedVisibility(
                    visible = isSelected,
                    enter = expandHorizontally(
                        spring(Spring.DampingRatioMediumBouncy, Spring.StiffnessMedium),
                        expandFrom = Alignment.Start,
                    ) + fadeIn(tween(160)),
                    exit = shrinkHorizontally(
                        spring(Spring.DampingRatioNoBouncy, Spring.StiffnessMediumLow),
                        shrinkTowards = Alignment.Start,
                    ) + fadeOut(tween(80)),
                ) {
                    Text(
                        text = item.label,
                        color = OnPrimaryContainer,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium,
                        modifier = Modifier.padding(start = 8.dp),
                    )
                }
            }
        }
    }
}
