//
//  ExportView.swift
//  Chroma
//

import SwiftUI

struct ExportView: View {
    @Environment(AppViewModel.self) private var vm
    @State private var format: ExportFormat = .css
    @State private var showFormatPicker = false
    @State private var copied = false

    private var isEmpty: Bool {
        vm.tokenGroups.isEmpty || vm.tokenGroups.allSatisfy { $0.tokens.isEmpty }
    }

    private var output: String {
        switch format {
        case .css:        exportCSS(groups: vm.tokenGroups, palettes: vm.palettes)
        case .scss:       exportSCSS(groups: vm.tokenGroups, palettes: vm.palettes)
        case .json:       exportJSON(groups: vm.tokenGroups, palettes: vm.palettes)
        case .tailwind:   exportTailwind(groups: vm.tokenGroups, palettes: vm.palettes)
        case .androidXml: exportAndroidXml(groups: vm.tokenGroups, palettes: vm.palettes)
        }
    }

    var body: some View {
        VStack(spacing: 0) {
            // Format selector
            Button { showFormatPicker = true } label: {
                HStack(spacing: 12) {
                    Image(systemName: "chevron.left.forwardslash.chevron.right")
                        .frame(width: 36, height: 36)
                        .background(Color.accentColor.opacity(0.15), in: RoundedRectangle(cornerRadius: 10))
                        .foregroundStyle(Color.accentColor)
                    VStack(alignment: .leading, spacing: 2) {
                        Text(format.label)
                            .fontWeight(.medium)
                            .foregroundStyle(.primary)
                        Text(".\(format.ext)")
                            .font(.system(.caption, design: .monospaced))
                            .foregroundStyle(.secondary)
                    }
                    Spacer()
                    Image(systemName: "chevron.up.chevron.down")
                        .foregroundStyle(.secondary)
                        .font(.caption)
                }
                .padding(14)
                .background(Color(.secondarySystemGroupedBackground), in: RoundedRectangle(cornerRadius: 14))
            }
            .buttonStyle(.plain)
            .padding(.horizontal, 16)
            .padding(.top, 12)
            .padding(.bottom, 8)

            // Code preview or empty state
            if isEmpty {
                ContentUnavailableView(
                    "Nothing to Export",
                    systemImage: "square.and.arrow.up",
                    description: Text("Add tokens in the Tokens tab to generate exports")
                )
                .frame(maxHeight: .infinity)
            } else {
                ScrollView {
                    Text(output)
                        .font(.system(.caption, design: .monospaced))
                        .foregroundStyle(Color(.label).opacity(0.75))
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(14)
                }
                .background(Color(.secondarySystemGroupedBackground), in: RoundedRectangle(cornerRadius: 12))
                .padding(.horizontal, 16)

                // Actions
                HStack(spacing: 10) {
                    Button {
                        UIPasteboard.general.string = output
                        withAnimation { copied = true }
                        Task {
                            try? await Task.sleep(for: .seconds(2))
                            withAnimation { copied = false }
                        }
                    } label: {
                        Label(copied ? "Copied!" : "Copy", systemImage: copied ? "checkmark" : "doc.on.doc")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)
                    .animation(.default, value: copied)

                    ShareLink(
                        item: output,
                        subject: Text("chroma-tokens.\(format.ext)")
                    ) {
                        Label("Share .\(format.ext)", systemImage: "square.and.arrow.up")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.bordered)
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
            }
        }
        .frame(maxHeight: .infinity, alignment: .top)
        .background(Color(.systemGroupedBackground))
        .navigationTitle("Export")
        .sheet(isPresented: $showFormatPicker) {
            FormatPickerSheet(selected: $format, isPresented: $showFormatPicker)
                .presentationDetents([.medium])
        }
    }
}

// MARK: - Format model

private enum ExportFormat: CaseIterable, Identifiable {
    case css, scss, json, tailwind, androidXml

    var id: Self { self }

    var label: String {
        switch self {
        case .css:        "CSS custom properties"
        case .scss:       "SCSS variables"
        case .json:       "Style Dictionary"
        case .tailwind:   "Tailwind config"
        case .androidXml: "Android XML"
        }
    }

    var ext: String {
        switch self {
        case .css:        "css"
        case .scss:       "scss"
        case .json:       "json"
        case .tailwind:   "ts"
        case .androidXml: "xml"
        }
    }

    var description: String {
        switch self {
        case .css:        "Paste into any stylesheet"
        case .scss:       "Import into SCSS projects"
        case .json:       "Amazon Style Dictionary format"
        case .tailwind:   "Paste into tailwind.config.ts"
        case .androidXml: "Drop into res/values/colors.xml"
        }
    }
}

// MARK: - Format picker sheet

private struct FormatPickerSheet: View {
    @Binding var selected: ExportFormat
    @Binding var isPresented: Bool

    var body: some View {
        NavigationStack {
            List {
                ForEach(ExportFormat.allCases) { format in
                    Button {
                        selected = format
                        isPresented = false
                    } label: {
                        HStack {
                            VStack(alignment: .leading, spacing: 2) {
                                Text(format.label)
                                    .fontWeight(.medium)
                                    .foregroundStyle(.primary)
                                Text(format.description)
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                            Spacer()
                            Text(".\(format.ext)")
                                .font(.system(.caption, design: .monospaced))
                                .foregroundStyle(.secondary)
                            if selected == format {
                                Image(systemName: "checkmark")
                                    .foregroundStyle(Color.accentColor)
                                    .fontWeight(.semibold)
                            }
                        }
                    }
                }
            }
            .navigationTitle("Select Format")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { isPresented = false }
                }
            }
        }
    }
}
