package it.mtre_consulting.chroma.util

import it.mtre_consulting.chroma.data.model.Colour
import it.mtre_consulting.chroma.data.model.ColourHsl
import it.mtre_consulting.chroma.data.model.ColourRgb
import kotlin.math.max
import kotlin.math.min
import kotlin.math.pow
import kotlin.math.round

fun hexToRgb(hex: String): ColourRgb {
    val clean = hex.trimStart('#')
    return ColourRgb(
        r = clean.substring(0, 2).toInt(16),
        g = clean.substring(2, 4).toInt(16),
        b = clean.substring(4, 6).toInt(16),
    )
}

fun rgbToHsl(r: Int, g: Int, b: Int): ColourHsl {
    val rn = r / 255.0
    val gn = g / 255.0
    val bn = b / 255.0
    val mx = max(rn, max(gn, bn))
    val mn = min(rn, min(gn, bn))
    val l = (mx + mn) / 2.0
    var h = 0.0
    var s = 0.0
    if (mx != mn) {
        val d = mx - mn
        s = if (l > 0.5) d / (2.0 - mx - mn) else d / (mx + mn)
        h = when (mx) {
            rn -> ((gn - bn) / d + (if (gn < bn) 6.0 else 0.0)) / 6.0
            gn -> ((bn - rn) / d + 2.0) / 6.0
            else -> ((rn - gn) / d + 4.0) / 6.0
        }
    }
    return ColourHsl(
        h = round(h * 360).toInt(),
        s = round(s * 100).toInt(),
        l = round(l * 100).toInt(),
    )
}

fun hslToHex(h: Int, s: Int, l: Int): String {
    val sn = s / 100.0
    val ln = l / 100.0
    val a = sn * min(ln, 1.0 - ln)
    fun f(n: Int): String {
        val k = (n + h / 30.0) % 12.0
        val color = ln - a * max(min(k - 3.0, min(9.0 - k, 1.0)), -1.0)
        return round(255.0 * color).toInt().coerceIn(0, 255)
            .toString(16).padStart(2, '0')
    }
    return "#${f(0)}${f(8)}${f(4)}"
}

fun hexToColour(hex: String, name: String = "Untitled", id: String): Colour {
    val rgb = hexToRgb(hex)
    val hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
    return Colour(id = id, name = name, hex = hex, rgb = rgb, hsl = hsl)
}

fun contrastRatio(hex1: String, hex2: String): Double {
    fun luminance(hex: String): Double {
        val (r, g, b) = hexToRgb(hex).let { Triple(it.r, it.g, it.b) }
        val (rs, gs, bs) = listOf(r, g, b).map { c ->
            val s = c / 255.0
            if (s <= 0.03928) s / 12.92 else ((s + 0.055) / 1.055).pow(2.4)
        }
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
    }
    val l1 = luminance(hex1)
    val l2 = luminance(hex2)
    val lighter = max(l1, l2)
    val darker = min(l1, l2)
    return round(((lighter + 0.05) / (darker + 0.05)) * 100) / 100.0
}

enum class WcagLevel { AAA, AA, AA_LARGE, FAIL }

fun wcagLevel(ratio: Double): WcagLevel = when {
    ratio >= 7.0 -> WcagLevel.AAA
    ratio >= 4.5 -> WcagLevel.AA
    ratio >= 3.0 -> WcagLevel.AA_LARGE
    else -> WcagLevel.FAIL
}

fun wcagLabel(level: WcagLevel): String = when (level) {
    WcagLevel.AAA -> "AAA"
    WcagLevel.AA -> "AA"
    WcagLevel.AA_LARGE -> "AA Large"
    WcagLevel.FAIL -> "Fail"
}

fun generateId(): String =
    (('a'..'z') + ('0'..'9')).let { chars ->
        (1..9).map { chars.random() }.joinToString("")
    } + System.currentTimeMillis().toString(36)
