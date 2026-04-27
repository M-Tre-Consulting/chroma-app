package it.mtre_consulting.chroma.data.model

import kotlinx.serialization.Serializable

@Serializable
data class ColourRgb(val r: Int, val g: Int, val b: Int)

@Serializable
data class ColourHsl(val h: Int, val s: Int, val l: Int)

@Serializable
data class Colour(
    val id: String,
    val name: String,
    val hex: String,
    val rgb: ColourRgb,
    val hsl: ColourHsl,
)

@Serializable
data class Palette(
    val id: String,
    val name: String,
    val colours: List<Colour> = emptyList(),
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis(),
)

@Serializable
data class TokenValue(
    val colourId: String = "",
    val paletteId: String = "",
)

@Serializable
data class Token(
    val id: String,
    val name: String,
    val description: String = "",
    val value: TokenValue = TokenValue(),
)

@Serializable
data class TokenGroup(
    val id: String,
    val name: String,
    val tokens: List<Token> = emptyList(),
)
