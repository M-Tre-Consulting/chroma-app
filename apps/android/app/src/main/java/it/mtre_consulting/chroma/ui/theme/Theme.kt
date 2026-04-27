package it.mtre_consulting.chroma.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val ChromaDarkColorScheme = darkColorScheme(
    primary = Primary,
    onPrimary = OnPrimary,
    primaryContainer = PrimaryContainer,
    onPrimaryContainer = OnPrimaryContainer,
    secondary = TextSecondary,
    onSecondary = Background,
    secondaryContainer = SurfaceVariant,
    onSecondaryContainer = OnSurface,
    background = Background,
    onBackground = OnBackground,
    surface = Surface,
    onSurface = OnSurface,
    surfaceVariant = SurfaceVariant,
    onSurfaceVariant = OnSurfaceVariant,
    outline = Outline,
    outlineVariant = OutlineVariant,
)

@Composable
fun ChromaTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = ChromaDarkColorScheme,
        content = content,
    )
}
