package it.mtre_consulting.chroma.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import it.mtre_consulting.chroma.data.model.Colour
import it.mtre_consulting.chroma.data.model.Palette
import it.mtre_consulting.chroma.data.model.Token
import it.mtre_consulting.chroma.data.model.TokenGroup
import it.mtre_consulting.chroma.data.model.TokenValue
import it.mtre_consulting.chroma.data.store.AppDataStore
import it.mtre_consulting.chroma.util.generateId
import it.mtre_consulting.chroma.util.hexToColour
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class AppViewModel(private val dataStore: AppDataStore) : ViewModel() {

    private val _palettes = MutableStateFlow<List<Palette>>(emptyList())
    val palettes: StateFlow<List<Palette>> = _palettes.asStateFlow()

    private val _tokenGroups = MutableStateFlow<List<TokenGroup>>(emptyList())
    val tokenGroups: StateFlow<List<TokenGroup>> = _tokenGroups.asStateFlow()

    init {
        viewModelScope.launch {
            dataStore.palettesFlow.collect { _palettes.value = it }
        }
        viewModelScope.launch {
            dataStore.tokenGroupsFlow.collect { _tokenGroups.value = it }
        }
    }

    // ── Palettes ────────────────────────────────────────────────────────────

    fun addPalette(name: String) = mutatePalettes { palettes ->
        palettes + Palette(id = generateId(), name = name)
    }

    fun removePalette(id: String) = mutatePalettes { it.filter { p -> p.id != id } }

    fun addColour(paletteId: String, hex: String, name: String = "") = mutatePalettes { palettes ->
        palettes.map { p ->
            if (p.id != paletteId) p
            else {
                val colour = hexToColour(hex, name.ifBlank { "Untitled" }, id = generateId())
                p.copy(colours = p.colours + colour, updatedAt = System.currentTimeMillis())
            }
        }
    }

    fun removeColour(paletteId: String, colourId: String) = mutatePalettes { palettes ->
        palettes.map { p ->
            if (p.id != paletteId) p
            else p.copy(
                colours = p.colours.filter { it.id != colourId },
                updatedAt = System.currentTimeMillis(),
            )
        }
    }

    fun updateColour(paletteId: String, colourId: String, patch: Colour) =
        mutatePalettes { palettes ->
            palettes.map { p ->
                if (p.id != paletteId) p
                else p.copy(
                    colours = p.colours.map { if (it.id == colourId) patch else it },
                    updatedAt = System.currentTimeMillis(),
                )
            }
        }

    // ── Token Groups ────────────────────────────────────────────────────────

    fun addGroup(name: String) = mutateGroups { groups ->
        groups + TokenGroup(id = generateId(), name = name)
    }

    fun removeGroup(groupId: String) = mutateGroups { it.filter { g -> g.id != groupId } }

    fun renameGroup(groupId: String, name: String) = mutateGroups { groups ->
        groups.map { if (it.id == groupId) it.copy(name = name) else it }
    }

    fun addToken(groupId: String, name: String) = mutateGroups { groups ->
        groups.map { g ->
            if (g.id != groupId) g
            else g.copy(tokens = g.tokens + Token(id = generateId(), name = name))
        }
    }

    fun removeToken(groupId: String, tokenId: String) = mutateGroups { groups ->
        groups.map { g ->
            if (g.id != groupId) g
            else g.copy(tokens = g.tokens.filter { it.id != tokenId })
        }
    }

    fun assignColour(groupId: String, tokenId: String, paletteId: String, colourId: String) =
        mutateGroups { groups ->
            groups.map { g ->
                if (g.id != groupId) g
                else g.copy(
                    tokens = g.tokens.map { t ->
                        if (t.id != tokenId) t
                        else t.copy(value = TokenValue(colourId = colourId, paletteId = paletteId))
                    }
                )
            }
        }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private fun mutatePalettes(transform: (List<Palette>) -> List<Palette>) {
        val updated = transform(_palettes.value)
        _palettes.value = updated
        viewModelScope.launch { dataStore.savePalettes(updated) }
    }

    private fun mutateGroups(transform: (List<TokenGroup>) -> List<TokenGroup>) {
        val updated = transform(_tokenGroups.value)
        _tokenGroups.value = updated
        viewModelScope.launch { dataStore.saveTokenGroups(updated) }
    }
}

class AppViewModelFactory(private val dataStore: AppDataStore) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        @Suppress("UNCHECKED_CAST")
        return AppViewModel(dataStore) as T
    }
}
