import { ColourPicker } from "./components/picker/ColourPicker";
import { PalettePanel } from "./components/palette/PalettePanel";

function App() {
    return (
        <div className="flex h-screen bg-white">
            <aside className="w-64 border-r border-gray-100">
                <div className="border-b border-gray-100 px-4 py-3">
                    <h1 className="text-sm font-medium tracking-wide text-gray-800">
                        Iride
                    </h1>
                </div>
                <PalettePanel />
            </aside>

            <main className="flex flex-1 items-start justify-center p-8">
                <div className="w-72">
                    <ColourPicker />
                </div>
            </main>
        </div>
    );
}

export default App;
