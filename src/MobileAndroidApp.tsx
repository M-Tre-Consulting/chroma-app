import { useState, useEffect } from "react";
import { usePaletteStore } from "./store/paletteStore";
import { BottomNav } from "./components/mobile/android/BottomNav";
import { PaletteListScreen } from "./components/mobile/android/PaletteListScreen";
import { ColoursScreen } from "./components/mobile/android/ColoursScreen";
import { TokensScreen } from "./components/mobile/android/TokensScreen";
import { ExportScreen } from "./components/mobile/android/ExportScreen";

type Tab = "palettes" | "tokens" | "export";
type PaletteView = "list" | "colours";

/** Root component for the Android mobile layout. */
export function MobileAndroidApp() {
  const [splashState, setSplashState] = useState<
    "visible" | "fading" | "hidden"
  >("visible");

  const [tab, setTab] = useState<Tab>("palettes");
  const [paletteView, setPaletteView] = useState<PaletteView>("list");
  const [hex, setHex] = useState("#9d93f9");
  const [colourName, setColourName] = useState("");
  const [newPaletteName, setNewPaletteName] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  const {
    palettes,
    activePaletteId,
    addPalette,
    removePalette,
    setActivePalette,
    addColour,
    removeColour,
  } = usePaletteStore();

  const activePalette = palettes.find((p) => p.id === activePaletteId);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setSplashState("fading"), 1500);
    const removeTimer = setTimeout(() => setSplashState("hidden"), 2100);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  // Material 3 colour injection
  useEffect(() => {
    // @ts-ignore - AndroidTheme is injected natively by Kotlin
    if (window.AndroidTheme) {
      try {
        // @ts-ignore
        const accent = window.AndroidTheme.getSystemAccentColor();
        // @ts-ignore
        const accentSoft = window.AndroidTheme.getSystemAccentSoftColor();
        // @ts-ignore
        const accentStrong = window.AndroidTheme.getSystemAccentStrongColor();

        if (accent) {
          const root = document.documentElement;
          // Override your CSS variables with the user's wallpaper colors
          root.style.setProperty("--accent", accent);
          root.style.setProperty("--accent-soft", accentSoft);
          root.style.setProperty("--accent-strong", accentStrong);
        }
      } catch (e) {
        console.error("Failed to load Material You colors", e);
      }
    }
  }, []);

  const handleAddPalette = () => {
    if (!newPaletteName.trim()) return;
    addPalette(newPaletteName.trim());
    setNewPaletteName("");
  };

  const handleAddColour = () => {
    if (!activePaletteId) return;
    addColour(activePaletteId, hex, colourName || undefined);
    setColourName("");
    setShowPicker(false);
  };

  const handleSelectPalette = (id: string) => {
    setActivePalette(id);
    setPaletteView("colours");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        background: "var(--bg)",
        color: "var(--ink)",
        fontFamily: '"DM Sans", sans-serif',
        overflow: "hidden",
        position: "relative",
      }}
    >
      {splashState !== "hidden" && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "var(--bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: splashState === "visible" ? 1 : 0,
            pointerEvents: splashState === "visible" ? "auto" : "none",
            transition: "opacity 0.6s cubic-bezier(0.2, 0, 0, 1)",
          }}
        >
          <h1
            style={{
              fontSize: "44px",
              fontWeight: 300,
              letterSpacing: "-1.5px",
              color: "var(--accent)",
              margin: 0,
              transform: splashState === "visible" ? "scale(1)" : "scale(0.95)",
              transition: "transform 0.6s cubic-bezier(0.2, 0, 0, 1)",
            }}
          >
            Chroma
          </h1>
        </div>
      )}

      {/* Screen content */}
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {tab === "palettes" && paletteView === "list" && (
          <PaletteListScreen
            palettes={palettes}
            newPaletteName={newPaletteName}
            setNewPaletteName={setNewPaletteName}
            onAddPalette={handleAddPalette}
            onSelectPalette={handleSelectPalette}
            onRemovePalette={removePalette}
          />
        )}

        {tab === "palettes" && paletteView === "colours" && activePalette && (
          <ColoursScreen
            palette={activePalette}
            hex={hex}
            setHex={setHex}
            colourName={colourName}
            setColourName={setColourName}
            showPicker={showPicker}
            setShowPicker={setShowPicker}
            onAddColour={handleAddColour}
            onRemoveColour={(cid) => removeColour(activePalette.id, cid)}
            onBack={() => setPaletteView("list")}
          />
        )}

        {tab === "tokens" && <TokensScreen />}
        {tab === "export" && <ExportScreen />}
      </div>

      <BottomNav
        tab={tab}
        onTabChange={(t) => {
          setTab(t);
          setPaletteView("list");
        }}
      />
    </div>
  );
}
