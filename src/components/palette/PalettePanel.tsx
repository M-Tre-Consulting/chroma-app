import { useState } from "react";
import { usePaletteStore } from "../../store/paletteStore";
import { ColourCard } from "./ColourCard";

/**
 * PalettePanel: a palette panel React component for UI.
 */
export function PalettePanel() {
    const [newName, setNewName] = useState("");
    const {
        palettes,
        activePaletteId,
        addPalette,
        removePalette,
        setActivePalette,
    } = usePaletteStore();

    const handleAdd = () => {
        if (!newName.trim()) return;
        addPalette(newName.trim());
        setNewName("");
    };

    const activePalette = palettes.find((p) => p.id === activePaletteId);

    return (
        <div className="flex flex-col gap-4 p-4">
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="New palette name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    className="flex-1 rounded border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
                <button
                    onClick={handleAdd}
                    className="rounded bg-blue-500 px-3 py-1.5 text-sm text-white hover:bg-blue-600"
                >
                    Add
                </button>
            </div>

            <div className="flex flex-col gap-1">
                {palettes.map((p) => (
                    <div
                        key={p.id}
                        onClick={() => setActivePalette(p.id)}
                        className={`flex cursor-pointer items-center justify-between rounded px-3 py-2 text-sm transition-colors ${
                            p.id === activePaletteId
                                ? "bg-blue-50 text-blue-700"
                                : "hover:bg-gray-50"
                        }`}
                    >
                        <span>{p.name}</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">
                                {p.colours.length}
                            </span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removePalette(p.id);
                                }}
                                className="text-gray-300 hover:text-red-400"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {activePalette && (
                <div className="flex flex-col gap-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        {activePalette.name}
                    </p>
                    <div className="flex flex-col gap-1">
                        {activePalette.colours.map((c) => (
                            <ColourCard
                                key={c.id}
                                colour={c}
                                paletteId={activePalette.id}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
