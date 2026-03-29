import { useState } from "react";
import { ColourPicker } from "./components/picker/ColourPicker";
import { PalettePanel } from "./components/palette/PalettePanel";
import { TokenPanel } from "./components/tokens/TokenPanel";
import { usePaletteStore } from "./store/paletteStore";

function App() {
    const [tab, setTab] = useState<"palettes" | "tokens">("palettes");
    const { palettes, activePaletteId } = usePaletteStore();
    const activePalette = palettes.find((p) => p.id === activePaletteId);

    return (
        <div
            className="flex h-screen overflow-hidden"
            style={{ background: "var(--bg)" }}
        >
            <aside
                className="flex w-56 flex-col flex-shrink-0"
                style={{
                    background: "var(--bg-sunken)",
                    borderRight: "0.5px solid var(--border)",
                }}
            >
                <div
                    className="flex items-center gap-2 px-4 py-[18px]"
                    style={{ borderBottom: "0.5px solid var(--border)" }}
                >
                    <div
                        className="h-5 w-5 rounded-full flex-shrink-0"
                        style={{ background: "var(--accent)" }}
                    />
                    <span
                        className="text-base font-medium tracking-tight"
                        style={{ color: "var(--ink)" }}
                    >
                        Chroma
                    </span>
                </div>

                <div className="flex px-2 pt-2">
                    {(["palettes", "tokens"] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className="flex-1 py-1.5 text-xs capitalize rounded-t-lg transition-all"
                            style={{
                                background:
                                    tab === t ? "var(--bg)" : "transparent",
                                color:
                                    tab === t ? "var(--ink)" : "var(--ink-3)",
                                fontWeight: tab === t ? 500 : 400,
                                border:
                                    tab === t
                                        ? "0.5px solid var(--border)"
                                        : "none",
                                borderBottom:
                                    tab === t
                                        ? "0.5px solid var(--bg)"
                                        : "none",
                            }}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto">
                    {tab === "palettes" ? <PalettePanel /> : <TokenPanel />}
                </div>
            </aside>

            <main className="flex flex-1 flex-col overflow-hidden">
                <div
                    className="flex items-center justify-between px-5 py-4"
                    style={{ borderBottom: "0.5px solid var(--border)" }}
                >
                    <div>
                        <p
                            className="text-base font-medium"
                            style={{ color: "var(--ink)" }}
                        >
                            {activePalette?.name ?? "No palette selected"}
                        </p>
                        <p
                            className="text-xs"
                            style={{ color: "var(--ink-3)" }}
                        >
                            {activePalette
                                ? `${activePalette.colours.length} colour${activePalette.colours.length !== 1 ? "s" : ""}`
                                : "Create or select a palette to get started"}
                        </p>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    <div
                        className="w-56 flex-shrink-0 overflow-y-auto p-4 flex flex-col gap-3"
                        style={{ borderRight: "0.5px solid var(--border)" }}
                    >
                        <ColourPicker />
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                        {activePalette?.colours.length === 0 && (
                            <p
                                className="text-xs pt-4 text-center"
                                style={{ color: "var(--ink-4)" }}
                            >
                                Pick a colour and add it to this palette
                            </p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;
