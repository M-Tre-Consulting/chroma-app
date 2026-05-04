package it.mtre_consulting.chroma.ui.screens.tokens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.spring
import androidx.compose.animation.expandVertically
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.asPaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Add
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.FilledIconButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButtonDefaults
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.foundation.layout.Spacer
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
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

@Composable
fun TokensScreen(vm: AppViewModel) {
    val groups by vm.tokenGroups.collectAsState()
    val palettes by vm.palettes.collectAsState()
    var newGroupName by remember { mutableStateOf("") }
    val newTokenNames = remember { mutableStateMapOf<String, String>() }
    var expandedGroupId by remember { mutableStateOf<String?>(null) }

    fun doAddGroup() {
        if (newGroupName.isBlank()) return
        vm.addGroup(newGroupName.trim())
        newGroupName = ""
    }

    val navBarPadding = WindowInsets.navigationBars.asPaddingValues().calculateBottomPadding()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Background)
            .imePadding(),
    ) {
        // Header
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .statusBarsPadding()
                .padding(start = 16.dp, end = 16.dp, top = 8.dp, bottom = 4.dp),
        ) {
            Text("Tokens", fontSize = 28.sp, fontWeight = FontWeight.Medium, color = OnSurface, letterSpacing = (-0.5).sp)
            Text(
                "${groups.size} group${if (groups.size != 1) "s" else ""}",
                fontSize = 13.sp,
                color = TextSecondary,
                modifier = Modifier.padding(top = 1.dp),
            )
        }

        Box(modifier = Modifier.weight(1f).fillMaxWidth()) {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(horizontal = 12.dp, top = 8.dp, bottom = navBarPadding + PILL_GAP + PILL_HEIGHT + 72.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            if (groups.isEmpty()) {
                item {
                    Box(
                        modifier = Modifier.fillMaxWidth().padding(top = 48.dp),
                        contentAlignment = Alignment.Center,
                    ) {
                        Text("Add a group to start mapping tokens", fontSize = 14.sp, color = TextDisabled)
                    }
                }
            }

            items(groups, key = { it.id }) { group ->
                val isExpanded = expandedGroupId == group.id
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(16.dp))
                        .background(Surface),
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { expandedGroupId = if (isExpanded) null else group.id }
                            .padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween,
                    ) {
                        Text(
                            group.name.uppercase(),
                            fontSize = 11.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = TextSecondary,
                            letterSpacing = 0.08.sp,
                        )
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                            Text(
                                "${group.tokens.size} token${if (group.tokens.size != 1) "s" else ""}",
                                fontSize = 11.sp,
                                color = TextDisabled,
                            )
                            TextButton(
                                onClick = { vm.removeGroup(group.id) },
                                colors = ButtonDefaults.textButtonColors(contentColor = Color(0xFFF87171)),
                            ) {
                                Text("Remove", fontSize = 12.sp)
                            }
                        }
                    }

                    AnimatedVisibility(
                        visible = isExpanded,
                        enter = expandVertically(spring(stiffness = Spring.StiffnessMediumLow)),
                        exit = shrinkVertically(spring(stiffness = Spring.StiffnessMediumLow)),
                    ) {
                        Column(
                            modifier = Modifier
                                .border(0.5.dp, Outline, RoundedCornerShape(bottomStart = 16.dp, bottomEnd = 16.dp))
                                .padding(12.dp),
                            verticalArrangement = Arrangement.spacedBy(8.dp),
                        ) {
                            val allColours = palettes.flatMap { p -> p.colours.map { c -> c to p.id } }

                            group.tokens.forEach { token ->
                                val assignedPalette = palettes.find { it.id == token.value.paletteId }
                                val assignedColour = assignedPalette?.colours?.find { it.id == token.value.colourId }

                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clip(RoundedCornerShape(12.dp))
                                        .background(SurfaceVariant)
                                        .padding(10.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(24.dp)
                                            .clip(RoundedCornerShape(6.dp))
                                            .background(
                                                assignedColour?.hex?.let {
                                                    runCatching { Color(android.graphics.Color.parseColor(it)) }.getOrNull()
                                                } ?: Color(0xFF2A2A2A)
                                            ),
                                    )
                                    Text(
                                        token.name,
                                        fontSize = 12.sp,
                                        fontFamily = FontFamily.Monospace,
                                        color = Color(0xFFC0BFBA),
                                        modifier = Modifier.weight(1f),
                                        maxLines = 1,
                                    )
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(8.dp))
                                            .background(Color(0xFF2E2E2E))
                                            .clickable {
                                                if (allColours.isEmpty()) return@clickable
                                                val idx = allColours.indexOfFirst { (c, _) -> c.id == token.value.colourId }
                                                val next = allColours[(idx + 1) % allColours.size]
                                                vm.assignColour(group.id, token.id, next.second, next.first.id)
                                            }
                                            .padding(horizontal = 10.dp, vertical = 5.dp),
                                    ) {
                                        Text(
                                            assignedColour?.let { it.name.ifBlank { it.hex } } ?: "Assign",
                                            fontSize = 11.sp,
                                            color = Primary,
                                        )
                                    }
                                    Box(
                                        modifier = Modifier
                                            .size(36.dp)
                                            .clip(RoundedCornerShape(8.dp))
                                            .clickable { vm.removeToken(group.id, token.id) },
                                        contentAlignment = Alignment.Center,
                                    ) {
                                        Text("✕", color = TextDisabled, fontSize = 13.sp)
                                    }
                                }
                            }

                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp),
                            ) {
                                OutlinedTextField(
                                    value = newTokenNames[group.id] ?: "",
                                    onValueChange = { newTokenNames[group.id] = it },
                                    placeholder = { Text("Token name…", color = TextSecondary, fontSize = 13.sp) },
                                    singleLine = true,
                                    modifier = Modifier.weight(1f),
                                    shape = RoundedCornerShape(12.dp),
                                    textStyle = TextStyle(fontSize = 13.sp),
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
                                    keyboardActions = KeyboardActions(onDone = {
                                        val name = newTokenNames[group.id]?.trim() ?: return@KeyboardActions
                                        if (name.isNotEmpty()) { vm.addToken(group.id, name); newTokenNames[group.id] = "" }
                                    }),
                                )
                                Button(
                                    onClick = {
                                        val name = newTokenNames[group.id]?.trim() ?: return@Button
                                        if (name.isNotEmpty()) { vm.addToken(group.id, name); newTokenNames[group.id] = "" }
                                    },
                                    shape = RoundedCornerShape(12.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = Primary),
                                ) { Text("Add", fontWeight = FontWeight.SemiBold) }
                            }
                        }
                    }
                }
            }
        }

        // Floating add bar — token groups scroll behind gradient scrim
        Column(modifier = Modifier.fillMaxWidth().align(Alignment.BottomStart)) {
            Spacer(
                modifier = Modifier.fillMaxWidth().height(40.dp)
                    .background(Brush.verticalGradient(listOf(Color.Transparent, Background))),
            )
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Background)
                    .navigationBarsPadding()
                    .padding(bottom = PILL_GAP + PILL_HEIGHT)
                    .padding(start = 12.dp, end = 12.dp, vertical = 10.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                OutlinedTextField(
                    value = newGroupName,
                    onValueChange = { newGroupName = it },
                    placeholder = { Text("New group…", color = TextSecondary) },
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
                    keyboardActions = KeyboardActions(onDone = { doAddGroup() }),
                )
                FilledIconButton(
                    onClick = { doAddGroup() },
                    modifier = Modifier.size(52.dp),
                    shape = RoundedCornerShape(14.dp),
                    colors = IconButtonDefaults.filledIconButtonColors(containerColor = Primary),
                ) {
                    Icon(Icons.Rounded.Add, contentDescription = "Add", tint = Color.White)
                }
            }
        }
        } // end Box
    }
}
