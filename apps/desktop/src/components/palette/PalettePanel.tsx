import { useState } from "react";
import { usePaletteStore } from "../../store/paletteStore";

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

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-0.5">
                <p
                    className="px-2 pt-2 pb-1 text-2xs font-medium uppercase tracking-widest"
                    style={{ color: "var(--ink-4)" }}
                >
                    My palettes
                </p>
                {palettes.map((p) => (
                    <div key={p.id}>
                        <div
                            onClick={() => setActivePalette(p.id)}
                            className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors group"
                            style={{
                                background:
                                    p.id === activePaletteId
                                        ? "var(--accent-soft)"
                                        : "transparent",
                            }}
                        >
                            <div
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{
                                    background:
                                        p.colours[0]?.hex ?? "var(--ink-4)",
                                }}
                            />
                            <span
                                className="flex-1 text-sm truncate"
                                style={{
                                    color:
                                        p.id === activePaletteId
                                            ? "var(--accent)"
                                            : "var(--ink)",
                                    fontWeight:
                                        p.id === activePaletteId ? 500 : 400,
                                }}
                            >
                                {p.name}
                            </span>
                            <span
                                className="text-xs"
                                style={{ color: "var(--ink-4)" }}
                            >
                                {p.colours.length}
                            </span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removePalette(p.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 text-xs transition-opacity"
                                style={{ color: "var(--ink-4)" }}
                            >
                                ✕
                            </button>
                        </div>

                        {p.id === activePaletteId && p.colours.length > 0 && (
                            <div className="flex flex-wrap gap-1 px-4 pb-2 pt-1">
                                {p.colours.map((c) => (
                                    <div
                                        key={c.id}
                                        title={c.name || c.hex}
                                        className="w-4 h-4 rounded-sm"
                                        style={{
                                            background: c.hex,
                                            border: "0.5px solid rgba(0,0,0,0.08)",
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div
                className="p-2 flex gap-1.5"
                style={{ borderTop: "0.5px solid var(--border)" }}
            >
                <input
                    placeholder="New palette…"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    style={{ flex: 1, minWidth: 0 }}
                />
                <button
                    onClick={handleAdd}
                    style={{
                        background: "var(--accent)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        padding: "6px 10px",
                        fontSize: "13px",
                        cursor: "pointer",
                        flexShrink: 0,
                    }}
                >
                    +
                </button>
            </div>
        </div>
    );
}
