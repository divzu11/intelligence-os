import { useLocation, Link } from 'react-router-dom'
import { Newspaper, TrendingUp, Archive, FileText, Settings } from 'lucide-react'
import { useState } from 'react'

const NAV = [
  { path: '/',        icon: Newspaper,  label: 'Reader',  color: 'var(--ht)' },
  { path: '/trends',  icon: TrendingUp, label: 'Trends',  color: 'var(--inv)' },
  { path: '/archive', icon: Archive,    label: 'Archive', color: 'var(--ops)' },
  { path: '/memo',    icon: FileText,   label: 'Memo',    color: 'var(--ins)' },
  { path: '/sources', icon: Settings,   label: 'Sources', color: 'var(--muted)' },
]

export default function Sidebar() {
  const { pathname } = useLocation()
  const [tooltip, setTooltip] = useState(null)

  return (
    <aside style={{
      width: 56,
      minWidth: 56,
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '12px 0',
      gap: 4,
      height: '100vh',
      position: 'relative',
      zIndex: 10,
    }}>
      {/* Wordmark */}
      <div style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.12em',
        color: 'var(--muted)',
        marginBottom: 12,
        marginTop: 4,
        textAlign: 'center',
        lineHeight: 1,
      }}>
        I<span style={{ color: 'var(--text)' }}>OS</span>
      </div>

      {NAV.map(({ path, icon: Icon, label, color }) => {
        const isActive = pathname === path
        return (
          <div key={path} style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Link
              to={path}
              onMouseEnter={() => setTooltip(path)}
              onMouseLeave={() => setTooltip(null)}
              style={{
                width: 38,
                height: 38,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
                background: isActive ? 'var(--surface2)' : 'transparent',
                border: isActive ? `1px solid var(--border2)` : '1px solid transparent',
                color: isActive ? color : 'var(--faint)',
                transition: 'all 0.15s ease',
                textDecoration: 'none',
              }}
            >
              <Icon size={18} />
            </Link>
            {tooltip === path && (
              <div style={{
                position: 'absolute',
                left: 46,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'var(--surface2)',
                border: '1px solid var(--border2)',
                color: 'var(--text)',
                fontSize: 12,
                fontWeight: 500,
                padding: '4px 8px',
                borderRadius: 4,
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                zIndex: 100,
              }}>
                {label}
              </div>
            )}
          </div>
        )
      })}
    </aside>
  )
}
