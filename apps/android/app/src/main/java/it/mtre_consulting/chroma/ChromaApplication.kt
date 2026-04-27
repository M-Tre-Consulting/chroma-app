package it.mtre_consulting.chroma

import android.app.Application
import it.mtre_consulting.chroma.data.store.AppDataStore

class ChromaApplication : Application() {
    val dataStore by lazy { AppDataStore(this) }
}
