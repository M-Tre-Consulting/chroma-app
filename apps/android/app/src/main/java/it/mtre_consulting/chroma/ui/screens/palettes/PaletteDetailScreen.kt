package it.mtre_consulting.chroma.ui.screens.palettes

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.spring
import androidx.compose.animation.expandVertically
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Add
import androidx.compose.material.icons.rounded.ArrowBack
import androidx.compose.material.icons.rounded.Close
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.FloatingActionButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.github.skydoves.colorpicker.compose.HsvColorPicker
import com.github.skydoves.colorpicker.compose.rememberColorPickerController
import it.mtre_consulting.chroma.ui.theme.Background
import it.mtre_consulting.chroma.ui.theme.OnSurface
import it.mtre_consulting.chroma.ui.theme.Outline
import it.mtre_consulting.chroma.ui.theme.Primary
import it.mtre_consulting.chroma.ui.theme.Surface
import it.mtre_consulting.chroma.ui.theme.SurfaceVariant
import it.mtre_consulting.chroma.ui.theme.TextDisabled
import it.mtre_consulting.chroma.ui.theme.TextSecondary
import it.mtre_consulting.chroma.ui.theme.WcagAABg
import it.mtre_consulting.chroma.ui.theme.WcagAAFg
import it.mtre_consulting.chroma.ui.theme.WcagAALargeBg
import it.mtre_consulting.chroma.ui.theme.WcagAALargeFg
import it.mtre_consulting.chroma.ui.theme.WcagAAABg
import it.mtre_consulting.chroma.ui.theme.WcagAAAFg
import it.mtre_consulting.chroma.ui.theme.WcagFailBg
import it.mtre_consulting.chroma.ui.theme.WcagFailFg
import it.mtre_consulting.chroma.util.WcagLevel
import it.mtre_consulting.chroma.util.contrastRatio
import it.mtre_consulting.chroma.util.wcagLabel
import it.mtre_consulting.chroma.util.wcagLevel
import it.mtre_consulting.chroma.viewmodel.AppViewModel
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PaletteDetailScreen(vm: AppViewModel, paletteId: String, onBack: () -> Unit) {
    val palettes by vm.palettes.collectAsState()
    val palette = palettes.find { it.id == paletteId } ?: return

    var expandedColourId by remember { mutableStateOf<String?>(null) }
    var showAddSheet by remember { mutableStateOf(false) }
    var pickedHex by remember { mutableStateOf("9d93f9") }
    var colourName by remember { mutableStateOf("") }
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    val scope = rememberCoroutineScope()

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Background),
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            // Header
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .statusBarsPadding()
                    .padding(start = 4.dp, end = 16.dp, top = 4.dp, bottom = 4.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(4.dp),
            ) {
                IconButton(onClick = onBack) {
                    Icon(Icons.Rounded.ArrowBack, contentDescription = "Back", tint = OnSurface)
                }
                Column(modifier = Modifier.weight(1f)) {
                    Text(palette.name, fontSize = 22.sp, fontWeight = FontWeight.Medium, color = OnSurface)
                    Text(
                        "${palette.colours.size} colour${if (palette.colours.size != 1) "s" else ""}",
                        fontSize = 13.sp,
                        color = TextSecondary,
                    )
                }
            }

            LazyColumn(
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                if (palette.colours.isEmpty()) {
                    item {
                        Box(
                            modifier = Modifier.fillMaxWidth().padding(top = 48.dp),
                            contentAlignment = Alignment.Center,
                        ) {
                            Text("Tap + to add a colour", fontSize = 14.sp, color = TextDisabled)
                        }
                    }
                }
                items(palette.colours, key = { it.id }) { colour ->
                    val isExpanded = expandedColourId == colour.id
                    val hexValid = colour.hex.matches(Regex("^#[0-9a-fA-F]{6}$"))
                    val ratioWhite = if (hexValid) contrastRatio(colour.hex, "#ffffff") else null
                    val ratioBlack = if (hexValid) contrastRatio(colour.hex, "#000000") else null
                    val levelWhite = ratioWhite?.let { wcagLevel(it) }

                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(16.dp))
                            .background(Surface)
                            .clickable { expandedColourId = if (isExpanded) null else colour.id }
                            .padding(14.dp),
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(12.dp),
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(44.dp)
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(
                                        runCatching {
                                            Color(android.graphics.Color.parseColor(colour.hex))
                                        }.getOrDefault(Color.Gray)
                                    ),
                            )
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    colour.name.ifBlank { colour.hex },
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = OnSurface,
                                )
                                Text(colour.hex.uppercase(), fontSize = 11.sp, color = TextSecondary)
                            }
                            if (levelWhite != null) WcagBadge(levelWhite)
                            IconButton(onClick = { vm.removeColour(paletteId, colour.id) }) {
                                Icon(
                                    Icons.Rounded.Close,
                                    contentDescription = "Delete",
                                    tint = TextDisabled,
                                    modifier = Modifier.size(18.dp),
                                )
                            }
                        }

                        AnimatedVisibility(
                            visible = isExpanded,
                            enter = expandVertically(spring(stiffness = Spring.StiffnessMediumLow)),
                            exit = shrinkVertically(spring(stiffness = Spring.StiffnessMediumLow)),
                        ) {
                            Column(
                                modifier = Modifier.padding(top = 12.dp),
                                verticalArrangement = Arrangement.spacedBy(8.dp),
                            ) {
                                ContrastRow("vs white", Color.White, ratioWhite, levelWhite)
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clip(RoundedCornerShape(8.dp))
                                        .background(Color.White)
                                        .padding(10.dp),
                                ) {
                                    Text(
                                        "The quick brown fox",
                                        color = runCatching {
                                            Color(android.graphics.Color.parseColor(colour.hex))
                                        }.getOrDefault(Color.Gray),
                                        fontSize = 14.sp,
                                    )
                                }
                                val levelBlack = ratioBlack?.let { wcagLevel(it) }
                                ContrastRow("vs black", Color.Black, ratioBlack, levelBlack)
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clip(RoundedCornerShape(8.dp))
                                        .background(Color.Black)
                                        .padding(10.dp),
                                ) {
                                    Text(
                                        "The quick brown fox",
                                        color = runCatching {
                                            Color(android.graphics.Color.parseColor(colour.hex))
                                        }.getOrDefault(Color.Gray),
                                        fontSize = 14.sp,
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        FloatingActionButton(
            onClick = { showAddSheet = true },
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .navigationBarsPadding()
                .padding(16.dp),
            containerColor = Primary,
            contentColor = Color.White,
            elevation = FloatingActionButtonDefaults.elevation(defaultElevation = 4.dp),
        ) {
            Icon(Icons.Rounded.Add, contentDescription = "Add colour")
        }
    }

    if (showAddSheet) {
        val controller = rememberColorPickerController()
        ModalBottomSheet(
            onDismissRequest = { showAddSheet = false },
            sheetState = sheetState,
            containerColor = Surface,
        ) {
            Column(
                modifier = Modifier
                    .padding(horizontal = 20.dp)
                    .padding(bottom = 32.dp)
                    .imePadding(),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                Text("Add colour", fontSize = 17.sp, fontWeight = FontWeight.SemiBold, color = OnSurface)

                HsvColorPicker(
                    modifier = Modifier
                        .fillMaxWidth()
                        .size(260.dp),
                    controller = controller,
                    onColorChanged = { pickedHex = it.hexCode.take(6) },
                )

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                ) {
                    Box(
                        modifier = Modifier
                            .size(44.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(
                                runCatching {
                                    Color(android.graphics.Color.parseColor("#$pickedHex"))
                                }.getOrDefault(Primary)
                            ),
                    )
                    OutlinedTextField(
                        value = pickedHex,
                        onValueChange = { pickedHex = it.trimStart('#').take(6).uppercase() },
                        prefix = { Text("#", color = TextSecondary) },
                        singleLine = true,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp),
                        keyboardOptions = KeyboardOptions(capitalization = KeyboardCapitalization.Characters),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Primary,
                            unfocusedBorderColor = Outline,
                            focusedTextColor = OnSurface,
                            unfocusedTextColor = OnSurface,
                            cursorColor = Primary,
                            focusedContainerColor = SurfaceVariant,
                            unfocusedContainerColor = SurfaceVariant,
                        ),
                    )
                }

                OutlinedTextField(
                    value = colourName,
                    onValueChange = { colourName = it },
                    placeholder = { Text("Colour name (optional)", color = TextSecondary) },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Primary,
                        unfocusedBorderColor = Outline,
                        focusedTextColor = OnSurface,
                        unfocusedTextColor = OnSurface,
                        cursorColor = Primary,
                        focusedContainerColor = SurfaceVariant,
                        unfocusedContainerColor = SurfaceVariant,
                    ),
                )

                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedButton(
                        onClick = {
                            scope.launch { sheetState.hide() }.invokeOnCompletion { showAddSheet = false }
                        },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(999.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Primary),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = Primary),
                    ) { Text("Cancel") }
                    Button(
                        onClick = {
                            val hex = "#${pickedHex.take(6).padEnd(6, '0')}"
                            vm.addColour(paletteId, hex, colourName)
                            colourName = ""
                            pickedHex = "9d93f9"
                            scope.launch { sheetState.hide() }.invokeOnCompletion { showAddSheet = false }
                        },
                        modifier = Modifier.weight(2f),
                        shape = RoundedCornerShape(999.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Primary),
                    ) { Text("Add colour") }
                }
            }
        }
    }
}

@Composable
private fun WcagBadge(level: WcagLevel) {
    val (bg, fg) = when (level) {
        WcagLevel.AAA -> WcagAAABg to WcagAAAFg
        WcagLevel.AA -> WcagAABg to WcagAAFg
        WcagLevel.AA_LARGE -> WcagAALargeBg to WcagAALargeFg
        WcagLevel.FAIL -> WcagFailBg to WcagFailFg
    }
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(999.dp))
            .background(bg)
            .padding(horizontal = 8.dp, vertical = 3.dp),
    ) {
        Text(wcagLabel(level), fontSize = 10.sp, fontWeight = FontWeight.SemiBold, color = fg)
    }
}

@Composable
private fun ContrastRow(label: String, bgColor: Color, ratio: Double?, level: WcagLevel?) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        Box(
            modifier = Modifier
                .size(20.dp)
                .clip(RoundedCornerShape(6.dp))
                .background(bgColor),
        )
        Text(label, fontSize = 12.sp, color = TextSecondary, modifier = Modifier.weight(1f))
        if (ratio != null) Text("${ratio}:1", fontSize = 12.sp, fontWeight = FontWeight.Medium, color = OnSurface)
        if (level != null) WcagBadge(level)
    }
}
