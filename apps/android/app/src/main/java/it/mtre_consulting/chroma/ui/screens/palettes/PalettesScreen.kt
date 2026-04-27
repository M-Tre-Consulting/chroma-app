package it.mtre_consulting.chroma.ui.screens.palettes

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBars
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Add
import androidx.compose.material.icons.rounded.Close
import androidx.compose.material3.FilledIconButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.IconButtonDefaults
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
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
import it.mtre_consulting.chroma.viewmodel.AppViewModel

@Composable
fun PalettesScreen(vm: AppViewModel, onSelectPalette: (String) -> Unit) {
    val palettes by vm.palettes.collectAsState()
    var newName by remember { mutableStateOf("") }

    fun doAdd() {
        if (newName.isBlank()) return
        vm.addPalette(newName.trim())
        newName = ""
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Background)
            .windowInsetsPadding(WindowInsets.statusBars)
            .imePadding(),
    ) {
        // Header
        Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 16.dp)) {
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
                modifier = Modifier.padding(top = 2.dp),
            )
        }

        // List
        LazyColumn(
            modifier = Modifier.weight(1f),
            contentPadding = androidx.compose.foundation.layout.PaddingValues(
                horizontal = 12.dp, vertical = 8.dp,
            ),
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
                    // Swatches
                    Row(horizontalArrangement = Arrangement.spacedBy(5.dp)) {
                        val display = palette.colours.take(5)
                        if (display.isEmpty()) {
                            Box(
                                modifier = Modifier.size(24.dp).clip(RoundedCornerShape(8.dp))
                                    .background(Color(0xFF2E2E2E)),
                            )
                        } else {
                            display.forEach { colour ->
                                Box(
                                    modifier = Modifier.size(24.dp).clip(RoundedCornerShape(8.dp))
                                        .background(Color(android.graphics.Color.parseColor(colour.hex))),
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

        // Add bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Background)
                .padding(horizontal = 12.dp, vertical = 12.dp),
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
}
