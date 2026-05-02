//
//  TokensView.swift
//  Chroma
//

import SwiftUI

struct TokensView: View {
    @Environment(AppViewModel.self) private var vm
    @State private var showAddAlert = false
    @State private var newGroupName = ""
    @State private var newTokenNames: [String: String] = [:]

    var body: some View {
        List {
            ForEach(vm.tokenGroups) { group in
                DisclosureGroup {
                    ForEach(group.tokens) { token in
                        TokenRow(
                            token: token,
                            palettes: vm.palettes,
                            onRemove: { vm.removeToken(groupId: group.id, tokenId: token.id) },
                            onAssign: { paletteId, colourId in
                                vm.assignColour(groupId: group.id, tokenId: token.id, paletteId: paletteId, colourId: colourId)
                            }
                        )
                        .swipeActions(edge: .trailing) {
                            Button(role: .destructive) {
                                vm.removeToken(groupId: group.id, tokenId: token.id)
                            } label: {
                                Label("Delete", systemImage: "trash")
                            }
                        }
                    }
                    AddTokenRow(
                        text: Binding(
                            get: { newTokenNames[group.id] ?? "" },
                            set: { newTokenNames[group.id] = $0 }
                        ),
                        onAdd: { name in vm.addToken(groupId: group.id, name: name) }
                    )
                } label: {
                    HStack {
                        Text(group.name)
                            .fontWeight(.medium)
                        Spacer()
                        Text("\(group.tokens.count)")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                            .padding(.trailing, 4)
                    }
                }
                .swipeActions(edge: .trailing) {
                    Button(role: .destructive) {
                        vm.removeGroup(groupId: group.id)
                    } label: {
                        Label("Delete", systemImage: "trash")
                    }
                }
            }
        }
        .navigationTitle("Tokens")
        .overlay {
            if vm.tokenGroups.isEmpty {
                ContentUnavailableView(
                    "No Groups",
                    systemImage: "curlybraces",
                    description: Text("Tap + to add your first token group")
                )
            }
        }
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button("New Group", systemImage: "plus") {
                    showAddAlert = true
                }
            }
        }
        .alert("New Token Group", isPresented: $showAddAlert) {
            TextField("Group name", text: $newGroupName)
                .autocorrectionDisabled()
            Button("Add") {
                let trimmed = newGroupName.trimmingCharacters(in: .whitespaces)
                guard !trimmed.isEmpty else { return }
                vm.addGroup(name: trimmed)
                newGroupName = ""
            }
            Button("Cancel", role: .cancel) { newGroupName = "" }
        }
    }
}

// MARK: - Add token row

private struct AddTokenRow: View {
    @Binding var text: String
    let onAdd: (String) -> Void

    var body: some View {
        HStack {
            TextField("New token name…", text: $text)
                .font(.system(.callout, design: .monospaced))
                .autocorrectionDisabled()
                .onSubmit { submit() }
            Button("Add", action: submit)
                .disabled(text.trimmingCharacters(in: .whitespaces).isEmpty)
        }
    }

    private func submit() {
        let trimmed = text.trimmingCharacters(in: .whitespaces)
        guard !trimmed.isEmpty else { return }
        onAdd(trimmed)
        text = ""
    }
}

// MARK: - Token row

private struct TokenRow: View {
    let token: Token
    let palettes: [Palette]
    let onRemove: () -> Void
    let onAssign: (String, String) -> Void

    private var assignedColour: Colour? {
        palettes.first { $0.id == token.value.paletteId }?.colours.first { $0.id == token.value.colourId }
    }

    var body: some View {
        HStack(spacing: 10) {
            RoundedRectangle(cornerRadius: 6)
                .fill(assignedColour.flatMap { Color(hex: $0.hex) } ?? Color(.systemGray5))
                .frame(width: 24, height: 24)

            Text(token.name)
                .font(.system(.callout, design: .monospaced))
                .lineLimit(1)

            Spacer()

            Menu {
                let available = palettes.filter { !$0.colours.isEmpty }
                if available.isEmpty {
                    Text("No colours available")
                } else {
                    ForEach(available) { palette in
                        Section(palette.name) {
                            ForEach(palette.colours) { colour in
                                Button {
                                    onAssign(palette.id, colour.id)
                                } label: {
                                    Label(
                                        colour.name.isEmpty ? colour.hex : colour.name,
                                        systemImage: "circle.fill"
                                    )
                                }
                            }
                        }
                    }
                }
            } label: {
                Text(assignedColour.map { $0.name.isEmpty ? $0.hex : $0.name } ?? "Assign")
                    .font(.caption)
            }
        }
        .padding(.vertical, 2)
    }
}
