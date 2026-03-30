import { useState } from 'react'
import { useTokenStore } from '../../../store/tokenStore'
import { usePaletteStore } from '../../../store/paletteStore'

/** Full screen token group manager for mobile. */
export function TokensScreen() {
  const { groups, addGroup, removeGroup, addToken, removeToken, assignColour } = useTokenStore()
  const { palettes } = usePaletteStore()
  const [newGroupName, setNewGroupName] = useState('')
  const [newTokenNames, setNewTokenNames] = useState<Record<string, string>>({})

  const handleAddGroup = () => {
    if (!newGroupName.trim()) return
    addGroup(newGroupName.trim())
    setNewGroupName('')
  }

  const handleAddToken = (groupId: string) => {
    const name = newTokenNames[groupId]?.trim()
    if (!name) return
    addToken(groupId, name)
    setNewTokenNames(prev => ({ ...prev, [groupId]: '' }))
  }

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>

      {/* Header - M3 Center Aligned with Safe Area */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'max(20px, env(safe-area-inset-top)) 16px 16px', flexShrink: 0
      }}>
        <p style={{ fontSize: '22px', fontWeight: 400, letterSpacing: '-0.3px', color: 'var(--ink)' }}>Tokens</p>
      </div>

      {/* Groups list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
        {groups.length === 0 && (
          <p style={{
            textAlign: 'center', color: 'var(--ink-4)',
            fontSize: '13px', paddingTop: '48px',
          }}>
            Add a group to start mapping tokens
          </p>
        )}
        {groups.map(group => (
          <div
            key={group.id}
            style={{
              background: 'var(--bg-raised)',
              border: 'none',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              borderRadius: '24px',
              padding: '16px',
              marginBottom: '16px',
            }}
          >
            {/* Group header */}
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', marginBottom: '16px',
            }}>
              <p style={{
                fontSize: '11px', fontWeight: 500, letterSpacing: '0.06em',
                color: 'var(--ink-4)', textTransform: 'uppercase',
              }}>
                {group.name}
              </p>
              <button
                onClick={() => removeGroup(group.id)}
                style={{
                  background: 'none', border: 'none', color: 'var(--ink-4)',
                  fontSize: '12px', cursor: 'pointer',
                  minHeight: '44px', minWidth: '44px',
                }}
              >
                Remove
              </button>
            </div>

            {/* Tokens */}
            {group.tokens.map(token => {
              const assignedPalette = palettes.find(p => p.id === token.value.paletteId)
              const assignedColour = assignedPalette?.colours.find(c => c.id === token.value.colourId)

              return (
                <div
                  key={token.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    background: 'var(--bg-sunken)',
                    border: 'none', // Soft inner containers
                    borderRadius: '16px', padding: '8px 12px',
                    marginBottom: '8px', minHeight: '56px',
                  }}
                >
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: assignedColour?.hex ?? 'transparent',
                    border: '1px solid rgba(0,0,0,0.08)', flexShrink: 0,
                  }} />
                  <span style={{
                    flex: 1, fontSize: '12px',
                    fontFamily: '"DM Mono", monospace', color: 'var(--ink-2)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {token.name}
                  </span>
                  <select
                    value={token.value.colourId
                      ? `${token.value.paletteId}::${token.value.colourId}`
                      : ''}
                    onChange={e => {
                      const [paletteId, colourId] = e.target.value.split('::')
                      assignColour(group.id, token.id, paletteId, colourId)
                    }}
                    style={{
                      fontSize: '12px', padding: '8px 12px', borderRadius: '12px',
                      background: 'var(--bg)', border: 'none',
                      color: 'var(--ink-2)', maxWidth: '110px', cursor: 'pointer', width: 'auto',
                      outline: 'none'
                    }}
                  >
                    <option value="">— none —</option>
                    {palettes.map(p => (
                      <optgroup key={p.id} label={p.name}>
                        {p.colours.map(c => (
                          <option key={c.id} value={`${p.id}::${c.id}`}>
                            {c.name || c.hex}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <button
                    onClick={() => removeToken(group.id, token.id)}
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

            {/* Add token */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <input
                placeholder="Token name…"
                value={newTokenNames[group.id] ?? ''}
                onChange={e => setNewTokenNames(prev => ({ ...prev, [group.id]: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleAddToken(group.id)}
                style={{
                  flex: 1, fontSize: '13px', padding: '12px 16px',
                  borderRadius: '16px', border: 'none', background: 'var(--bg-sunken)',
                  color: 'var(--ink-2)', outline: 'none'
                }}
              />
              <button
                onClick={() => handleAddToken(group.id)}
                style={{
                  background: 'var(--accent-soft)', color: 'var(--accent)',
                  border: 'none', borderRadius: '16px',
                  padding: '0 20px', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                  fontFamily: '"DM Sans", sans-serif', minHeight: '48px',
                }}
              >
                Add
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add group bar - M3 Tonal Bottom Bar */}
      <div style={{
        padding: '12px 16px calc(16px + env(safe-area-inset-bottom))',
        borderTop: 'none',
        boxShadow: '0 -1px 4px rgba(0,0,0,0.03)',
        display: 'flex', gap: '12px', flexShrink: 0, background: 'var(--bg-raised)',
      }}>
        <input
          placeholder="New group…"
          value={newGroupName}
          onChange={e => setNewGroupName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAddGroup()}
          style={{
            flex: 1, fontSize: '14px', padding: '12px 16px',
            borderRadius: '24px', border: 'none', background: 'var(--bg-sunken)',
            color: 'var(--ink-2)', outline: 'none'
          }}
        />
        <button
          onClick={handleAddGroup}
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
