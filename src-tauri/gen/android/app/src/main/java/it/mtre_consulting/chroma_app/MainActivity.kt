package it.mtre_consulting.chroma_app

import android.content.Context
import android.os.Build
import android.os.Bundle
import android.webkit.JavascriptInterface
import android.webkit.WebView
import androidx.activity.enableEdgeToEdge

// This class acts as a bridge between Android and React
class SystemThemeInterface(private val context: Context) {
    
    @JavascriptInterface
    fun getSystemAccentColor(): String {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            // system_accent1_500 is the standard M3 primary accent
            val color = context.resources.getColor(android.R.color.system_accent1_500, context.theme)
            return String.format("#%06X", 0xFFFFFF and color)
        }
        return "" // Fallback for Android 11 and below
    }

    @JavascriptInterface
    fun getSystemAccentSoftColor(): String {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            // A lighter variant (accent1_100) perfect for active tab backgrounds
            val color = context.resources.getColor(android.R.color.system_accent1_100, context.theme)
            return String.format("#%06X", 0xFFFFFF and color)
        }
        return ""
    }

    @JavascriptInterface
    fun getSystemAccentStrongColor(): String {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            // A darker variant (accent1_700) for text inside soft backgrounds
            val color = context.resources.getColor(android.R.color.system_accent1_700, context.theme)
            return String.format("#%06X", 0xFFFFFF and color)
        }
        return ""
    }
}

class MainActivity : TauriActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)
  }

  override fun onWebViewCreate(webView: WebView) {
    super.onWebViewCreate(webView)
    // Bind the Kotlin class to the JS window object under the name "AndroidTheme"
    webView.addJavascriptInterface(SystemThemeInterface(this), "AndroidTheme")
  }
}