type Tab = 'palettes' | 'tokens' | 'export'

interface Props {
  tab: Tab
  onTabChange: (t: Tab) => void
}

/** Material 3 style bottom navigation bar. */
export function BottomNav({ tab, onTabChange }: Props) {
  const tabs: { id: Tab; label: string }[] = [
    { id: 'palettes', label: 'Palettes' },
    { id: 'tokens',   label: 'Tokens'   },
    { id: 'export',   label: 'Export'   },
  ]

  return (
    <div style={{
      height: '64px',
      background: 'var(--bg-raised)',
      borderTop: '0.5px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      padding: '0 8px',
      flexShrink: 0,
    }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onTabChange(t.id)}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            background: tab === t.id ? 'rgba(157,147,249,0.12)' : 'transparent',
            border: 'none',
            borderRadius: '16px',
            padding: '8px 0',
            cursor: 'pointer',
            minHeight: '48px',
          }}
        >
          <div style={{
            width: '24px',
            height: '4px',
            borderRadius: '2px',
            background: tab === t.id ? 'var(--accent)' : 'var(--border)',
            transition: 'background 0.2s ease',
          }} />
          <span style={{
            fontSize: '11px',
            fontWeight: tab === t.id ? 500 : 400,
            color: tab === t.id ? 'var(--accent)' : 'var(--ink-3)',
            fontFamily: '"DM Sans", sans-serif',
            transition: 'color 0.2s ease',
          }}>
            {t.label}
          </span>
        </button>
      ))}
    </div>
  )
}
