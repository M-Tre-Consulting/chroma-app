package it.mtre_consulting.chroma.ui.screens.palettes

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.asPaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Add
import androidx.compose.material.icons.rounded.Close
import androidx.compose.material.icons.rounded.Info
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilledIconButton
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.IconButtonDefaults
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import it.mtre_consulting.chroma.ui.theme.Background
import it.mtre_consulting.chroma.ui.theme.OnSurface
import it.mtre_consulting.chroma.ui.theme.Outline
import it.mtre_consulting.chroma.ui.theme.Primary
import it.mtre_consulting.chroma.ui.theme.Surface
import it.mtre_consulting.chroma.ui.theme.SurfaceVariant
import it.mtre_consulting.chroma.ui.theme.TextDisabled
import it.mtre_consulting.chroma.ui.theme.TextSecondary
import it.mtre_consulting.chroma.ui.navigation.PILL_GAP
import it.mtre_consulting.chroma.ui.navigation.PILL_HEIGHT
import it.mtre_consulting.chroma.viewmodel.AppViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PalettesScreen(vm: AppViewModel, onSelectPalette: (String) -> Unit) {
    val palettes by vm.palettes.collectAsState()
    var newName by remember { mutableStateOf("") }
    var showAbout by remember { mutableStateOf(false) }
    val aboutSheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    fun doAdd() {
        if (newName.isBlank()) return
        vm.addPalette(newName.trim())
        newName = ""
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Background)
            .imePadding(),
    ) {
        // Header — status bar inset applied here only, not the whole screen
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .statusBarsPadding()
                .padding(start = 16.dp, end = 8.dp, top = 8.dp, bottom = 4.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "Chroma",
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Medium,
                    color = OnSurface,
                    letterSpacing = (-0.5).sp,
                )
                Text(
                    text = "${palettes.size} palette${if (palettes.size != 1) "s" else ""}",
                    fontSize = 13.sp,
                    color = TextSecondary,
                    modifier = Modifier.padding(top = 1.dp),
                )
            }
            IconButton(onClick = { showAbout = true }) {
                Icon(Icons.Rounded.Info, contentDescription = "About", tint = TextDisabled)
            }
        }

        // List
        LazyColumn(
            modifier = Modifier.weight(1f),
            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 8.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            if (palettes.isEmpty()) {
                item {
                    Box(
                        modifier = Modifier.fillMaxWidth().padding(top = 48.dp),
                        contentAlignment = Alignment.Center,
                    ) {
                        Text("Create your first palette below", fontSize = 14.sp, color = TextDisabled)
                    }
                }
            }
            items(palettes, key = { it.id }) { palette ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(16.dp))
                        .background(Surface)
                        .clickable { onSelectPalette(palette.id) }
                        .padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    Row(horizontalArrangement = Arrangement.spacedBy(5.dp)) {
                        val display = palette.colours.take(5)
                        if (display.isEmpty()) {
                            Box(
                                modifier = Modifier
                                    .size(24.dp)
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(Color(0xFF2E2E2E)),
                            )
                        } else {
                            display.forEach { colour ->
                                Box(
                                    modifier = Modifier
                                        .size(24.dp)
                                        .clip(RoundedCornerShape(8.dp))
                                        .background(
                                            runCatching {
                                                Color(android.graphics.Color.parseColor(colour.hex))
                                            }.getOrDefault(Color(0xFF2E2E2E))
                                        ),
                                )
                            }
                        }
                    }
                    Column(modifier = Modifier.weight(1f)) {
                        Text(palette.name, fontSize = 15.sp, fontWeight = FontWeight.Medium, color = OnSurface)
                        Text(
                            "${palette.colours.size} colour${if (palette.colours.size != 1) "s" else ""}",
                            fontSize = 12.sp,
                            color = TextSecondary,
                            modifier = Modifier.padding(top = 2.dp),
                        )
                    }
                    IconButton(onClick = { vm.removePalette(palette.id) }) {
                        Icon(Icons.Rounded.Close, contentDescription = "Delete", tint = TextDisabled)
                    }
                }
            }
        }

        // Add bar — sits above the pill via navigationBarsPadding + pill clearance
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Background)
                .navigationBarsPadding()
                .padding(start = 12.dp, end = 12.dp, top = 10.dp, bottom = 10.dp + PILL_HEIGHT + PILL_GAP),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            OutlinedTextField(
                value = newName,
                onValueChange = { newName = it },
                placeholder = { Text("New palette…", color = TextSecondary) },
                singleLine = true,
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(14.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Primary,
                    unfocusedBorderColor = Outline,
                    focusedTextColor = OnSurface,
                    unfocusedTextColor = OnSurface,
                    cursorColor = Primary,
                    focusedContainerColor = SurfaceVariant,
                    unfocusedContainerColor = SurfaceVariant,
                ),
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
                keyboardActions = KeyboardActions(onDone = { doAdd() }),
            )
            FilledIconButton(
                onClick = { doAdd() },
                modifier = Modifier.size(52.dp),
                shape = RoundedCornerShape(14.dp),
                colors = IconButtonDefaults.filledIconButtonColors(containerColor = Primary),
            ) {
                Icon(Icons.Rounded.Add, contentDescription = "Add", tint = Color.White)
            }
        }
    }

    if (showAbout) {
        ModalBottomSheet(
            onDismissRequest = { showAbout = false },
            sheetState = aboutSheetState,
            containerColor = Surface,
        ) {
            AboutContent()
        }
    }
}

@Composable
private fun AboutContent() {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp)
            .padding(bottom = 40.dp),
        verticalArrangement = Arrangement.spacedBy(20.dp),
    ) {
        // App identity
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(14.dp)) {
            Box(
                modifier = Modifier
                    .size(52.dp)
                    .clip(RoundedCornerShape(14.dp))
                    .background(Color(0xFF1E1E4A)),
                contentAlignment = Alignment.Center,
            ) {
                Text("◉", fontSize = 24.sp, color = Primary)
            }
            Column {
                Text("Chroma", fontSize = 20.sp, fontWeight = FontWeight.SemiBold, color = OnSurface)
                Text("Version 1.0", fontSize = 13.sp, color = TextSecondary)
            }
        }

        Text(
            "A local-first color palette and design token manager. Create color systems, map them to design tokens, and export to CSS, SCSS, JSON, Tailwind, or Android XML.",
            fontSize = 14.sp,
            color = TextSecondary,
            lineHeight = 20.sp,
        )

        HorizontalDivider(color = Outline, thickness = 0.5.dp)

        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            AboutRow(label = "Storage", value = "Local only — no cloud, no account")
            AboutRow(label = "Data format", value = "JSON via DataStore Preferences")
            AboutRow(label = "Export targets", value = "CSS · SCSS · JSON · Tailwind · Android XML")
            AboutRow(label = "WCAG support", value = "Contrast ratio 2.0 AA / AAA checking")
        }

        HorizontalDivider(color = Outline, thickness = 0.5.dp)

        Text(
            "Built with Kotlin · Jetpack Compose · Material 3 Expressive",
            fontSize = 12.sp,
            color = TextDisabled,
        )
    }
}

@Composable
private fun AboutRow(label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.Top,
    ) {
        Text(
            text = label,
            fontSize = 13.sp,
            color = TextSecondary,
            modifier = Modifier.width(116.dp),
        )
        Text(
            text = value,
            fontSize = 13.sp,
            color = OnSurface,
            fontWeight = FontWeight.Medium,
            modifier = Modifier.weight(1f),
        )
    }
}
