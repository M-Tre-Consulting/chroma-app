package it.mtre_consulting.chroma_app

import android.content.Context
import android.os.Build
import android.os.Bundle
import android.view.View
import android.webkit.JavascriptInterface
import android.webkit.WebView
import androidx.activity.enableEdgeToEdge

// This class provides the Material You colors to JavaScript
class SystemThemeInterface(private val context: Context) {
  @JavascriptInterface
  fun getSystemAccentColor(): String {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      val color = context.resources.getColor(android.R.color.system_accent1_500, context.theme)
      return String.format("#%06X", 0xFFFFFF and color)
    }
    return ""
  }

  @JavascriptInterface
  fun getSystemAccentSoftColor(): String {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      val color = context.resources.getColor(android.R.color.system_accent1_100, context.theme)
      return String.format("#%06X", 0xFFFFFF and color)
    }
    return ""
  }

  @JavascriptInterface
  fun getSystemAccentStrongColor(): String {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
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

    // Hide WebView to prevent the "unaligned UI" flash
    webView.visibility = View.INVISIBLE

    // Bridge for showing the app
    webView.addJavascriptInterface(object {
      @JavascriptInterface
      fun showApp() {
        runOnUiThread { webView.visibility = View.VISIBLE }
      }
    }, "NativeApp")

    // Bridge for System Colors
    webView.addJavascriptInterface(SystemThemeInterface(this), "AndroidTheme")
  }
}