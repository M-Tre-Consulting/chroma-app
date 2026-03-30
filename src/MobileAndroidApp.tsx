import { useState } from 'react'
import { usePaletteStore } from './store/paletteStore'
import { BottomNav } from './components/mobile/android/BottomNav'
import { PaletteListScreen } from './components/mobile/android/PaletteListScreen'
import { ColoursScreen } from './components/mobile/android/ColoursScreen'
import { TokensScreen } from './components/mobile/android/TokensScreen'
import { ExportPanel } from './components/export/ExportPanel'

type Tab = 'palettes' | 'tokens' | 'export'
type PaletteView = 'list' | 'colours'

/** Root component for the Android mobile layout. */
export function MobileAndroidApp() {
  const [tab, setTab] = useState<Tab>('palettes')
  const [paletteView, setPaletteView] = useState<PaletteView>('list')
  const [hex, setHex] = useState('#9d93f9')
  const [colourName, setColourName] = useState('')
  const [newPaletteName, setNewPaletteName] = useState('')
  const [showPicker, setShowPicker] = useState(false)

  const {
    palettes,
    activePaletteId,
    addPalette,
    removePalette,
    setActivePalette,
    addColour,
    removeColour,
  } = usePaletteStore()

  const activePalette = palettes.find(p => p.id === activePaletteId)

  const handleAddPalette = () => {
    if (!newPaletteName.trim()) return
    addPalette(newPaletteName.trim())
    setNewPaletteName('')
  }

  const handleAddColour = () => {
    if (!activePaletteId) return
    addColour(activePaletteId, hex, colourName || undefined)
    setColourName('')
    setShowPicker(false)
  }

  const handleSelectPalette = (id: string) => {
    setActivePalette(id)
    setPaletteView('colours')
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100dvh',
      background: 'var(--bg)',
      color: 'var(--ink)',
      fontFamily: '"DM Sans", sans-serif',
      overflow: 'hidden',
      position: 'relative',
      paddingTop: 'env(safe-area-inset-top, 0px)',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    }}>

      {/* Screen content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

        {/* Palettes — list view */}
        {tab === 'palettes' && paletteView === 'list' && (
          <PaletteListScreen
            palettes={palettes}
            newPaletteName={newPaletteName}
            setNewPaletteName={setNewPaletteName}
            onAddPalette={handleAddPalette}
            onSelectPalette={handleSelectPalette}
            onRemovePalette={removePalette}
          />
        )}

        {/* Palettes — colours drill-down */}
        {tab === 'palettes' && paletteView === 'colours' && activePalette && (
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
            onBack={() => setPaletteView('list')}
          />
        )}

        {/* Tokens */}
        {tab === 'tokens' && <TokensScreen />}

        {/* Export */}
        {tab === 'export' && (
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 16px 8px', flexShrink: 0 }}>
              <p style={{ fontSize: '22px', fontWeight: 500, letterSpacing: '-0.3px' }}>Export</p>
            </div>
            <ExportPanel />
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <BottomNav
        tab={tab}
        onTabChange={(t) => { setTab(t); setPaletteView('list') }}
      />
    </div>
  )
}
