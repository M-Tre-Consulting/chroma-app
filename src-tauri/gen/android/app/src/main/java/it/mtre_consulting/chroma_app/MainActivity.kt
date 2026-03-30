package it.mtre_consulting.chroma_app

import android.os.Build
import android.os.Bundle
import android.webkit.WebView
import androidx.activity.enableEdgeToEdge

class MainActivity : TauriActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)
  }

  override fun onWebViewCreate(webView: WebView) {
    super.onWebViewCreate(webView)

    // Material You dynamic colors are only available on Android 12 (API 31) and up
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        // Fetch the system accent color
        val systemAccent = resources.getColor(android.R.color.system_accent1_500, theme)
        
        // Convert to a hex string that CSS can read
        val hexAccent = String.format("#%06X", 0xFFFFFF and systemAccent)

        // Inject a style block into the document head
        val js = """
            const style = document.createElement('style');
            style.innerHTML = `
                :root {
                    --accent: $hexAccent !important;
                }
            `;
            document.head.appendChild(style);
        """.trimIndent()

        // Evaluate the JS in the webview
        webView.evaluateJavascript(js, null)
    }
  }
}