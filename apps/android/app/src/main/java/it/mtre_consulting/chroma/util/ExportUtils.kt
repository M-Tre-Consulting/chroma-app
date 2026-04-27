package it.mtre_consulting.chroma.util

import it.mtre_consulting.chroma.data.model.Palette
import it.mtre_consulting.chroma.data.model.TokenGroup

private data class ResolvedToken(val name: String, val hex: String, val group: String)

private fun resolveTokens(groups: List<TokenGroup>, palettes: List<Palette>): List<ResolvedToken> =
    groups.flatMap { g ->
        g.tokens
            .filter { it.value.colourId.isNotEmpty() && it.value.paletteId.isNotEmpty() }
            .map { t ->
                val palette = palettes.find { it.id == t.value.paletteId }
                val colour = palette?.colours?.find { it.id == t.value.colourId }
                ResolvedToken(name = t.name, hex = colour?.hex ?: "#000000", group = g.name)
            }
    }

fun exportCSS(groups: List<TokenGroup>, palettes: List<Palette>): String {
    val entries = resolveTokens(groups, palettes).joinToString("\n") { "  --${it.name}: ${it.hex};" }
    return ":root {\n$entries\n}"
}

fun exportSCSS(groups: List<TokenGroup>, palettes: List<Palette>): String {
    val tokens = resolveTokens(groups, palettes)
    val grouped = tokens.groupBy { it.group }
    return grouped.entries.joinToString("\n\n") { (group, ts) ->
        val vars = ts.joinToString("\n") { "\$${it.name}: ${it.hex};" }
        "// $group\n$vars"
    }
}

fun exportJSON(groups: List<TokenGroup>, palettes: List<Palette>): String {
    val tokens = resolveTokens(groups, palettes)
    val grouped = tokens.groupBy { it.group }
    val sb = StringBuilder("{\n  \"color\": {\n")
    grouped.entries.forEachIndexed { gi, (group, ts) ->
        sb.append("    \"$group\": {\n")
        ts.forEachIndexed { ti, t ->
            val comma = if (ti < ts.size - 1) "," else ""
            sb.append("      \"${t.name}\": { \"value\": \"${t.hex}\" }$comma\n")
        }
        val comma = if (gi < grouped.size - 1) "," else ""
        sb.append("    }$comma\n")
    }
    sb.append("  }\n}")
    return sb.toString()
}

fun exportTailwind(groups: List<TokenGroup>, palettes: List<Palette>): String {
    val entries = resolveTokens(groups, palettes).joinToString("\n") { "  '${it.name}': '${it.hex}'," }
    return "// tailwind.config.ts — paste into the colors key\nconst colors = {\n$entries\n}"
}

fun exportAndroidXml(groups: List<TokenGroup>, palettes: List<Palette>): String {
    val entries = resolveTokens(groups, palettes).joinToString("\n") { t ->
        val xmlName = t.name.replace('-', '_')
        "  <color name=\"$xmlName\">${t.hex}</color>"
    }
    return "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<resources>\n$entries\n</resources>"
}
