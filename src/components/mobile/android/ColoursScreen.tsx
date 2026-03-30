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
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>

      {/* Header */}
      <div style={{
        padding: '20px 16px 12px', flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'var(--bg-raised)', border: '0.5px solid var(--border)',
            borderRadius: '12px', width: '40px', height: '40px',
            fontSize: '18px', cursor: 'pointer', color: 'var(--ink)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          ←
        </button>
        <div>
          <p style={{ fontSize: '20px', fontWeight: 500, letterSpacing: '-0.3px' }}>
            {palette.name}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--ink-3)' }}>
            {palette.colours.length} colour{palette.colours.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Picker sheet */}
      {showPicker && (
        <div style={{
          margin: '0 12px 10px',
          background: 'var(--bg-raised)',
          border: '0.5px solid var(--border)',
          borderRadius: '20px',
          padding: '14px',
          flexShrink: 0,
        }}>
          <HexColorPicker
            color={hex}
            onChange={setHex}
            style={{ width: '100%', borderRadius: '12px', overflow: 'hidden' }}
          />
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px', alignItems: 'center' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: hex, border: '0.5px solid var(--border)', flexShrink: 0,
            }} />
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center',
              background: 'var(--bg-sunken)', border: '0.5px solid var(--border)',
              borderRadius: '10px', padding: '0 10px',
            }}>
              <span style={{ color: 'var(--ink-3)', fontSize: '12px' }}>#</span>
              <HexColorInput
                color={hex}
                onChange={setHex}
                style={{
                  background: 'transparent', border: 'none', padding: '8px',
                  fontFamily: '"DM Mono", monospace', fontSize: '12px',
                  color: 'var(--ink)', textTransform: 'uppercase', width: '100%',
                }}
              />
            </div>
          </div>
          <input
            placeholder="Colour name (optional)"
            value={colourName}
            onChange={e => setColourName(e.target.value)}
            style={{ marginTop: '8px' }}
          />
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button
              onClick={() => setShowPicker(false)}
              style={{
                flex: 1, background: 'var(--bg-sunken)', color: 'var(--ink-3)',
                border: '0.5px solid var(--border)', borderRadius: '14px',
                padding: '13px', fontSize: '14px', cursor: 'pointer',
                fontFamily: '"DM Sans", sans-serif',
              }}
            >
              Cancel
            </button>
            <button
              onClick={onAddColour}
              style={{
                flex: 2, background: 'var(--accent)', color: '#fff',
                border: 'none', borderRadius: '14px', padding: '13px',
                fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                fontFamily: '"DM Sans", sans-serif',
              }}
            >
              Add colour
            </button>
          </div>
        </div>
      )}

      {/* Colours list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px' }}>
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
                background: 'var(--bg-raised)', border: '0.5px solid var(--border)',
                borderRadius: '16px', padding: '12px 14px',
                marginBottom: '8px', minHeight: '64px',
              }}
            >
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: c.hex, border: '0.5px solid rgba(0,0,0,0.08)', flexShrink: 0,
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 500, fontSize: '13px', color: 'var(--ink)' }}>
                  {c.name || c.hex}
                </p>
                <p style={{
                  fontSize: '11px', fontFamily: '"DM Mono", monospace',
                  color: 'var(--ink-3)', marginTop: '2px',
                }}>
                  {c.hex.toUpperCase()}
                </p>
              </div>
              <span style={{
                fontSize: '10px', fontWeight: 500, padding: '3px 8px',
                borderRadius: '20px', background: ws.bg, color: ws.fg, flexShrink: 0,
              }}>
                {level}
              </span>
              <button
                onClick={() => onRemoveColour(c.id)}
                style={{
                  background: 'none', border: 'none', color: 'var(--ink-4)',
                  fontSize: '14px', cursor: 'pointer',
                  minWidth: '44px', minHeight: '44px',
                }}
              >
                ✕
              </button>
            </div>
          )
        })}
      </div>

      {/* FAB */}
      {!showPicker && (
        <button
          onClick={() => setShowPicker(true)}
          style={{
            position: 'absolute', bottom: '12px', right: '16px',
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'var(--accent)', border: 'none', color: '#fff',
            fontSize: '28px', cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(157,147,249,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          +
        </button>
      )}
    </div>
  )
}
