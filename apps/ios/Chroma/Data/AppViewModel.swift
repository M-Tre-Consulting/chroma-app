//
//  AppViewModel.swift
//  Chroma
//
//  Created by Simone Rolando (M-Tre Consulting) on 02/05/2026.
//

import Foundation
import Observation

/// Central view model for the app. Owns all in-memory state and delegates
/// persistence to ``DataStore``.
///
/// Inject a single instance at the root via `.environment()` and read it
/// in any view with `@Environment(AppViewModel.self)`.
@Observable
final class AppViewModel {

    /// All palettes created by the user.
    private(set) var palettes: [Palette] = []

    /// All token groups created by the user.
    private(set) var tokenGroups: [TokenGroup] = []

    private let store: DataStore

    init(store: DataStore) {
        self.store = store
        store.load()
        palettes = store.palettes
        tokenGroups = store.tokenGroups
    }

    // MARK: - Palettes

    /// Creates a new palette with the given name and appends it to the list.
    func addPalette(name: String) {
        mutatePalettes {
            $0.append(Palette(id: generateId(), name: name, colours: [], createdAt: nowMs, updatedAt: nowMs))
        }
    }

    /// Removes the palette with the given ID, along with all its colours.
    func removePalette(id: String) {
        mutatePalettes { $0.removeAll { $0.id == id } }
    }

    /// Parses `hex` into a ``Colour`` and appends it to the specified palette.
    func addColour(paletteId: String, hex: String, name: String = "") {
        mutatePalettes { palettes in
            guard let i = palettes.firstIndex(where: { $0.id == paletteId }) else { return }
            let colour = hexToColour(hex: hex, name: name.isEmpty ? "Untitled" : name, id: generateId())
            palettes[i].colours.append(colour)
            palettes[i].updatedAt = nowMs
        }
    }

    /// Removes a colour from the specified palette.
    func removeColour(paletteId: String, colourId: String) {
        mutatePalettes { palettes in
            guard let i = palettes.firstIndex(where: { $0.id == paletteId }) else { return }
            palettes[i].colours.removeAll { $0.id == colourId }
            palettes[i].updatedAt = nowMs
        }
    }

    /// Replaces a colour in the specified palette with `patch`.
    func updateColour(paletteId: String, colourId: String, patch: Colour) {
        mutatePalettes { palettes in
            guard let pi = palettes.firstIndex(where: { $0.id == paletteId }),
                  let ci = palettes[pi].colours.firstIndex(where: { $0.id == colourId })
            else { return }
            palettes[pi].colours[ci] = patch
            palettes[pi].updatedAt = nowMs
        }
    }

    // MARK: - Token Groups

    /// Creates a new empty token group with the given name.
    func addGroup(name: String) {
        mutateGroups {
            $0.append(TokenGroup(id: generateId(), name: name, tokens: []))
        }
    }

    /// Removes the token group with the given ID and all its tokens.
    func removeGroup(groupId: String) {
        mutateGroups { $0.removeAll { $0.id == groupId } }
    }

    /// Renames an existing token group.
    func renameGroup(groupId: String, name: String) {
        mutateGroups { groups in
            guard let i = groups.firstIndex(where: { $0.id == groupId }) else { return }
            groups[i] = TokenGroup(id: groups[i].id, name: name, tokens: groups[i].tokens)
        }
    }

    /// Creates a new token with the given name inside the specified group.
    func addToken(groupId: String, name: String) {
        mutateGroups { groups in
            guard let i = groups.firstIndex(where: { $0.id == groupId }) else { return }
            groups[i].tokens.append(Token(id: generateId(), name: name, value: TokenValue(colourId: "", paletteId: "")))
        }
    }

    /// Removes a token from the specified group.
    func removeToken(groupId: String, tokenId: String) {
        mutateGroups { groups in
            guard let i = groups.firstIndex(where: { $0.id == groupId }) else { return }
            groups[i].tokens.removeAll { $0.id == tokenId }
        }
    }

    /// Binds a token to a specific colour within a palette.
    func assignColour(groupId: String, tokenId: String, paletteId: String, colourId: String) {
        mutateGroups { groups in
            guard let gi = groups.firstIndex(where: { $0.id == groupId }),
                  let ti = groups[gi].tokens.firstIndex(where: { $0.id == tokenId })
            else { return }
            groups[gi].tokens[ti].value = TokenValue(colourId: colourId, paletteId: paletteId)
        }
    }

    // MARK: - Helpers

    private var nowMs: Int64 { Int64(Date().timeIntervalSince1970 * 1000) }

    private func mutatePalettes(_ transform: (inout [Palette]) -> Void) {
        transform(&palettes)
        store.palettes = palettes
        store.savePalettes()
    }

    private func mutateGroups(_ transform: (inout [TokenGroup]) -> Void) {
        transform(&tokenGroups)
        store.tokenGroups = tokenGroups
        store.saveTokenGroups()
    }
}
