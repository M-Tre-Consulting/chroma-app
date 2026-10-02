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
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import androidx.compose.foundation.Image
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import it.mtre_consulting.chroma.R
import it.mtre_consulting.chroma.util.MTre
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
import androidx.compose.ui.graphics.Brush
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
import androidx.core.graphics.toColorInt
import it.mtre_consulting.chroma.BuildConfig

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

    val navBarPadding = WindowInsets.navigationBars.asPaddingValues().calculateBottomPadding()

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

        // List + floating add bar — share a Box so the list scrolls behind the overlay
        Box(modifier = Modifier.weight(1f).fillMaxWidth()) {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(start = 12.dp, end = 12.dp, top = 8.dp, bottom = navBarPadding + PILL_GAP + PILL_HEIGHT + PILL_GAP + 72.dp),
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
                                                Color(colour.hex.toColorInt())
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

            item {
                BrandFooter(onInfoClick = { showAbout = true })
            }
        }

        // Floating add bar — palette cards scroll behind gradient scrim
        Column(modifier = Modifier.fillMaxWidth().align(Alignment.BottomStart)) {
            Spacer(
                modifier = Modifier.fillMaxWidth().height(40.dp)
                    .background(Brush.verticalGradient(listOf(Color.Transparent, Background))),
            )
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Background)
                    .padding(horizontal = 12.dp, vertical = 10.dp),
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
            // Transparent spacer so the Row background stops above the pill.
            // The root Box background (Background) fills the area behind the pill.
            Spacer(modifier = Modifier.fillMaxWidth().height(navBarPadding + PILL_GAP + PILL_HEIGHT + PILL_GAP))
        }
        } // end Box
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
    val context = LocalContext.current
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 24.dp)
            .padding(bottom = 40.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        // App identity with M-Tre Logo
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            Image(
                painter = painterResource(id = R.drawable.ic_mtre_logo),
                contentDescription = MTre.NAME,
                modifier = Modifier
                    .size(48.dp)
                    .clip(RoundedCornerShape(12.dp)),
            )
            Column {
                Text("Chroma", fontSize = 20.sp, fontWeight = FontWeight.SemiBold, color = OnSurface)
                Text("Versione ${BuildConfig.VERSION_NAME}", fontSize = 13.sp, color = TextSecondary)
                Text("${MTre.copyright}. Tutti i diritti riservati.", fontSize = 12.sp, color = TextSecondary)
            }
        }

        HorizontalDivider(color = Outline, thickness = 0.5.dp)

        // Privacy Policy
        Text("Informativa sulla privacy", fontSize = 15.sp, fontWeight = FontWeight.SemiBold, color = Primary)
        Text(
            "Chroma non raccoglie dati personali. Palette, colori e token restano esclusivamente su questo dispositivo: niente server, account utente, pubblicità, statistiche o tracciamento.",
            fontSize = 13.sp,
            color = TextSecondary,
            lineHeight = 18.sp,
        )
        Text(
            "L'applicazione funziona interamente offline e non effettua alcuna chiamata di rete. Puoi chiederci informazioni ed esercitare i tuoi diritti previsti dal GDPR (Regolamento UE 2016/679) scrivendo a ${MTre.EMAIL}. Eliminare l'applicazione cancella tutti i dati memorizzati.",
            fontSize = 13.sp,
            color = TextSecondary,
            lineHeight = 18.sp,
        )

        HorizontalDivider(color = Outline, thickness = 0.5.dp)

        // Titolare
        Text("Titolare", fontSize = 15.sp, fontWeight = FontWeight.SemiBold, color = Primary)
        Text("${MTre.NAME}, Savona, Italia", fontSize = 13.sp, color = OnSurface, fontWeight = FontWeight.Medium)
        MTre.OWNERS.forEach { owner ->
            Text(owner, fontSize = 12.sp, color = TextSecondary)
        }

        HorizontalDivider(color = Outline, thickness = 0.5.dp)

        // Licenza
        Text("Licenza", fontSize = 15.sp, fontWeight = FontWeight.SemiBold, color = Primary)
        Text(
            "Chroma è un software libero rilasciato sotto licenza GNU General Public License v2.0 (GPL-2.0). I calcoli di contrasto WCAG seguono le specifiche W3C WCAG 2.0 / 2.1.",
            fontSize = 13.sp,
            color = TextSecondary,
            lineHeight = 18.sp,
        )

        HorizontalDivider(color = Outline, thickness = 0.5.dp)

        // Contatti
        Text("Contatti", fontSize = 15.sp, fontWeight = FontWeight.SemiBold, color = Primary)
        Text(
            text = MTre.SITE_URL,
            fontSize = 13.sp,
            color = Primary,
            modifier = Modifier.clickable { MTre.openWebsite(context) },
        )
        Text(
            text = MTre.EMAIL,
            fontSize = 13.sp,
            color = Primary,
            modifier = Modifier.clickable { MTre.sendEmail(context) },
        )
        Text(
            text = MTre.REPO_URL,
            fontSize = 13.sp,
            color = Primary,
            modifier = Modifier.clickable { MTre.openRepo(context) },
        )

        Text(
            "Aggiornata il 2 ottobre 2026.",
            fontSize = 11.sp,
            color = TextDisabled,
        )
    }
}

@Composable
fun BrandFooter(onInfoClick: () -> Unit, modifier: Modifier = Modifier) {
    val context = LocalContext.current
    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 12.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Row(
            modifier = Modifier.clickable { MTre.openWebsite(context) },
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            Image(
                painter = painterResource(id = R.drawable.ic_mtre_logo),
                contentDescription = MTre.NAME,
                modifier = Modifier.size(16.dp),
            )
            Text(
                text = MTre.NAME,
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium,
                color = TextSecondary,
            )
        }
        Text(
            text = "© ${MTre.currentYear}",
            fontSize = 11.sp,
            fontWeight = FontWeight.Medium,
            color = TextSecondary,
            modifier = Modifier.clickable { onInfoClick() },
        )
    }
}
