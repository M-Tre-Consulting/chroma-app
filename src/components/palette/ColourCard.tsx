import { useState } from "react";
import { HexColorInput } from "react-colorful";
import { contrastRatio, wcagLevel, suggestFix } from "../../lib/colour";
import { usePaletteStore } from "../../store/paletteStore";
import type { Colour } from "../../types";

interface Props {
    colour: Colour;
    paletteId: string;
}

const wcagStyles: Record<string, { bg: string; fg: string }> = {
    AAA: { bg: "var(--wcag-aaa-bg)", fg: "var(--wcag-aaa-fg)" },
    AA: { bg: "var(--wcag-aa-bg)", fg: "var(--wcag-aa-fg)" },
    "AA Large": { bg: "var(--wcag-aal-bg)", fg: "var(--wcag-aal-fg)" },
    Fail: { bg: "var(--wcag-fail-bg)", fg: "var(--wcag-fail-fg)" },
};

export function ColourCard({ colour, paletteId }: Props) {
    const [expanded, setExpanded] = useState(false);
    const [bg, setBg] = useState("#ffffff");
    const { removeColour, updateColour } = usePaletteStore();

    const isValidHex = /^#[0-9a-fA-F]{6}$/.test(bg);
    const ratio = isValidHex ? contrastRatio(colour.hex, bg) : 0;
    const level = isValidHex ? wcagLevel(ratio) : "Fail";
    const fix =
        isValidHex && (level === "Fail" || level === "AA Large")
            ? suggestFix(colour.hex, bg)
            : null;
    const ws = wcagStyles[level];

    return (
        <div
            className="rounded-xl overflow-hidden transition-all"
            style={{
                background: "var(--bg-raised)",
                border: "0.5px solid var(--border)",
            }}
        >
            <div
                className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer"
                onClick={() => setExpanded((e) => !e)}
            >
                <div
                    className="w-9 h-9 rounded-lg flex-shrink-0 transition-transform hover:scale-105"
                    style={{
                        background: colour.hex,
                        border: "0.5px solid rgba(0,0,0,0.06)",
                    }}
                />
                <div className="flex-1 min-w-0">
                    <p
                        className="text-sm font-medium truncate"
                        style={{ color: "var(--ink)" }}
                    >
                        {colour.name || colour.hex}
                    </p>
                    <p
                        className="text-xs font-mono"
                        style={{ color: "var(--ink-3)" }}
                    >
                        {colour.hex.toUpperCase()}
                    </p>
                </div>
                <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: ws.bg, color: ws.fg }}
                >
                    {level}
                </span>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        removeColour(paletteId, colour.id);
                    }}
                    className="text-xs opacity-0 hover:opacity-100 transition-opacity"
                    style={{ color: "var(--ink-4)" }}
                >
                    ✕
                </button>
            </div>

            {expanded && (
                <div
                    className="px-3 pb-3 flex flex-col gap-2.5"
                    style={{
                        borderTop: "0.5px solid var(--border)",
                        paddingTop: "10px",
                        background: "var(--bg-sunken)",
                    }}
                >
                    <div className="flex items-center gap-2">
                        <span
                            className="text-xs flex-shrink-0"
                            style={{ color: "var(--ink-3)" }}
                        >
                            vs
                        </span>
                        <div
                            className="w-5 h-5 rounded flex-shrink-0"
                            style={{
                                background: bg,
                                border: "0.5px solid var(--border)",
                            }}
                        />
                        <span
                            className="text-xs flex-shrink-0"
                            style={{ color: "var(--ink-3)" }}
                        >
                            #
                        </span>
                        <HexColorInput
                            color={bg}
                            onChange={setBg}
                            style={{
                                flex: 1,
                                fontFamily: '"DM Mono", monospace',
                                fontSize: "11px",
                                padding: "4px 8px",
                                background: "var(--bg-raised)",
                                border: "0.5px solid var(--border-strong)",
                                borderRadius: "6px",
                                color: "var(--ink)",
                            }}
                        />
                        <span
                            className="text-xs font-medium flex-shrink-0"
                            style={{ color: "var(--ink)" }}
                        >
                            {ratio}:1
                        </span>
                    </div>

                    <div
                        className="rounded-lg px-3 py-2 text-sm"
                        style={{
                            background: bg,
                            color: colour.hex,
                            border: "0.5px solid var(--border)",
                        }}
                    >
                        The quick brown fox
                    </div>

                    {fix && fix !== colour.hex && (
                        <div className="flex items-center gap-2">
                            <span
                                className="text-xs"
                                style={{ color: "var(--ink-3)" }}
                            >
                                Suggested fix
                            </span>
                            <div
                                className="w-4 h-4 rounded flex-shrink-0"
                                style={{
                                    background: fix,
                                    border: "0.5px solid var(--border)",
                                }}
                            />
                            <span
                                className="text-xs font-mono flex-shrink-0"
                                style={{ color: "var(--ink-3)" }}
                            >
                                {fix}
                            </span>
                            <button
                                onClick={() =>
                                    updateColour(paletteId, colour.id, {
                                        hex: fix,
                                    })
                                }
                                className="ml-auto text-xs font-medium"
                                style={{
                                    color: "var(--accent)",
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                }}
                            >
                                Apply
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
