type Tab = 'palettes' | 'tokens' | 'export'

interface Props {
  tab: Tab
  onTabChange: (t: Tab) => void
}

/** True Material 3 style bottom navigation bar. */
export function BottomNav({ tab, onTabChange }: Props) {  const tabs: { id: Tab; label: string; iconPath: string }[] = [
    {
      id: 'palettes',
      label: 'Palettes',
      iconPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.53-.22-1.04-.59-1.41C13.54 17.72 13.34 17.22 13.34 16.66c0-1.1.9-2 2-2h2.25c2.76 0 5-2.24 5-5 0-4.42-4.48-8-10-8zm-6.5 9c-.83 0-1.5-.67-1.5-1.5S4.67 8 5.5 8 7 8.67 7 9.5 6.33 11 5.5 11zm3-4c-.83 0-1.5-.67-1.5-1.5S7.67 4 8.5 4 10 4.67 10 5.5 9.33 7 8.5 7zm4 0c-.83 0-1.5-.67-1.5-1.5S10.67 4 11.5 4 13 4.67 13 5.5 12.33 7 11.5 7zm3 4c-.83 0-1.5-.67-1.5-1.5S14.67 8 15.5 8 17 8.67 17 9.5 16.33 11 15.5 11z'
    },
    {
      id: 'tokens',
      label: 'Tokens',
      iconPath: 'M4 14h4v-4H4v4zm0 5h4v-4H4v4zM4 9h4V5H4v4zm5 5h12v-4H9v4zm0 5h12v-4H9v4zM9 5v4h12V5H9z'
    },
    {
      id: 'export',
      label: 'Export',
      iconPath: 'M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z'
    },
  ]

  return (
    <div style={{
      background: 'var(--bg-raised)',
      borderTop: 'none',
      boxShadow: '0 -1px 3px rgba(0,0,0,0.02)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      padding: '12px 8px calc(16px + env(safe-area-inset-bottom))',
      flexShrink: 0,
      minHeight: 'calc(80px + env(safe-area-inset-bottom))',
    }}>
      {tabs.map(t => {
        const isActive = tab === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: 'transparent',
              border: 'none',
              padding: '0',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {/* The M3 Pill Indicator */}
            <div style={{
              width: '64px',
              height: '32px',
              borderRadius: '16px',
              background: isActive ? 'var(--accent-soft)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s cubic-bezier(0.2, 0, 0, 1)',
            }}>
              {/* The Icon */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className={`transition-colors duration-200 ${
                  isActive
                    ? 'text-accent-strong dark:text-dark-ink'
                    : 'text-ink-secondary dark:text-dark-ink-secondary'
                }`}
                fill="currentColor"
              >
                <path d={t.iconPath} />
              </svg>
            </div>

            {/* The Label */}
            <span style={{
              fontSize: '12px',
              fontWeight: isActive ? 600 : 500,
              color: isActive ? 'var(--ink)' : 'var(--ink-secondary)',
              fontFamily: '"DM Sans", sans-serif',
              transition: 'color 0.2s ease',
              marginTop: '4px',
            }}>
              {t.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
