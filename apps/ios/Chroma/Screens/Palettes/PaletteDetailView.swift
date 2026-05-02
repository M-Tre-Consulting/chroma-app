//
//  PaletteDetailView.swift
//  Chroma
//

import SwiftUI

struct PaletteDetailView: View {
    let paletteId: String
    @Environment(AppViewModel.self) private var vm
    @State private var expandedColourId: String?
    @State private var showAddSheet = false

    var palette: Palette? { vm.palettes.first { $0.id == paletteId } }

    var body: some View {
        Group {
            if let palette {
                List {
                    ForEach(palette.colours) { colour in
                        ColourCell(
                            colour: colour,
                            isExpanded: expandedColourId == colour.id,
                            onTap: {
                                withAnimation(.spring(duration: 0.3)) {
                                    expandedColourId = expandedColourId == colour.id ? nil : colour.id
                                }
                            }
                        )
                        .swipeActions(edge: .trailing) {
                            Button(role: .destructive) {
                                vm.removeColour(paletteId: paletteId, colourId: colour.id)
                            } label: {
                                Label("Delete", systemImage: "trash")
                            }
                        }
                    }
                }
                .overlay {
                    if palette.colours.isEmpty {
                        ContentUnavailableView(
                            "No Colours",
                            systemImage: "eyedropper",
                            description: Text("Tap + to add a colour")
                        )
                    }
                }
                .navigationTitle(palette.name)
                .navigationBarTitleDisplayMode(.large)
                .toolbar {
                    ToolbarItem(placement: .topBarTrailing) {
                        Button { showAddSheet = true } label: {
                            Image(systemName: "plus")
                        }
                    }
                }
                .sheet(isPresented: $showAddSheet) {
                    AddColourSheet(paletteId: paletteId, isPresented: $showAddSheet)
                        .presentationDetents([.medium])
                }
            }
        }
    }
}

// MARK: - Colour cell

private struct ColourCell: View {
    let colour: Colour
    let isExpanded: Bool
    let onTap: () -> Void

    private var hexValid: Bool {
        let clean = colour.hex.hasPrefix("#") ? String(colour.hex.dropFirst()) : colour.hex
        return clean.count == 6 && clean.allSatisfy(\.isHexDigit)
    }
    private var ratioWhite: Double? { hexValid ? contrastRatio(hex1: colour.hex, hex2: "#ffffff") : nil }
    private var ratioBlack: Double? { hexValid ? contrastRatio(hex1: colour.hex, hex2: "#000000") : nil }
    private var levelWhite: WcagLevel? { ratioWhite.map { wcagLevel($0) } }

    var body: some View {
        Button(action: onTap) {
            VStack(alignment: .leading, spacing: 0) {
                HStack(spacing: 12) {
                    RoundedRectangle(cornerRadius: 10)
                        .fill(Color(hex: colour.hex) ?? .gray)
                        .frame(width: 44, height: 44)

                    VStack(alignment: .leading, spacing: 2) {
                        Text(colour.name.isEmpty ? colour.hex : colour.name)
                            .fontWeight(.medium)
                            .foregroundStyle(.primary)
                        Text(colour.hex.uppercased())
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }

                    Spacer()

                    if let levelWhite {
                        WcagBadge(level: levelWhite)
                    }
                }

                if isExpanded {
                    VStack(spacing: 8) {
                        ContrastRow(label: "vs white", bgColor: .white, ratio: ratioWhite, level: levelWhite)
                        PreviewSwatch(bg: .white, fg: Color(hex: colour.hex) ?? .gray)
                        let levelBlack = ratioBlack.map { wcagLevel($0) }
                        ContrastRow(label: "vs black", bgColor: .black, ratio: ratioBlack, level: levelBlack)
                        PreviewSwatch(bg: .black, fg: Color(hex: colour.hex) ?? .gray)
                    }
                    .padding(.top, 12)
                }
            }
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .animation(.spring(duration: 0.3), value: isExpanded)
    }
}

private struct WcagBadge: View {
    let level: WcagLevel

    private var colors: (bg: Color, fg: Color) {
        switch level {
        case .AAA:      (Color(hex: "#0F3D2E")!, Color(hex: "#4ADE80")!)
        case .AA:       (Color(hex: "#1E1E4A")!, Color(hex: "#A5B4FC")!)
        case .AA_LARGE: (Color(hex: "#2A2A1A")!, Color(hex: "#FBBF24")!)
        case .FAIL:     (Color(hex: "#3D1515")!, Color(hex: "#F87171")!)
        }
    }

    var body: some View {
        Text(wcagLabel(level: level))
            .font(.system(size: 10, weight: .semibold))
            .foregroundStyle(colors.fg)
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(colors.bg, in: Capsule())
    }
}

private struct ContrastRow: View {
    let label: String
    let bgColor: Color
    let ratio: Double?
    let level: WcagLevel?

    var body: some View {
        HStack(spacing: 8) {
            RoundedRectangle(cornerRadius: 4)
                .fill(bgColor)
                .frame(width: 20, height: 20)
                .overlay(RoundedRectangle(cornerRadius: 4).strokeBorder(Color(.systemGray4), lineWidth: 0.5))
            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
            Spacer()
            if let ratio {
                Text("\(ratio, format: .number.precision(.fractionLength(2))):1")
                    .font(.caption)
                    .fontWeight(.medium)
            }
            if let level {
                WcagBadge(level: level)
            }
        }
    }
}

private struct PreviewSwatch: View {
    let bg: Color
    let fg: Color

    var body: some View {
        Text("The quick brown fox")
            .font(.callout)
            .foregroundStyle(fg)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(10)
            .background(bg, in: RoundedRectangle(cornerRadius: 8))
    }
}

// MARK: - Add colour sheet

private struct AddColourSheet: View {
    let paletteId: String
    @Binding var isPresented: Bool
    @Environment(AppViewModel.self) private var vm
    @State private var pickedColor: Color = Color(hex: "#9d93f9") ?? .purple
    @State private var hexInput = "9D93F9"
    @State private var colourName = ""

    var body: some View {
        NavigationStack {
            Form {
                Section("Colour") {
                    ColorPicker("Pick a colour", selection: $pickedColor, supportsOpacity: false)
                        .onChange(of: pickedColor) { _, new in
                            hexInput = String(new.hexString.dropFirst()).uppercased()
                        }
                    HStack {
                        Text("#").foregroundStyle(.secondary)
                        TextField("9D93F9", text: $hexInput)
                            .textInputAutocapitalization(.characters)
                            .onChange(of: hexInput) { _, new in
                                let clean = String(new.filter(\.isHexDigit).prefix(6)).uppercased()
                                hexInput = clean
                                if clean.count == 6, let color = Color(hex: "#\(clean)") {
                                    pickedColor = color
                                }
                            }
                    }
                    HStack(spacing: 12) {
                        RoundedRectangle(cornerRadius: 8)
                            .fill(pickedColor)
                            .frame(width: 36, height: 36)
                        Text(hexInput.count == 6 ? "#\(hexInput)" : "—")
                            .font(.system(.body, design: .monospaced))
                            .foregroundStyle(.secondary)
                    }
                }
                Section("Name") {
                    TextField("Optional name", text: $colourName)
                }
            }
            .navigationTitle("Add Colour")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { isPresented = false }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Add") {
                        let hex = "#\(hexInput.count == 6 ? hexInput : hexInput.padding(toLength: 6, withPad: "0", startingAt: 0))"
                        vm.addColour(paletteId: paletteId, hex: hex, name: colourName)
                        isPresented = false
                    }
                    .disabled(hexInput.count != 6)
                }
            }
        }
    }
}
