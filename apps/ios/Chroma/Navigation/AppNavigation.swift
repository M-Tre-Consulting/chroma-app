//
//  AppNavigation.swift
//  Chroma
//

import SwiftUI

struct AppNavigation: View {
    var body: some View {
        TabView {
            NavigationStack {
                PalettesView()
            }
            .tabItem { Label("Palettes", systemImage: "swatchpalette") }

            NavigationStack {
                TokensView()
            }
            .tabItem { Label("Tokens", systemImage: "curlybraces") }

            NavigationStack {
                ExportView()
            }
            .tabItem { Label("Export", systemImage: "square.and.arrow.up") }
        }
    }
}
