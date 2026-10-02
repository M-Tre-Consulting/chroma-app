package it.mtre_consulting.chroma.util

import android.content.Context
import android.content.Intent
import android.net.Uri
import it.mtre_consulting.chroma.BuildConfig
import java.util.Calendar

/**
 * M-Tre Consulting signature, privacy policy and licensing constants.
 * Follows guidelines in brand/README.md.
 */
object MTre {
    const val NAME = "M-Tre Consulting"
    const val SITE_URL = "https://mtre-consulting.it"
    const val EMAIL = "info@mtre-consulting.it"
    const val REPO_URL = "https://github.com/M-Tre-Consulting/chroma-app"

    val OWNERS = listOf(
        "Simone Rolando – P.IVA 01866720095",
        "Nicolò Perri – P.IVA 01949510091",
        "Emad Alaa Soliman Mohamed Soliman – P.IVA 01949520090"
    )

    val currentYear: Int
        get() = Calendar.getInstance().get(Calendar.YEAR)

    val copyright: String
        get() = "© $currentYear $NAME"

    val appVersion: String
        get() = "${BuildConfig.VERSION_NAME} (${BuildConfig.VERSION_CODE})"

    fun openWebsite(context: Context) {
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(SITE_URL))
        context.startActivity(intent)
    }

    fun sendEmail(context: Context) {
        val intent = Intent(Intent.ACTION_SENDTO, Uri.parse("mailto:$EMAIL"))
        context.startActivity(intent)
    }

    fun openRepo(context: Context) {
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(REPO_URL))
        context.startActivity(intent)
    }
}
