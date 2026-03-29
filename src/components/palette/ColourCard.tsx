import { useState } from "react";
import { HexColorInput } from "react-colorful";
import { contrastRatio, wcagLevel, suggestFix } from "../../lib/colour";
import { usePaletteStore } from "../../store/paletteStore";
import type { Colour } from "../../types";

interface Props {
    colour: Colour;
    paletteId: string;
}

/** Displays a colour swatch with inline WCAG contrast checker and fix suggestion. */
export function ColourCard({ colour, paletteId }: Props) {
    const [expanded, setExpanded] = useState(false);
    const [bg, setBg] = useState("#ffffff");
    const { removeColour, updateColour } = usePaletteStore();

    const ratio = contrastRatio(colour.hex, bg);
    const level = wcagLevel(ratio);
    const fix =
        level === "Fail" || level === "AA Large"
            ? suggestFix(colour.hex, bg)
            : null;

    const levelColour: Record<string, string> = {
        AAA: "bg-green-100 text-green-700",
        AA: "bg-blue-100 text-blue-700",
        "AA Large": "bg-yellow-100 text-yellow-700",
        Fail: "bg-red-100 text-red-700",
    };

    return (
        <div className="rounded border border-gray-100 p-2 transition-all">
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setExpanded((e) => !e)}
                    className="h-8 w-8 shrink-0 rounded border border-gray-200 transition-transform hover:scale-105"
                    style={{ backgroundColor: colour.hex }}
                />
                <div className="flex flex-1 flex-col">
                    <span className="text-xs font-medium text-gray-700">
                        {colour.name || colour.hex}
                    </span>
                    <span className="font-mono text-xs text-gray-400">
                        {colour.hex}
                    </span>
                </div>
                <button
                    onClick={() => removeColour(paletteId, colour.id)}
                    className="text-gray-300 hover:text-red-400"
                >
                    ✕
                </button>
            </div>

            {expanded && (
                <div className="mt-3 flex flex-col gap-2 border-t border-gray-100 pt-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">vs</span>
                        <div
                            className="h-5 w-5 shrink-0 rounded border border-gray-200"
                            style={{ backgroundColor: bg }}
                        />
                        <span className="text-xs text-gray-400">#</span>
                        <HexColorInput
                            color={bg}
                            onChange={setBg}
                            className="flex-1 rounded border border-gray-200 px-2 py-1 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                            Ratio:{" "}
                            <span className="font-medium">{ratio}:1</span>
                        </span>
                        <span
                            className={`rounded px-2 py-0.5 text-xs font-medium ${levelColour[level]}`}
                        >
                            {level}
                        </span>
                    </div>

                    <div
                        className="rounded p-2 text-sm"
                        style={{ backgroundColor: bg, color: colour.hex }}
                    >
                        The quick brown fox
                    </div>

                    {fix && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">
                                Suggested fix:
                            </span>
                            <div
                                className="h-5 w-5 rounded border border-gray-200"
                                style={{ backgroundColor: fix }}
                            />
                            <span className="font-mono text-xs text-gray-500">
                                {fix}
                            </span>
                            <button
                                onClick={() =>
                                    updateColour(paletteId, colour.id, {
                                        hex: fix,
                                    })
                                }
                                className="ml-auto text-xs text-blue-500 hover:text-blue-600"
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
