//
//  TokensView.swift
//  Chroma
//

import SwiftUI

struct TokensView: View {
    @Environment(AppViewModel.self) private var vm
    @State private var newGroupName = ""
    @State private var expandedGroupId: String?
    @State private var newTokenNames: [String: String] = [:]

    var body: some View {
        List {
            ForEach(vm.tokenGroups) { group in
                TokenGroupSection(
                    group: group,
                    palettes: vm.palettes,
                    isExpanded: expandedGroupId == group.id,
                    newTokenName: Binding(
                        get: { newTokenNames[group.id] ?? "" },
                        set: { newTokenNames[group.id] = $0 }
                    ),
                    onToggle: {
                        withAnimation(.spring(duration: 0.3)) {
                            expandedGroupId = expandedGroupId == group.id ? nil : group.id
                        }
                    },
                    onRemoveGroup: { vm.removeGroup(groupId: group.id) },
                    onAddToken: { name in vm.addToken(groupId: group.id, name: name) },
                    onRemoveToken: { tokenId in vm.removeToken(groupId: group.id, tokenId: tokenId) },
                    onAssign: { tokenId, paletteId, colourId in
                        vm.assignColour(groupId: group.id, tokenId: tokenId, paletteId: paletteId, colourId: colourId)
                    }
                )
            }
        }
        .navigationTitle("Tokens")
        .overlay {
            if vm.tokenGroups.isEmpty {
                ContentUnavailableView(
                    "No Groups",
                    systemImage: "curlybraces",
                    description: Text("Add a group to start mapping tokens")
                )
            }
        }
        .safeAreaInset(edge: .bottom) {
            HStack(spacing: 10) {
                TextField("New group…", text: $newGroupName)
                    .textFieldStyle(.roundedBorder)
                    .onSubmit { doAddGroup() }
                Button(action: doAddGroup) {
                    Image(systemName: "plus")
                        .fontWeight(.semibold)
                        .frame(width: 44, height: 44)
                        .background(Color.accentColor, in: RoundedRectangle(cornerRadius: 14))
                        .foregroundStyle(.white)
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            .background(.bar)
        }
    }

    private func doAddGroup() {
        let trimmed = newGroupName.trimmingCharacters(in: .whitespaces)
        guard !trimmed.isEmpty else { return }
        vm.addGroup(name: trimmed)
        newGroupName = ""
    }
}

// MARK: - Group section

private struct TokenGroupSection: View {
    let group: TokenGroup
    let palettes: [Palette]
    let isExpanded: Bool
    @Binding var newTokenName: String
    let onToggle: () -> Void
    let onRemoveGroup: () -> Void
    let onAddToken: (String) -> Void
    let onRemoveToken: (String) -> Void
    let onAssign: (String, String, String) -> Void

    var body: some View {
        Section {
            if isExpanded {
                ForEach(group.tokens) { token in
                    TokenRow(
                        token: token,
                        palettes: palettes,
                        onRemove: { onRemoveToken(token.id) },
                        onAssign: { paletteId, colourId in onAssign(token.id, paletteId, colourId) }
                    )
                }
                HStack(spacing: 8) {
                    TextField("Token name…", text: $newTokenName)
                        .font(.system(.callout, design: .monospaced))
                        .onSubmit { doAddToken() }
                    Button("Add", action: doAddToken)
                        .buttonStyle(.borderedProminent)
                        .controlSize(.small)
                        .disabled(newTokenName.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
        } header: {
            HStack {
                Text(group.name.uppercased())
                    .font(.system(size: 11, weight: .semibold))
                Spacer()
                Text("\(group.tokens.count) token\(group.tokens.count == 1 ? "" : "s")")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
                Button("Remove", role: .destructive, action: onRemoveGroup)
                    .font(.caption)
                Button(action: onToggle) {
                    Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                        .font(.caption)
                }
            }
        }
    }

    private func doAddToken() {
        let trimmed = newTokenName.trimmingCharacters(in: .whitespaces)
        guard !trimmed.isEmpty else { return }
        onAddToken(trimmed)
        newTokenName = ""
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
                    .foregroundStyle(Color.accentColor)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 5)
                    .background(Color(.systemGray5), in: RoundedRectangle(cornerRadius: 8))
            }

            Button(action: onRemove) {
                Image(systemName: "xmark")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            .buttonStyle(.plain)
        }
        .padding(.vertical, 2)
    }
}
