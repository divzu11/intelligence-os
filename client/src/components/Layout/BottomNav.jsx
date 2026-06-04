import { useLocation, Link } from 'react-router-dom'
import { Newspaper, TrendingUp, Archive, FileText, Settings } from 'lucide-react'

const NAV = [
  { path: '/',        icon: Newspaper,  label: 'Reader',  color: 'var(--ht)' },
  { path: '/trends',  icon: TrendingUp, label: 'Trends',  color: 'var(--inv)' },
  { path: '/archive', icon: Archive,    label: 'Archive', color: 'var(--ops)' },
  { path: '/memo',    icon: FileText,   label: 'Memo',    color: 'var(--ins)' },
  { path: '/sources', icon: Settings,   label: 'Sources', color: 'var(--muted)' },
]

export default function BottomNav() {
  const { pathname } = useLocation()

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      height: 56,
      background: 'var(--surface)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      zIndex: 50,
    }}>
      {NAV.map(({ path, icon: Icon, label, color }) => {
        const isActive = pathname === path
        return (
          <Link
            key={path}
            to={path}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              textDecoration: 'none',
              color: isActive ? color : 'var(--faint)',
              padding: '6px 12px',
              borderRadius: 8,
              transition: 'color 0.15s',
            }}
          >
            <Icon size={20} />
            <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.04em' }}>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
