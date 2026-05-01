//
//  ExportUtils.swift
//  Chroma
//
//  Created by Simone Rolando (M-Tre Consulting) on 02/05/2026.
//

// MARK: - Internal

/// A token resolved to its final hex value, ready for export.
private struct ResolvedToken {
    var name: String
    var hex: String
    var group: String
}

/// Looks up each token's colour from the palette list, grouped by their ``TokenGroup``.
/// Tokens with a missing `colourId` or `paletteId` are filtered out.
/// Falls back to `#000000` if the referenced colour cannot be found.
private func resolveTokens(groups: [TokenGroup], palettes: [Palette]) -> [ResolvedToken] {
    groups.flatMap { g in
        g.tokens
            .filter { !$0.value.colourId.isEmpty && !$0.value.paletteId.isEmpty }
            .map { t in
                let palette = palettes.first { $0.id == t.value.paletteId }
                let colour = palette?.colours.first { $0.id == t.value.colourId }
                return ResolvedToken(name: t.name, hex: colour?.hex ?? "#000000", group: g.name)
            }
    }
}

// MARK: - Exports

/// Exports tokens as a CSS `:root` block of custom properties.
func exportCSS(groups: [TokenGroup], palettes: [Palette]) -> String {
    let entries = resolveTokens(groups: groups, palettes: palettes)
        .map { "  --\($0.name): \($0.hex);" }
        .joined(separator: "\n")
    return ":root {\n\(entries)\n}"
}

/// Exports tokens as SCSS variable declarations, with each group preceded by a comment header.
func exportSCSS(groups: [TokenGroup], palettes: [Palette]) -> String {
    let grouped = Dictionary(grouping: resolveTokens(groups: groups, palettes: palettes), by: \.group)
    return grouped
        .sorted { $0.key < $1.key }
        .map { group, tokens in
            let vars = tokens.map { "$\($0.name): \($0.hex);" }.joined(separator: "\n")
            return "// \(group)\n\(vars)"
        }
        .joined(separator: "\n\n")
}

/// Exports tokens as a W3C Design Token JSON structure, nested under `"color"` by group.
func exportJSON(groups: [TokenGroup], palettes: [Palette]) -> String {
    let grouped = Dictionary(grouping: resolveTokens(groups: groups, palettes: palettes), by: \.group)
    let sortedGroups = grouped.sorted { $0.key < $1.key }
    var output = "{\n  \"color\": {\n"
    for (gi, (group, tokens)) in sortedGroups.enumerated() {
        output += "    \"\(group)\": {\n"
        for (ti, token) in tokens.enumerated() {
            let comma = ti < tokens.count - 1 ? "," : ""
            output += "      \"\(token.name)\": { \"value\": \"\(token.hex)\" }\(comma)\n"
        }
        let comma = gi < sortedGroups.count - 1 ? "," : ""
        output += "    }\(comma)\n"
    }
    output += "  }\n}"
    return output
}

/// Exports tokens as a Tailwind CSS colour object literal.
func exportTailwind(groups: [TokenGroup], palettes: [Palette]) -> String {
    let entries = resolveTokens(groups: groups, palettes: palettes)
        .map { "  '\($0.name)': '\($0.hex)'," }
        .joined(separator: "\n")
    return "// tailwind.config.ts — paste into the colors key\nconst colors = {\n\(entries)\n}"
}

/// Exports tokens as an Android `res/values/colors.xml` resource file.
/// Hyphens in token names are replaced with underscores to satisfy XML name rules.
func exportAndroidXml(groups: [TokenGroup], palettes: [Palette]) -> String {
    let entries = resolveTokens(groups: groups, palettes: palettes)
        .map { "  <color name=\"\($0.name.replacingOccurrences(of: "-", with: "_"))\">\($0.hex)</color>" }
        .joined(separator: "\n")
    return "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<resources>\n\(entries)\n</resources>"
}
