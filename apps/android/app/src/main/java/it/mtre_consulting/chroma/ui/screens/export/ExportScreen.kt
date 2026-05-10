package it.mtre_consulting.chroma.ui.screens.export

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Code
import androidx.compose.material.icons.rounded.ExpandMore
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedButton
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.graphics.Brush
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
import it.mtre_consulting.chroma.util.exportAndroidXml
import it.mtre_consulting.chroma.util.exportCSS
import it.mtre_consulting.chroma.util.exportJSON
import it.mtre_consulting.chroma.util.exportSCSS
import it.mtre_consulting.chroma.util.exportTailwind
import it.mtre_consulting.chroma.viewmodel.AppViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

private enum class ExportFormat(val label: String, val ext: String, val description: String) {
    CSS("CSS custom properties", "css", "Paste into any stylesheet"),
    SCSS("SCSS variables", "scss", "Import into SCSS projects"),
    JSON("Style Dictionary", "json", "Amazon Style Dictionary format"),
    TAILWIND("Tailwind config", "ts", "Paste into tailwind.config.ts"),
    ANDROID("Android XML", "xml", "Drop into res/values/colors.xml"),
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ExportScreen(vm: AppViewModel) {
    val groups by vm.tokenGroups.collectAsState()
    val palettes by vm.palettes.collectAsState()
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    var format by remember { mutableStateOf(ExportFormat.CSS) }
    var showDropdown by remember { mutableStateOf(false) }
    var copied by remember { mutableStateOf(false) }
    val sheetState = rememberModalBottomSheetState()

    val isEmpty = groups.isEmpty() || groups.all { it.tokens.isEmpty() }
    val output = when (format) {
        ExportFormat.CSS -> exportCSS(groups, palettes)
        ExportFormat.SCSS -> exportSCSS(groups, palettes)
        ExportFormat.JSON -> exportJSON(groups, palettes)
        ExportFormat.TAILWIND -> exportTailwind(groups, palettes)
        ExportFormat.ANDROID -> exportAndroidXml(groups, palettes)
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Background),
    ) {
        // Header — status bar inset only here
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .statusBarsPadding()
                .padding(start = 16.dp, end = 16.dp, top = 8.dp, bottom = 4.dp),
        ) {
            Text("Export", fontSize = 28.sp, fontWeight = FontWeight.Medium, color = OnSurface, letterSpacing = (-0.5).sp)
            Text(
                "${groups.size} group${if (groups.size != 1) "s" else ""}",
                fontSize = 13.sp,
                color = TextSecondary,
                modifier = Modifier.padding(top = 1.dp),
            )
        }

        // Format selector
        Column(modifier = Modifier.padding(horizontal = 16.dp).padding(top = 8.dp, bottom = 12.dp)) {
            Text(
                "FORMAT",
                fontSize = 11.sp,
                fontWeight = FontWeight.SemiBold,
                color = TextSecondary,
                letterSpacing = 0.08.sp,
                modifier = Modifier.padding(bottom = 8.dp),
            )
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(14.dp))
                    .background(Surface)
                    .border(0.5.dp, Outline, RoundedCornerShape(14.dp))
                    .clickable { showDropdown = true }
                    .padding(14.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .background(Primary.copy(alpha = 0.15f)),
                        contentAlignment = Alignment.Center,
                    ) {
                        Icon(Icons.Rounded.Code, contentDescription = null, tint = Primary, modifier = Modifier.size(18.dp))
                    }
                    Column {
                        Text(format.label, fontSize = 14.sp, fontWeight = FontWeight.Medium, color = OnSurface)
                        Text(".${format.ext}", fontSize = 11.sp, color = TextSecondary, fontFamily = FontFamily.Monospace)
                    }
                }
                Icon(Icons.Rounded.ExpandMore, contentDescription = "Select format", tint = TextDisabled)
            }
        }

        // Output preview + floating action bar in a shared Box
        Box(modifier = Modifier.weight(1f).fillMaxWidth()) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 12.dp),
        ) {
            if (isEmpty) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text(
                        "Add tokens in the Tokens tab to generate exports",
                        fontSize = 14.sp,
                        color = TextDisabled,
                    )
                }
            } else {
                Text(
                    text = output,
                    fontFamily = FontFamily.Monospace,
                    fontSize = 12.sp,
                    color = Color(0xFFC0BFBA),
                    lineHeight = 20.sp,
                    modifier = Modifier
                        .fillMaxSize()
                        .clip(RoundedCornerShape(12.dp))
                        .background(Surface)
                        .verticalScroll(rememberScrollState())
                        .padding(14.dp),
                )
            }
        }

        // Floating action bar — export preview scrolls behind gradient scrim
        if (!isEmpty) {
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
                        .padding(horizontal = 12.dp, vertical = 10.dp),
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                ) {
                    Button(
                        onClick = {
                            val cm = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                            cm.setPrimaryClip(ClipData.newPlainText("chroma-export", output))
                            scope.launch { copied = true; delay(2000); copied = false }
                        },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(999.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Primary),
                    ) {
                        Text(if (copied) "Copied!" else "Copy", fontWeight = FontWeight.SemiBold)
                    }
                    OutlinedButton(
                        onClick = {
                            context.startActivity(
                                Intent.createChooser(
                                    Intent(Intent.ACTION_SEND).apply {
                                        type = "text/plain"
                                        putExtra(Intent.EXTRA_TEXT, output)
                                        putExtra(Intent.EXTRA_TITLE, "chroma-tokens.${format.ext}")
                                    },
                                    "Share as .${format.ext}",
                                )
                            )
                        },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(999.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Primary),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = Primary),
                    ) {
                        Text("Share .${format.ext}", fontWeight = FontWeight.SemiBold)
                    }
                }
            }
        }
        } // end Box
    }

    if (showDropdown) {
        ModalBottomSheet(
            onDismissRequest = { showDropdown = false },
            sheetState = sheetState,
            containerColor = Surface,
        ) {
            Column(modifier = Modifier.padding(horizontal = 20.dp).padding(bottom = 32.dp)) {
                Text(
                    "SELECT FORMAT",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = TextSecondary,
                    letterSpacing = 0.08.sp,
                    modifier = Modifier.padding(bottom = 8.dp),
                )
                ExportFormat.entries.forEachIndexed { index, f ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { format = f; showDropdown = false }
                            .padding(vertical = 14.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween,
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                f.label,
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Medium,
                                color = if (format == f) Primary else OnSurface,
                            )
                            Text(f.description, fontSize = 11.sp, color = TextDisabled)
                        }
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                        ) {
                            Text(".${f.ext}", fontSize = 11.sp, color = TextDisabled, fontFamily = FontFamily.Monospace)
                            if (format == f) Text("✓", fontSize = 16.sp, color = Primary, fontWeight = FontWeight.Bold)
                        }
                    }
                    if (index < ExportFormat.entries.size - 1) HorizontalDivider(color = Outline, thickness = 0.5.dp)
                }
            }
        }
    }
}
