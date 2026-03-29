import { useState } from "react";
import { HexColorPicker, HexColorInput } from "react-colorful";
import { usePaletteStore } from "../../store/paletteStore";

/**
 * ColourPicker: a colour picker React component for UI.
 */
export function ColourPicker() {
    const [hex, setHex] = useState("#3d6bce");
    const [name, setName] = useState("");
    const { palettes, activePaletteId, addColour } = usePaletteStore();

    const activePalette = palettes.find((p) => p.id === activePaletteId);

    const handleAdd = () => {
        if (!activePaletteId) return;
        addColour(activePaletteId, hex, name || undefined);
        setName("");
    };

    return (
        <div className="flex flex-col gap-4 p-4">
            <HexColorPicker
                color={hex}
                onChange={setHex}
                style={{ width: "100%" }}
            />

            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">#</span>
                <HexColorInput
                    color={hex}
                    onChange={setHex}
                    className="flex-1 rounded border border-gray-200 px-3 py-1.5 text-sm font-mono uppercase focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
                <div
                    className="h-8 w-8 rounded border border-gray-200"
                    style={{ backgroundColor: hex }}
                />
            </div>

            <input
                type="text"
                placeholder="Colour name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="rounded border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
            />

            <button
                onClick={handleAdd}
                disabled={!activePalette}
                className="rounded bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
                {activePalette
                    ? `Add to ${activePalette.name}`
                    : "Select a palette first"}
            </button>
        </div>
    );
}
