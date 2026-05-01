//
//  Models.swift
//  Chroma
//
//  Created by Simone Rolando (M-Tre Consulting) on 02/05/2026.
//

/// Red, green, and blue components of a colour, each in the range 0–255.
struct ColourRgb: Codable {
    let r: Int
    let g: Int
    let b: Int
}

/// Hue, saturation, and lightness components of a colour.
struct ColourHsl: Codable {
    let h: Int
    let s: Int
    let l: Int
}

/// A single colour entry inside a palette, carrying its value in multiple formats.
struct Colour: Codable {
    let id: String
    let name: String
    let hex: String
    let rgb: ColourRgb
    let hsl: ColourHsl
}

/// A named collection of colours created by the user.
struct Palette: Codable {
    let id: String
    let name: String
    var colours: [Colour]
    var createdAt: Int64
    var updatedAt: Int64
}

/// A reference that binds a design token to a specific colour inside a palette.
struct TokenValue: Codable {
    let colourId: String
    let paletteId: String
}

/// A named design token that maps a semantic role to a palette colour.
struct Token: Codable {
    let id: String
    let name: String
    var description: String = ""
    var value: TokenValue
}
