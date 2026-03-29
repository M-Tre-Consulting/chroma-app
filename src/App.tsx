import { useState } from "react";
import { ColourPicker } from "./components/picker/ColourPicker";
import { PalettePanel } from "./components/palette/PalettePanel";
import { TokenPanel } from "./components/tokens/TokenPanel";
import { usePaletteStore } from "./store/paletteStore";
import { ColourCard } from "./components/palette/ColourCard";

function App() {
    const [tab, setTab] = useState<"palettes" | "tokens">("palettes");
    const { palettes, activePaletteId } = usePaletteStore();
    const activePalette = palettes.find((p) => p.id === activePaletteId);

    return (
        <div
            className="flex h-screen overflow-hidden"
            style={{ background: "var(--bg)" }}
        >
            {/* Sidebar */}
            <aside
                className="flex w-56 flex-col shrink-0"
                style={{
                    background: "var(--bg-sunken)",
                    borderRight: "0.5px solid var(--border)",
                }}
            >
                {/* Logo */}
                <div
                    className="flex items-center gap-3 px-4 shrink-0"
                    style={{
                        borderBottom: "0.5px solid var(--border)",
                        minHeight: "72px",
                    }}
                >
                    <div
                        className="h-7 w-7 rounded-full shrink-0"
                        style={{ background: "var(--accent)" }}
                    />
                    <span
                        className="font-medium tracking-tight"
                        style={{ color: "var(--ink)", fontSize: "15px" }}
                    >
                        Chroma
                    </span>
                </div>

                {/* Tab switcher */}
                <div className="px-2 py-1.5">
                    <div
                        className="relative flex p-1 rounded-xl"
                        style={{ background: "rgba(124, 111, 247, 0.1)" }}
                    >
                        {/* Sliding pill background */}
                        <div
                            className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg transition-transform duration-200 ease-in-out"
                            style={{
                                background: "var(--accent)",
                                transform:
                                    tab === "palettes"
                                        ? "translateX(4px)"
                                        : "translateX(calc(100% + 4px))",
                            }}
                        />
                        {(["palettes", "tokens"] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className="relative flex-1 py-1.5 text-xs capitalize rounded-lg z-10 transition-colors duration-200"
                                style={{
                                    background: "transparent",
                                    color:
                                        tab === t ? "#ffffff" : "var(--accent)",
                                    fontWeight: tab === t ? 500 : 400,
                                    border: "none",
                                    cursor: "pointer",
                                }}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Panel content */}
                <div className="flex-1 overflow-y-auto">
                    {tab === "palettes" ? <PalettePanel /> : <TokenPanel />}
                </div>
            </aside>

            {/* Main area */}
            <main className="flex flex-1 flex-col overflow-hidden">
                {/* Header bar */}
                <div
                    className="flex items-center justify-between px-5 shrink-0"
                    style={{
                        borderBottom: "0.5px solid var(--border)",
                        minHeight: "72px",
                    }}
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

                {/* Body: picker + colour list */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Colour picker column */}
                    <div
                        className="w-56 shrink-0 overflow-y-auto p-4 flex flex-col gap-3"
                        style={{ borderRight: "0.5px solid var(--border)" }}
                    >
                        <ColourPicker />
                    </div>

                    {/* Colour cards column */}
                    <div
                        className="flex-1 p-4 flex flex-col gap-2"
                        style={{ overflowY: "auto", minHeight: 0 }}
                    >
                        {/* Empty: no palette */}
                        {!activePalette && (
                            <p
                                className="text-xs pt-8 text-center"
                                style={{ color: "var(--ink-4)" }}
                            >
                                Create or select a palette to get started
                            </p>
                        )}

                        {/* Empty: no colours */}
                        {activePalette?.colours.length === 0 && (
                            <p
                                className="text-xs pt-4 text-center"
                                style={{ color: "var(--ink-4)" }}
                            >
                                Pick a colour and add it to this palette
                            </p>
                        )}

                        {/* Colour cards */}
                        {activePalette?.colours.map((c) => (
                            <ColourCard
                                key={c.id}
                                colour={c}
                                paletteId={activePalette.id}
                            />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;
