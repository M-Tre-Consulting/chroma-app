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
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ padding: '20px 16px 12px', flexShrink: 0 }}>
        <p style={{ fontSize: '22px', fontWeight: 500, letterSpacing: '-0.3px' }}>Tokens</p>
      </div>

      {/* Groups list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px' }}>
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
              background: 'var(--bg-raised)', border: '0.5px solid var(--border)',
              borderRadius: '20px', padding: '14px', marginBottom: '10px',
            }}
          >
            {/* Group header */}
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', marginBottom: '10px',
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
                    display: 'flex', alignItems: 'center', gap: '10px',
                    background: 'var(--bg-sunken)', border: '0.5px solid var(--border)',
                    borderRadius: '12px', padding: '10px 12px',
                    marginBottom: '6px', minHeight: '48px',
                  }}
                >
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '6px',
                    background: assignedColour?.hex ?? 'var(--border)',
                    border: '0.5px solid rgba(0,0,0,0.08)', flexShrink: 0,
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
                      fontSize: '11px', padding: '6px 8px', borderRadius: '8px',
                      background: 'var(--bg-raised)', border: '0.5px solid var(--border-strong)',
                      color: 'var(--ink-2)', maxWidth: '100px', cursor: 'pointer', width: 'auto',
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
                      fontSize: '12px', cursor: 'pointer',
                      minWidth: '44px', minHeight: '44px',
                    }}
                  >
                    ✕
                  </button>
                </div>
              )
            })}

            {/* Add token */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <input
                placeholder="Token name…"
                value={newTokenNames[group.id] ?? ''}
                onChange={e => setNewTokenNames(prev => ({ ...prev, [group.id]: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleAddToken(group.id)}
                style={{ flex: 1, fontSize: '12px', padding: '8px 10px' }}
              />
              <button
                onClick={() => handleAddToken(group.id)}
                style={{
                  background: 'var(--accent-soft)', color: 'var(--accent)',
                  border: '0.5px solid var(--accent)', borderRadius: '10px',
                  padding: '0 14px', fontSize: '12px', cursor: 'pointer',
                  fontFamily: '"DM Sans", sans-serif', minHeight: '44px',
                }}
              >
                Add
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add group bar */}
      <div style={{
        padding: '12px', borderTop: '0.5px solid var(--border)',
        display: 'flex', gap: '8px', flexShrink: 0, background: 'var(--bg)',
      }}>
        <input
          placeholder="New group…"
          value={newGroupName}
          onChange={e => setNewGroupName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAddGroup()}
          style={{ flex: 1 }}
        />
        <button
          onClick={handleAddGroup}
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
