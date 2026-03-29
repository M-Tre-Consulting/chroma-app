import { useState } from "react";
import { HexColorPicker, HexColorInput } from "react-colorful";
import { usePaletteStore } from "../../store/paletteStore";

export function ColourPicker() {
    const [hex, setHex] = useState("#7c6ff7");
    const [name, setName] = useState("");
    const { palettes, activePaletteId, addColour } = usePaletteStore();
    const activePalette = palettes.find((p) => p.id === activePaletteId);

    const handleAdd = () => {
        if (!activePaletteId) return;
        addColour(activePaletteId, hex, name || undefined);
        setName("");
    };

    return (
        <>
            <HexColorPicker
                color={hex}
                onChange={setHex}
                style={{
                    width: "100%",
                    borderRadius: "12px",
                    overflow: "hidden",
                }}
            />

            <div className="flex items-center gap-2">
                <div
                    className="h-7 w-7 shrink-0 rounded-lg"
                    style={{
                        background: hex,
                        border: "0.5px solid var(--border)",
                    }}
                />
                <div
                    className="flex items-center flex-1 rounded-lg overflow-hidden"
                    style={{
                        border: "0.5px solid var(--border-strong)",
                        background: "var(--bg-sunken)",
                    }}
                >
                    <span
                        className="pl-2 text-xs"
                        style={{ color: "var(--ink-3)" }}
                    >
                        #
                    </span>
                    <HexColorInput
                        color={hex}
                        onChange={setHex}
                        style={{
                            background: "transparent",
                            border: "none",
                            padding: "5px 8px",
                            fontFamily: '"DM Mono", monospace',
                            fontSize: "12px",
                            color: "var(--ink)",
                            textTransform: "uppercase",
                            width: "100%",
                        }}
                    />
                </div>
            </div>

            <input
                placeholder="Name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />

            <button
                onClick={handleAdd}
                disabled={!activePalette}
                style={{
                    background: activePalette
                        ? "var(--accent)"
                        : "var(--border)",
                    color: activePalette ? "#fff" : "var(--ink-3)",
                    border: "none",
                    borderRadius: "10px",
                    padding: "8px",
                    fontSize: "12px",
                    fontWeight: 500,
                    cursor: activePalette ? "pointer" : "not-allowed",
                    fontFamily: '"DM Sans", sans-serif',
                    transition: "background 0.15s",
                    width: "100%",
                }}
            >
                {activePalette
                    ? `Add to ${activePalette.name}`
                    : "Select a palette first"}
            </button>
        </>
    );
}
