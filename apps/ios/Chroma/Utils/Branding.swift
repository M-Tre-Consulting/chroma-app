import SwiftUI

/// Chi fa Chroma: nome, sito e contatti di M-Tre Consulting.
enum MTre {
    static let name = "M-Tre Consulting"
    static let site = URL(string: "https://mtre-consulting.it")!
    static let email = "info@mtre-consulting.it"
    static let owners = [
        "Simone Rolando – P.IVA 01866720095",
        "Nicolò Perri – P.IVA 01949510091",
        "Emad Alaa Soliman Mohamed Soliman – P.IVA 01949520090",
    ]
    static var year: Int { Calendar.current.component(.year, from: Date()) }
    static var copyright: String { "© \(year) \(name)" }

    static var appVersion: String {
        let info = Bundle.main.infoDictionary
        let version = info?["CFBundleShortVersionString"] as? String ?? "1.0"
        let build = info?["CFBundleVersion"] as? String ?? "1"
        return "\(version) (\(build))"
    }
}

/// Firma in basso: logo e nome a sinistra (portano al sito), copyright e anno a destra
/// (aprono le informazioni legali).
struct BrandFooter: View {
    var onInfo: () -> Void

    var body: some View {
        HStack(spacing: 6) {
            Link(destination: MTre.site) {
                HStack(spacing: 6) {
                    Image("MTreLogo")
                        .resizable()
                        .interpolation(.high)
                        .frame(width: 16, height: 16)
                    Text(verbatim: MTre.name)
                }
            }
            .help(Text(verbatim: MTre.site.absoluteString))
            Spacer(minLength: 8)
            Button(action: onInfo) {
                Text(verbatim: "© \(MTre.year)")
            }
            .help(Text("Privacy, licenza e contatti"))
        }
        .buttonStyle(.plain)
        .font(.system(size: 11, weight: .medium))
        .foregroundStyle(.secondary)
    }
}

/// Informazioni legali: chi siamo, informativa sulla privacy dell'app, licenza, contatti.
struct LegalView: View {
    var appName: String = "Chroma"
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    HStack(spacing: 12) {
                        Image("MTreLogo")
                            .resizable()
                            .interpolation(.high)
                            .frame(width: 44, height: 44)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(verbatim: appName)
                                .font(.title2.bold())
                            Text("Versione \(MTre.appVersion)")
                                .font(.callout)
                                .foregroundStyle(.secondary)
                            Text("\(MTre.copyright). Tutti i diritti riservati.")
                                .font(.callout)
                                .foregroundStyle(.secondary)
                        }
                    }

                    section("Informativa sulla privacy") {
                        paragraph("Chroma non raccoglie dati personali. Palette, colori e token restano sul tuo dispositivo: niente server, account utente, pubblicità, statistiche o tracciamento.")
                        paragraph("L'applicazione funziona interamente in locale e offline, senza effettuare alcuna chiamata di rete.")
                        paragraph("Puoi chiederci informazioni ed esercitare i tuoi diritti previsti dal GDPR (Regolamento UE 2016/679) scrivendo a \(MTre.email). Poiché non conserviamo i tuoi dati, eliminare l'app cancella tutto.")
                    }

                    section("Titolare") {
                        Text(verbatim: "\(MTre.name), Savona, Italia")
                        ForEach(MTre.owners, id: \.self) { Text(verbatim: $0).foregroundStyle(.secondary) }
                    }

                    section("Licenza") {
                        paragraph("Chroma è un software libero rilasciato sotto licenza GNU General Public License v2.0 (GPL-2.0). Il codice sorgente è disponibile su GitHub: https://github.com/M-Tre-Consulting/chroma-app")
                        paragraph("I controlli di contrasto WCAG seguono le specifiche W3C Web Content Accessibility Guidelines 2.0 / 2.1.")
                    }

                    section("Contatti") {
                        Link(destination: MTre.site) { Text(verbatim: MTre.site.absoluteString) }
                        Link(destination: URL(string: "mailto:\(MTre.email)")!) { Text(verbatim: MTre.email) }
                    }

                    Text("Aggiornata il 2 ottobre 2026.")
                        .font(.footnote)
                        .foregroundStyle(.tertiary)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(24)
            }
            .navigationTitle("Informazioni")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Chiudi") {
                        dismiss()
                    }
                }
            }
        }
    }

    private func section<Content: View>(_ title: LocalizedStringKey, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title).font(.headline)
            content()
        }
    }

    private func paragraph(_ text: LocalizedStringKey) -> some View {
        Text(text)
            .fixedSize(horizontal: false, vertical: true)
    }
}
