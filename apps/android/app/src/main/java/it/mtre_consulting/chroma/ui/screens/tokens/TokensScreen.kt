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
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBars
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
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
import androidx.compose.ui.graphics.Color
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

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Background)
            .windowInsetsPadding(WindowInsets.statusBars)
            .imePadding(),
    ) {
        // Header
        Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 16.dp)) {
            Text("Tokens", fontSize = 28.sp, fontWeight = FontWeight.Medium, color = OnSurface, letterSpacing = (-0.5).sp)
            Text(
                "${groups.size} group${if (groups.size != 1) "s" else ""}",
                fontSize = 13.sp,
                color = TextSecondary,
                modifier = Modifier.padding(top = 2.dp),
            )
        }

        // Groups
        Column(
            modifier = Modifier
                .weight(1f)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 12.dp, vertical = 8.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            if (groups.isEmpty()) {
                Box(modifier = Modifier.fillMaxWidth().padding(top = 48.dp), contentAlignment = Alignment.Center) {
                    Text("Add a group to start mapping tokens", fontSize = 14.sp, color = TextDisabled)
                }
            }
            groups.forEach { group ->
                val isExpanded = expandedGroupId == group.id
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(16.dp))
                        .background(Surface),
                ) {
                    // Group header
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { expandedGroupId = if (isExpanded) null else group.id }
                            .padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween,
                    ) {
                        Text(group.name.uppercase(), fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = TextSecondary, letterSpacing = 0.08.sp)
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                            Text("${group.tokens.size} token${if (group.tokens.size != 1) "s" else ""}", fontSize = 11.sp, color = TextDisabled)
                            TextButton(
                                onClick = { vm.removeGroup(group.id) },
                                colors = ButtonDefaults.textButtonColors(contentColor = Color(0xFFF87171)),
                            ) {
                                Text("Remove", fontSize = 12.sp)
                            }
                        }
                    }

                    // Tokens
                    AnimatedVisibility(
                        visible = isExpanded,
                        enter = expandVertically(spring(stiffness = Spring.StiffnessMediumLow)),
                        exit = shrinkVertically(spring(stiffness = Spring.StiffnessMediumLow)),
                    ) {
                        Column(
                            modifier = Modifier
                                .border(width = 0.5.dp, color = Outline, shape = RoundedCornerShape(bottomStart = 16.dp, bottomEnd = 16.dp))
                                .padding(12.dp),
                            verticalArrangement = Arrangement.spacedBy(8.dp),
                        ) {
                            group.tokens.forEach { token ->
                                val assignedPalette = palettes.find { it.id == token.value.paletteId }
                                val assignedColour = assignedPalette?.colours?.find { it.id == token.value.colourId }
                                val allColours = palettes.flatMap { p -> p.colours.map { c -> c to p.id } }

                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clip(RoundedCornerShape(12.dp))
                                        .background(SurfaceVariant)
                                        .padding(10.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                                ) {
                                    val swatchColor = assignedColour?.hex?.let {
                                        runCatching { Color(android.graphics.Color.parseColor(it)) }.getOrNull()
                                    } ?: Color(0xFF2A2A2A)
                                    Box(
                                        modifier = Modifier.size(24.dp).clip(RoundedCornerShape(6.dp))
                                            .background(swatchColor),
                                    )
                                    Text(
                                        token.name,
                                        fontSize = 12.sp,
                                        fontFamily = FontFamily.Monospace,
                                        color = Color(0xFFC0BFBA),
                                        modifier = Modifier.weight(1f),
                                        maxLines = 1,
                                    )
                                    // Assign button cycles colours
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(8.dp))
                                            .background(Color(0xFF2E2E2E))
                                            .clickable {
                                                if (allColours.isEmpty()) return@clickable
                                                val currentIndex = allColours.indexOfFirst { (c, _) -> c.id == token.value.colourId }
                                                val next = allColours[(currentIndex + 1) % allColours.size]
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

                            // Add token row
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
                                    colors = OutlinedTextFieldDefaults.colors(
                                        focusedBorderColor = Primary,
                                        unfocusedBorderColor = Outline,
                                        focusedTextColor = OnSurface,
                                        unfocusedTextColor = OnSurface,
                                        cursorColor = Primary,
                                        focusedContainerColor = SurfaceVariant,
                                        unfocusedContainerColor = SurfaceVariant,
                                    ),
                                    textStyle = androidx.compose.ui.text.TextStyle(fontSize = 13.sp),
                                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
                                    keyboardActions = KeyboardActions(onDone = {
                                        val name = newTokenNames[group.id]?.trim() ?: return@KeyboardActions
                                        if (name.isNotEmpty()) {
                                            vm.addToken(group.id, name)
                                            newTokenNames[group.id] = ""
                                        }
                                    }),
                                )
                                Button(
                                    onClick = {
                                        val name = newTokenNames[group.id]?.trim() ?: return@Button
                                        if (name.isNotEmpty()) {
                                            vm.addToken(group.id, name)
                                            newTokenNames[group.id] = ""
                                        }
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

        // Add group bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Background)
                .padding(horizontal = 12.dp, vertical = 12.dp),
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
}
