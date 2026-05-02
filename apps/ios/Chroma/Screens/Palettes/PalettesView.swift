//
//  PalettesView.swift
//  Chroma
//

import SwiftUI

struct PalettesView: View {
    @Environment(AppViewModel.self) private var vm
    @State private var showAddAlert = false
    @State private var newName = ""
    @State private var showAbout = false

    var body: some View {
        List {
            ForEach(vm.palettes) { palette in
                NavigationLink(value: palette.id) {
                    PaletteRow(palette: palette)
                }
                .swipeActions(edge: .trailing) {
                    Button(role: .destructive) {
                        vm.removePalette(id: palette.id)
                    } label: {
                        Label("Delete", systemImage: "trash")
                    }
                }
            }
        }
        .navigationTitle("Chroma")
        .navigationDestination(for: String.self) { id in
            PaletteDetailView(paletteId: id)
        }
        .overlay {
            if vm.palettes.isEmpty {
                ContentUnavailableView(
                    "No Palettes",
                    systemImage: "swatchpalette",
                    description: Text("Tap + to create your first palette")
                )
            }
        }
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button("New Palette", systemImage: "plus") {
                    showAddAlert = true
                }
            }
            ToolbarItem(placement: .topBarLeading) {
                Button("About", systemImage: "info.circle") {
                    showAbout = true
                }
            }
        }
        .alert("New Palette", isPresented: $showAddAlert) {
            TextField("Palette name", text: $newName)
                .autocorrectionDisabled()
            Button("Add") {
                let trimmed = newName.trimmingCharacters(in: .whitespaces)
                guard !trimmed.isEmpty else { return }
                vm.addPalette(name: trimmed)
                newName = ""
            }
            Button("Cancel", role: .cancel) { newName = "" }
        }
        .sheet(isPresented: $showAbout) {
            AboutView()
                .presentationDetents([.medium])
        }
    }
}

// MARK: - Subviews

private struct PaletteRow: View {
    let palette: Palette

    var body: some View {
        HStack(spacing: 12) {
            HStack(spacing: 4) {
                let display = palette.colours.prefix(5)
                if display.isEmpty {
                    RoundedRectangle(cornerRadius: 6)
                        .fill(Color(.systemGray5))
                        .frame(width: 24, height: 24)
                } else {
                    ForEach(Array(display), id: \.id) { colour in
                        RoundedRectangle(cornerRadius: 6)
                            .fill(Color(hex: colour.hex) ?? .gray)
                            .frame(width: 24, height: 24)
                    }
                }
            }
            VStack(alignment: .leading, spacing: 2) {
                Text(palette.name)
                    .fontWeight(.medium)
                Text("\(palette.colours.count) colour\(palette.colours.count == 1 ? "" : "s")")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .padding(.vertical, 4)
    }
}

private struct AboutView: View {
    var body: some View {
        NavigationStack {
            List {
                Section {
                    Text("A local-first color palette and design token manager. Create color systems, map them to design tokens, and export to CSS, SCSS, JSON, Tailwind, or Android XML.")
                        .font(.callout)
                        .foregroundStyle(.secondary)
                }
                Section("Details") {
                    LabeledContent("Storage", value: "Local only — no cloud, no account")
                    LabeledContent("Data format", value: "JSON via UserDefaults")
                    LabeledContent("Exports", value: "CSS · SCSS · JSON · Tailwind · Android XML")
                    LabeledContent("WCAG", value: "Contrast ratio AA / AAA checking")
                }
                Section {
                    Text("Built with Swift · SwiftUI")
                        .font(.caption)
                        .foregroundStyle(.tertiary)
                        .listRowBackground(Color.clear)
                }
            }
            .navigationTitle("Chroma")
            .navigationBarTitleDisplayMode(.large)
        }
    }
}
