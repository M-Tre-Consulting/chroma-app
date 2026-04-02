import type { Palette } from "../../../types"

interface Props {
  palettes: Palette[]
  newPaletteName: string
  setNewPaletteName: (v: string) => void
  onAddPalette: () => void
  onSelectPalette: (id: string) => void
  onRemovePalette: (id: string) => void
}

/** Full screen palette list with add palette bar at the bottom. */
export function PaletteListScreen({
  palettes,
  newPaletteName,
  setNewPaletteName,
  onAddPalette,
  onSelectPalette,
  onRemovePalette,
}: Props) {
  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>

      {/* Header - M3 Center Aligned with Safe Area */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 'max(20px, env(safe-area-inset-top)) 16px 16px', flexShrink: 0
      }}>
        <p style={{ fontSize: '22px', fontWeight: 400, letterSpacing: '-0.3px', color: 'var(--ink)' }}>Palettes</p>
        <p style={{ fontSize: '13px', color: 'var(--ink-3)', marginTop: '4px' }}>
          {palettes.length} palette{palettes.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
        {palettes.length === 0 && (
          <p style={{
            textAlign: 'center', color: 'var(--ink-4)',
            fontSize: '13px', paddingTop: '48px',
          }}>
            Create your first palette below
          </p>
        )}
        {palettes.map(p => (
          <div
            key={p.id}
            onClick={() => onSelectPalette(p.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              background: 'var(--bg-raised)',
              border: 'none',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)', // Soft M3 elevation
              borderRadius: '24px', padding: '16px', marginBottom: '12px',
              cursor: 'pointer', minHeight: '72px',
            }}
          >
            {/* Colour preview dots */}
            <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
              {p.colours.slice(0, 4).map(c => (
                <div key={c.id} style={{
                  width: '24px', height: '24px', borderRadius: '50%', // M3 Circular swatches
                  background: c.hex, border: '1px solid rgba(0,0,0,0.05)',
                }} />
              ))}
              {p.colours.length === 0 && (
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: 'var(--bg-sunken)', border: '1px solid rgba(0,0,0,0.05)'
                }} />
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 500, fontSize: '15px', color: 'var(--ink)' }}>
                {p.name}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--ink-3)', marginTop: '2px' }}>
                {p.colours.length} colour{p.colours.length !== 1 ? 's' : ''}
              </p>
            </div>

            <button
              onClick={e => { e.stopPropagation(); onRemovePalette(p.id) }}
              style={{
                background: 'none', border: 'none', color: 'var(--ink-4)',
                fontSize: '16px', cursor: 'pointer',
                minWidth: '48px', minHeight: '48px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Add palette bar - M3 Tonal Bottom Bar */}
      <div style={{
        padding: '12px 16px calc(16px + env(safe-area-inset-bottom))',
        borderTop: 'none',
        boxShadow: '0 -1px 4px rgba(0,0,0,0.03)',
        display: 'flex', gap: '12px', flexShrink: 0, background: 'var(--bg-raised)',
      }}>
        <input
          placeholder="New palette…"
          value={newPaletteName}
          onChange={e => setNewPaletteName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onAddPalette()}
          style={{
            flex: 1, fontSize: '14px', padding: '12px 16px',
            borderRadius: '24px', border: 'none', background: 'var(--bg-sunken)',
            color: 'var(--ink-2)', outline: 'none'
          }}
        />
        <button
          onClick={onAddPalette}
          style={{
            background: 'var(--accent)', color: '#fff', border: 'none',
            borderRadius: '16px', padding: '0 24px', fontSize: '24px', fontWeight: 300,
            cursor: 'pointer', minWidth: '56px', minHeight: '48px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          +
        </button>
      </div>
    </div>
  )
}
