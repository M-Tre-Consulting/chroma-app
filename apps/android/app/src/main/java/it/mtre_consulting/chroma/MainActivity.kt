package it.mtre_consulting.chroma

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.lifecycle.viewmodel.compose.viewModel
import it.mtre_consulting.chroma.ui.navigation.AppNavigation
import it.mtre_consulting.chroma.ui.theme.ChromaTheme
import it.mtre_consulting.chroma.viewmodel.AppViewModel
import it.mtre_consulting.chroma.viewmodel.AppViewModelFactory

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        val dataStore = (application as ChromaApplication).dataStore
        setContent {
            ChromaTheme {
                val vm: AppViewModel = viewModel(factory = AppViewModelFactory(dataStore))
                AppNavigation(vm)
            }
        }
    }
}
