package it.mtre_consulting.chroma.data.store

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import it.mtre_consulting.chroma.data.model.Palette
import it.mtre_consulting.chroma.data.model.TokenGroup
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.map
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "chroma_prefs")

class AppDataStore(context: Context) {

    private val store = context.dataStore

    private val palettesKey = stringPreferencesKey("chroma-palettes")
    private val tokensKey = stringPreferencesKey("chroma-tokens")

    val palettesFlow: Flow<List<Palette>> = store.data
        .catch { emit(androidx.datastore.preferences.core.emptyPreferences()) }
        .map { prefs ->
            val raw = prefs[palettesKey] ?: return@map emptyList()
            runCatching { Json.decodeFromString<List<Palette>>(raw) }.getOrDefault(emptyList())
        }

    val tokenGroupsFlow: Flow<List<TokenGroup>> = store.data
        .catch { emit(androidx.datastore.preferences.core.emptyPreferences()) }
        .map { prefs ->
            val raw = prefs[tokensKey] ?: return@map emptyList()
            runCatching { Json.decodeFromString<List<TokenGroup>>(raw) }.getOrDefault(emptyList())
        }

    suspend fun savePalettes(palettes: List<Palette>) {
        store.edit { it[palettesKey] = Json.encodeToString(palettes) }
    }

    suspend fun saveTokenGroups(groups: List<TokenGroup>) {
        store.edit { it[tokensKey] = Json.encodeToString(groups) }
    }
}
