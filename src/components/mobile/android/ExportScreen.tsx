import { useState } from "react";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import { useTokenStore } from "../../../store/tokenStore";
import { usePaletteStore } from "../../../store/paletteStore";
import { exportCSS, exportSCSS, exportJSON, exportTailwind, exportAndroidXml } from "../../../lib/export";

type Format = "css" | "scss" | "json" | "tailwind" | "android";

const formats: { id: Format; label: string; ext: string; mime: string }[] = [
    { id: "css", label: "CSS vars", ext: "css", mime: "text/css" },
    { id: "scss", label: "SCSS vars", ext: "scss", mime: "text/plain" },
    { id: "json", label: "Style Dict", ext: "json", mime: "application/json" },
    { id: "tailwind", label: "Tailwind", ext: "ts", mime: "text/plain" },
    { id: "android", label: "Android XML", ext: "xml", mime: "text/xml" },
];

/** Mobile-specific M3 Export Screen. */
export function ExportScreen() {
    const [format, setFormat] = useState<Format>("css");
    const [copied, setCopied] = useState(false);
    const [saved, setSaved] = useState(false);

    const { groups } = useTokenStore();
    const { palettes } = usePaletteStore();

    function generate(f: Format): string {
        switch (f) {
            case "css": return exportCSS(groups, palettes);
            case "scss": return exportSCSS(groups, palettes);
            case "json": return exportJSON(groups, palettes);
            case "tailwind": return exportTailwind(groups, palettes);
            case "android": return exportAndroidXml(groups, palettes);
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
            filters: [{ name: currentFormat.label, extensions: [currentFormat.ext] }],
        });
        if (!path) return;
        await writeTextFile(path, output);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const isEmpty = groups.length === 0 || groups.every((g) => g.tokens.length === 0);

    return (
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>

            {/* Header - M3 Center Aligned with Safe Area */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 'max(20px, env(safe-area-inset-top)) 16px 16px', flexShrink: 0
            }}>
                <p style={{ fontSize: '22px', fontWeight: 400, letterSpacing: '-0.3px', color: 'var(--ink)' }}>Export</p>
            </div>

            {/* Format picker - M3 Filter Chips */}
            <div style={{
                display: 'flex', gap: '8px', padding: '0 16px 16px',
                flexWrap: 'wrap', flexShrink: 0
            }}>
                {formats.map((f) => (
                    <button
                        key={f.id}
                        onClick={() => setFormat(f.id)}
                        style={{
                            background: format === f.id ? "var(--accent-soft)" : "var(--bg-raised)",
                            color: format === f.id ? "var(--accent)" : "var(--ink-2)",
                            border: "none",
                            borderRadius: "100px", // Pill shape
                            padding: "8px 16px",
                            fontSize: "13px",
                            fontWeight: format === f.id ? 600 : 500,
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            // Removes Android tap highlight box
                            WebkitTapHighlightColor: 'transparent',
                        }}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Output preview Container */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px', display: 'flex', flexDirection: 'column' }}>
                {isEmpty ? (
                    <p style={{ textAlign: 'center', color: 'var(--ink-4)', fontSize: '13px', paddingTop: '48px' }}>
                        Add tokens in the Tokens tab to generate exports
                    </p>
                ) : (
                    <pre style={{
                        flex: 1,
                        margin: 0,
                        fontFamily: '"DM Mono", monospace',
                        fontSize: '12px',
                        color: 'var(--ink)',
                        background: 'var(--bg-sunken)',
                        border: 'none',
                        borderRadius: '24px', // M3 Large Container
                        padding: '20px',
                        overflowY: 'auto',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all',
                    }}>
                        {output}
                    </pre>
                )}
            </div>

            {/* Actions - M3 Tonal Bottom Bar with Pill Buttons */}
            {!isEmpty && (
                <div style={{
                    padding: '12px 16px calc(16px + env(safe-area-inset-bottom))',
                    boxShadow: '0 -1px 4px rgba(0,0,0,0.03)',
                    display: 'flex', gap: '12px', flexShrink: 0, background: 'var(--bg-raised)',
                }}>
                    <button
                        onClick={handleCopy}
                        style={{
                            flex: 1, background: copied ? "var(--accent-soft)" : "var(--bg-sunken)",
                            color: copied ? "var(--accent)" : "var(--ink-2)",
                            border: "none", borderRadius: "100px",
                            padding: "14px 0", fontSize: "14px", fontWeight: 500,
                            cursor: "pointer", transition: "all 0.2s ease",
                            WebkitTapHighlightColor: 'transparent',
                        }}
                    >
                        {copied ? "Copied!" : "Copy code"}
                    </button>
                    <button
                        onClick={handleSave}
                        style={{
                            flex: 1, background: saved ? "var(--bg-sunken)" : "var(--accent)",
                            color: saved ? "var(--ink-3)" : "#fff",
                            border: "none", borderRadius: "100px",
                            padding: "14px 0", fontSize: "14px", fontWeight: 500,
                            cursor: "pointer", transition: "all 0.2s ease",
                            WebkitTapHighlightColor: 'transparent',
                        }}
                    >
                        {saved ? "Saved!" : `Save .${currentFormat.ext}`}
                    </button>
                </div>
            )}
        </div>
    );
}
