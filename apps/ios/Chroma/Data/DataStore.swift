//
//  AppStore.swift
//  Chroma
//
//  Created by Simone Rolando (M-Tre Consulting) on 02/05/2026.
//

import Foundation

/// Persists and vends the app's palettes and tokens using `UserDefaults`.
///
/// Inject a single shared instance via `.environment()` at the root and read it
/// with `@Environment(DataStore.self)` in any view that needs it.
/// Call ``load()`` once at startup, then call the appropriate save method
/// after every mutation.
final class DataStore {
    var palettes: [Palette] = []
    var tokenGroups: [TokenGroup] = []

    private let defaults = UserDefaults.standard
    private let encoder = JSONEncoder()
    private let decoder = JSONDecoder()

    private let palettesKey = "chroma-palettes"
    private let tokenGroupsKey = "chroma-token-groups"

    /// Loads palettes and token groups from `UserDefaults` into memory.
    /// Falls back to empty arrays if no data is found or decoding fails.
    func load() {
        if let data = defaults.data(forKey: palettesKey) {
            palettes = (try? decoder.decode([Palette].self, from: data)) ?? []
        }

        if let data = defaults.data(forKey: tokenGroupsKey) {
            tokenGroups = (try? decoder.decode([TokenGroup].self, from: data)) ?? []
        }
    }

    /// Encodes ``palettes`` to JSON and writes it to `UserDefaults`.
    func savePalettes() {
        if let data = try? encoder.encode(palettes) {
            defaults.set(data, forKey: palettesKey)
        }
    }

    /// Encodes ``tokenGroups`` to JSON and writes it to `UserDefaults`.
    func saveTokenGroups() {
        if let data = try? encoder.encode(tokenGroups) {
            defaults.set(data, forKey: tokenGroupsKey)
        }
    }
}
