import { useState } from "react";
import { ColourPicker } from "./components/picker/ColourPicker";
import { PalettePanel } from "./components/palette/PalettePanel";
import { TokenPanel } from "./components/tokens/TokenPanel";

function App() {
    const [tab, setTab] = useState<"palettes" | "tokens">("palettes");

    return (
        <>
            <div className="flex h-screen bg-white">
                <aside className="flex w-64 flex-col border-r border-gray-100">
                    <div className="border-b border-gray-100 px-4 py-3">
                        <h1 className="text-sm font-medium tracking-wide text-gray-800">
                            Chroma
                        </h1>
                    </div>
                    <div className="flex border-b border-gray-100">
                        {(["palettes", "tokens"] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className={`flex-1 py-2 text-xs capitalize transition-colors ${
                                    tab === t
                                        ? "border-b-2 border-blue-500 text-blue-600"
                                        : "text-gray-400 hover:text-gray-600"
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {tab === "palettes" ? <PalettePanel /> : <TokenPanel />}
                    </div>
                </aside>

                <main className="flex flex-1 items-start justify-center p-8">
                    <div className="w-72">
                        <ColourPicker />
                    </div>
                </main>
            </div>
        </>
    );
}

export default App;
