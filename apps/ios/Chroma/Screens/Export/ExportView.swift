//
//  ExportView.swift
//  Chroma
//

import SwiftUI

struct ExportView: View {
    @Environment(AppViewModel.self) private var vm
    @State private var format: ExportFormat = .css
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
        Form {
            Section("Format") {
                Picker("Format", selection: $format) {
                    ForEach(ExportFormat.allCases) { f in
                        Text(f.label).tag(f)
                    }
                }
                .pickerStyle(.menu)
                Text(format.description)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            if isEmpty {
                Section {
                    Text("Add tokens in the Tokens tab to generate exports.")
                        .foregroundStyle(.secondary)
                        .font(.callout)
                }
            } else {
                Section("Preview") {
                    ScrollView {
                        Text(output)
                            .font(.system(.caption, design: .monospaced))
                            .frame(maxWidth: .infinity, alignment: .leading)
                    }
                    .frame(height: 260)
                }

                Section {
                    Button {
                        UIPasteboard.general.string = output
                        withAnimation { copied = true }
                        Task {
                            try? await Task.sleep(for: .seconds(2))
                            withAnimation { copied = false }
                        }
                    } label: {
                        Label(
                            copied ? "Copied!" : "Copy to Clipboard",
                            systemImage: copied ? "checkmark" : "doc.on.doc"
                        )
                    }
                    .animation(.default, value: copied)

                    ShareLink(
                        item: output,
                        subject: Text("chroma-tokens.\(format.ext)")
                    ) {
                        Label("Share as .\(format.ext)", systemImage: "square.and.arrow.up")
                    }
                }
            }
        }
        .navigationTitle("Export")
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
