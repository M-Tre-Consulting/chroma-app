import { HexColorPicker, HexColorInput } from 'react-colorful'
import { contrastRatio, wcagLevel } from '../../../lib/colour';
import type { Palette } from '../../../types';

const wcagColors: Record<string, { bg: string; fg: string }> = {
  AAA:        { bg: '#0f3d2e', fg: '#4ade80' },
  AA:         { bg: '#1e1e4a', fg: '#a5b4fc' },
  'AA Large': { bg: '#2a2a1a', fg: '#fbbf24' },
  Fail:       { bg: '#3d1515', fg: '#f87171' },
}

interface Props {
  palette: Palette
  hex: string
  setHex: (v: string) => void
  colourName: string
  setColourName: (v: string) => void
  showPicker: boolean
  setShowPicker: (v: boolean) => void
  onAddColour: () => void
  onRemoveColour: (id: string) => void
  onBack: () => void
}

/** Full screen colour list for a single palette, with expandable picker and FAB. */
export function ColoursScreen({
  palette, hex, setHex, colourName, setColourName,
  showPicker, setShowPicker, onAddColour, onRemoveColour, onBack,
}: Props) {
  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', background: 'var(--bg)' }}>

      {/* Header */}
      <div style={{
        padding: 'max(20px, env(safe-area-inset-top)) 16px 16px', flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: '16px',
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'var(--bg-raised)', border: 'none',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            borderRadius: '16px', width: '48px', height: '48px',
            fontSize: '20px', cursor: 'pointer', color: 'var(--ink)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          ←
        </button>
        <div>
          <p style={{ fontSize: '22px', fontWeight: 400, letterSpacing: '-0.3px', color: 'var(--ink)' }}>
            {palette.name}
          </p>
          <p style={{ fontSize: '13px', color: 'var(--ink-3)', marginTop: '2px' }}>
            {palette.colours.length} colour{palette.colours.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Picker sheet - M3 Expanded Card */}
      {showPicker && (
        <div style={{
          margin: '0 16px 16px',
          background: 'var(--bg-raised)',
          border: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          borderRadius: '24px',
          padding: '16px',
          flexShrink: 0,
        }}>
          <HexColorPicker
            color={hex}
            onChange={setHex}
            style={{ width: '100%', borderRadius: '16px', overflow: 'hidden' }}
          />
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px', alignItems: 'center' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              background: hex, border: '1px solid rgba(0,0,0,0.05)', flexShrink: 0,
            }} />
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center',
              background: 'var(--bg-sunken)', border: 'none',
              borderRadius: '16px', padding: '0 16px', minHeight: '48px'
            }}>
              <span style={{ color: 'var(--ink-3)', fontSize: '14px' }}>#</span>
              <HexColorInput
                color={hex}
                onChange={setHex}
                style={{
                  background: 'transparent', border: 'none', padding: '12px 8px',
                  fontFamily: '"DM Mono", monospace', fontSize: '14px',
                  color: 'var(--ink)', textTransform: 'uppercase', width: '100%',
                  outline: 'none'
                }}
              />
            </div>
          </div>
          <input
            placeholder="Colour name (optional)"
            value={colourName}
            onChange={e => setColourName(e.target.value)}
            style={{
              marginTop: '12px', width: '100%', padding: '14px 16px',
              borderRadius: '16px', border: 'none', background: 'var(--bg-sunken)',
              color: 'var(--ink)', fontSize: '14px', outline: 'none'
            }}
          />
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button
              onClick={() => setShowPicker(false)}
              style={{
                flex: 1, background: 'var(--bg-sunken)', color: 'var(--ink-2)',
                border: 'none', borderRadius: '16px',
                padding: '14px', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                fontFamily: '"DM Sans", sans-serif', minHeight: '48px'
              }}
            >
              Cancel
            </button>
            <button
              onClick={onAddColour}
              style={{
                flex: 2, background: 'var(--accent)', color: '#fff',
                border: 'none', borderRadius: '16px', padding: '14px',
                fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                fontFamily: '"DM Sans", sans-serif', minHeight: '48px'
              }}
            >
              Add colour
            </button>
          </div>
        </div>
      )}

      {/* Colours list */}
      {/* Added bottom padding so the last item scrolls above the FAB */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 100px' }}>
        {palette.colours.length === 0 && (
          <p style={{
            textAlign: 'center', color: 'var(--ink-4)',
            fontSize: '13px', paddingTop: '48px',
          }}>
            Tap + to add a colour
          </p>
        )}
        {palette.colours.map(c => {
          const ratio = contrastRatio(c.hex, '#ffffff')
          const level = wcagLevel(ratio)
          const ws = wcagColors[level]

          return (
            <div
              key={c.id}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'var(--bg-sunken)', border: 'none', // Flat tonal
                borderRadius: '20px', padding: '12px 16px',
                marginBottom: '8px', minHeight: '72px',
              }}
            >
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: c.hex, border: '1px solid rgba(0,0,0,0.05)', flexShrink: 0,
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 500, fontSize: '14px', color: 'var(--ink)' }}>
                  {c.name || c.hex}
                </p>
                <p style={{
                  fontSize: '12px', fontFamily: '"DM Mono", monospace',
                  color: 'var(--ink-3)', marginTop: '2px',
                }}>
                  {c.hex.toUpperCase()}
                </p>
              </div>
              <span style={{
                fontSize: '11px', fontWeight: 600, padding: '4px 10px',
                borderRadius: '12px', background: ws.bg, color: ws.fg, flexShrink: 0,
              }}>
                {level}
              </span>
              <button
                onClick={() => onRemoveColour(c.id)}
                style={{
                  background: 'none', border: 'none', color: 'var(--ink-4)',
                  fontSize: '16px', cursor: 'pointer',
                  minWidth: '48px', minHeight: '48px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>
          )
        })}
      </div>

      {/* FAB - Material 3 Style */}
      {!showPicker && (
        <button
          onClick={() => setShowPicker(true)}
          style={{
            position: 'absolute', bottom: '24px', right: '24px',
            width: '64px', height: '64px', borderRadius: '20px', // M3 Large rounded rectangle
            background: 'var(--accent)', border: 'none', color: '#fff',
            fontSize: '32px', fontWeight: 300, cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)', // Darker, native-feeling shadow
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
        >
          +
        </button>
      )}
    </div>
  )
}
