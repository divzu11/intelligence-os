import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Sidebar from './components/Layout/Sidebar'
import BottomNav from './components/Layout/BottomNav'
import Home from './pages/Home'
import Trends from './pages/Trends'
import Archive from './pages/Archive'
import Memo from './pages/Memo'
import Sources from './pages/Sources'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

export default function App() {
  const isMobile = useIsMobile()

  return (
    <BrowserRouter>
      <div style={{
        display: 'flex',
        height: '100vh',
        background: 'var(--bg)',
        // On mobile, leave room for the bottom nav bar
        paddingBottom: isMobile ? 56 : 0,
      }}>
        {/* Sidebar — hidden on mobile */}
        {!isMobile && <Sidebar />}

        <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/trends" element={<Trends />} />
            <Route path="/archive" element={<Archive />} />
            <Route path="/memo" element={<Memo />} />
            <Route path="/sources" element={<Sources />} />
          </Routes>
        </main>

        {/* Bottom nav — mobile only */}
        {isMobile && <BottomNav />}
      </div>
    </BrowserRouter>
  )
}
