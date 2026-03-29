import { useState } from "react";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import { useTokenStore } from "../../store/tokenStore";
import { usePaletteStore } from "../../store/paletteStore";
import {
    exportCSS,
    exportSCSS,
    exportJSON,
    exportTailwind,
    exportAndroidXml,
} from "../../lib/export";

type Format = "css" | "scss" | "json" | "tailwind" | "android";

const formats: { id: Format; label: string; ext: string; mime: string }[] = [
    { id: "css", label: "CSS vars", ext: "css", mime: "text/css" },
    { id: "scss", label: "SCSS vars", ext: "scss", mime: "text/plain" },
    { id: "json", label: "Style Dict", ext: "json", mime: "application/json" },
    { id: "tailwind", label: "Tailwind", ext: "ts", mime: "text/plain" },
    { id: "android", label: "Android XML", ext: "xml", mime: "text/xml" },
];

/** Export panel — format picker, output preview, copy and save actions. */
export function ExportPanel() {
    const [format, setFormat] = useState<Format>("css");
    const [copied, setCopied] = useState(false);
    const [saved, setSaved] = useState(false);

    const { groups } = useTokenStore();
    const { palettes } = usePaletteStore();

    function generate(f: Format): string {
        switch (f) {
            case "css":
                return exportCSS(groups, palettes);
            case "scss":
                return exportSCSS(groups, palettes);
            case "json":
                return exportJSON(groups, palettes);
            case "tailwind":
                return exportTailwind(groups, palettes);
            case "android":
                return exportAndroidXml(groups, palettes);
        }
    }

    const output = generate(format);
    const currentFormat = formats.find((f) => f.id === format)!;

    const handleCopy = async () => {
        await writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSave = async () => {
        const path = await save({
            defaultPath: `tokens.${currentFormat.ext}`,
            filters: [
                { name: currentFormat.label, extensions: [currentFormat.ext] },
            ],
        });
        if (!path) return;
        await writeTextFile(path, output);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const isEmpty =
        groups.length === 0 || groups.every((g) => g.tokens.length === 0);

    return (
        <div className="flex flex-col h-full">
            {/* Format picker */}
            <div
                className="flex gap-1 p-2 flex-wrap"
                style={{ borderBottom: "0.5px solid var(--border)" }}
            >
                {formats.map((f) => (
                    <button
                        key={f.id}
                        onClick={() => setFormat(f.id)}
                        className="px-3 py-1 text-xs rounded-md transition-all"
                        style={{
                            background:
                                format === f.id
                                    ? "var(--accent)"
                                    : "var(--bg-sunken)",
                            color: format === f.id ? "#fff" : "var(--ink-3)",
                            border: "0.5px solid",
                            borderColor:
                                format === f.id
                                    ? "var(--accent)"
                                    : "var(--border)",
                            cursor: "pointer",
                            fontWeight: format === f.id ? 500 : 400,
                            transition: "all 0.15s ease",
                        }}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Output preview */}
            <div
                className="flex-1 overflow-y-auto p-3"
                style={{ minHeight: 0 }}
            >
                {isEmpty ? (
                    <p
                        className="text-xs pt-8 text-center"
                        style={{ color: "var(--ink-4)" }}
                    >
                        Add tokens in the Tokens tab to generate exports
                    </p>
                ) : (
                    <pre
                        className="text-xs leading-relaxed whitespace-pre-wrap break-all"
                        style={{
                            fontFamily: '"DM Mono", monospace',
                            color: "var(--ink-2)",
                            background: "var(--bg-sunken)",
                            border: "0.5px solid var(--border)",
                            borderRadius: "8px",
                            padding: "12px",
                        }}
                    >
                        {output}
                    </pre>
                )}
            </div>

            {/* Actions */}
            {!isEmpty && (
                <div
                    className="flex gap-2 p-3"
                    style={{ borderTop: "0.5px solid var(--border)" }}
                >
                    <button
                        onClick={handleCopy}
                        className="flex-1 py-2 text-xs rounded-lg transition-all"
                        style={{
                            background: copied
                                ? "var(--bg-sunken)"
                                : "var(--accent)",
                            color: copied ? "var(--ink-3)" : "#fff",
                            border: "0.5px solid",
                            borderColor: copied
                                ? "var(--border)"
                                : "var(--accent)",
                            cursor: "pointer",
                            fontWeight: 500,
                            transition: "all 0.15s ease",
                        }}
                    >
                        {copied ? "Copied!" : "Copy to clipboard"}
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 py-2 text-xs rounded-lg transition-all"
                        style={{
                            background: saved
                                ? "var(--bg-sunken)"
                                : "transparent",
                            color: saved ? "var(--ink-3)" : "var(--accent)",
                            border: "0.5px solid",
                            borderColor: saved
                                ? "var(--border)"
                                : "var(--accent)",
                            cursor: "pointer",
                            fontWeight: 500,
                            transition: "all 0.15s ease",
                        }}
                    >
                        {saved ? "Saved!" : `Save as .${currentFormat.ext}`}
                    </button>
                </div>
            )}
        </div>
    );
}
