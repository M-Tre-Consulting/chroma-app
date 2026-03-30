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
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ padding: '20px 16px 12px', flexShrink: 0 }}>
        <p style={{ fontSize: '22px', fontWeight: 500, letterSpacing: '-0.3px' }}>Chroma</p>
        <p style={{ fontSize: '12px', color: 'var(--ink-3)', marginTop: '2px' }}>
          {palettes.length} palette{palettes.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px' }}>
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
              display: 'flex', alignItems: 'center', gap: '12px',
              background: 'var(--bg-raised)', border: '0.5px solid var(--border)',
              borderRadius: '16px', padding: '14px', marginBottom: '8px',
              cursor: 'pointer', minHeight: '64px',
            }}
          >
            {/* Colour preview dots */}
            <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
              {p.colours.slice(0, 4).map(c => (
                <div key={c.id} style={{
                  width: '20px', height: '20px', borderRadius: '6px',
                  background: c.hex, border: '0.5px solid rgba(0,0,0,0.1)',
                }} />
              ))}
              {p.colours.length === 0 && (
                <div style={{
                  width: '20px', height: '20px', borderRadius: '6px',
                  background: 'var(--border)',
                }} />
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 500, fontSize: '14px', color: 'var(--ink)' }}>
                {p.name}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--ink-3)', marginTop: '2px' }}>
                {p.colours.length} colour{p.colours.length !== 1 ? 's' : ''}
              </p>
            </div>

            <button
              onClick={e => { e.stopPropagation(); onRemovePalette(p.id) }}
              style={{
                background: 'none', border: 'none', color: 'var(--ink-4)',
                fontSize: '16px', cursor: 'pointer',
                minWidth: '44px', minHeight: '44px',
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Add palette bar */}
      <div style={{
        padding: '12px', borderTop: '0.5px solid var(--border)',
        display: 'flex', gap: '8px', flexShrink: 0, background: 'var(--bg)',
      }}>
        <input
          placeholder="New palette…"
          value={newPaletteName}
          onChange={e => setNewPaletteName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onAddPalette()}
          style={{ flex: 1 }}
        />
        <button
          onClick={onAddPalette}
          style={{
            background: 'var(--accent)', color: '#fff', border: 'none',
            borderRadius: '12px', padding: '0 20px', fontSize: '20px',
            cursor: 'pointer', minWidth: '48px', minHeight: '48px',
            fontFamily: '"DM Sans", sans-serif',
          }}
        >
          +
        </button>
      </div>
    </div>
  )
}
