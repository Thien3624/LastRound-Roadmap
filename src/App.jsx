import { useState } from 'react'
import RoadmapFinal    from './components/RoadmapFinal'
import TransitionV2    from './components/TransitionV2'
import TransitionFinal from './components/TransitionFinal'

const PAGES = [
  {
    key: 'roadmap',
    label: '8-Week Roadmap',
    sub: 'AWS SAA · Projects · LC · Thesis',
    color: '#FF6B35',
    component: RoadmapFinal,
  },
  {
    key: 'transition-v2',
    label: 'Transition Brief V2',
    sub: 'Post-internship schedule',
    color: '#81B29A',
    component: TransitionV2,
  },
  {
    key: 'transition-final',
    label: 'Transition Final',
    sub: 'Full tracker + Buffer protocol',
    color: '#E07A5F',
    component: TransitionFinal,
  },
]

export default function App() {
  const [active, setActive] = useState('roadmap')
  const [menuOpen, setMenuOpen] = useState(false)

  const current = PAGES.find(p => p.key === active)
  const Component = current.component

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080808',
      fontFamily: "'IBM Plex Mono', monospace",
    }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; background: #111; }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }
        .nav-btn { transition: all 0.15s; cursor: pointer; border: none; font-family: inherit; }
        .nav-btn:hover { opacity: 0.8; }
        .page-card { transition: all 0.15s; cursor: pointer; }
        .page-card:hover { border-color: rgba(255,255,255,0.15) !important; }
      `}</style>

      {/* ── TOP NAV ── */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: '#080808',
        borderBottom: '1px solid #161616',
        padding: '0 22px',
        display: 'flex',
        alignItems: 'center',
        height: 48,
        gap: 8,
      }}>
        {/* Logo / title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 16 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: current.color,
            boxShadow: `0 0 6px ${current.color}60`,
          }} />
          <span style={{ fontSize: 10, color: '#888', letterSpacing: 2, fontWeight: 700 }}>
            DEVOPS ROADMAP · THIỆN
          </span>
        </div>

        {/* Desktop tabs */}
        <div style={{ display: 'flex', gap: 2, flex: 1 }}>
          {PAGES.map(p => (
            <button
              key={p.key}
              className="nav-btn"
              onClick={() => { setActive(p.key); setMenuOpen(false) }}
              style={{
                background: active === p.key ? `${p.color}15` : 'transparent',
                color: active === p.key ? p.color : '#444',
                border: active === p.key ? `1px solid ${p.color}30` : '1px solid transparent',
                borderRadius: 3,
                padding: '5px 12px',
                fontSize: 9,
                letterSpacing: 0.5,
                fontWeight: active === p.key ? 700 : 400,
              }}>
              {p.label}
            </button>
          ))}
        </div>

        {/* Breadcrumb sub-label */}
        <div style={{ fontSize: 8, color: '#333', letterSpacing: 1, marginLeft: 'auto' }}>
          {current.sub}
        </div>
      </nav>

      {/* ── PAGE CONTENT ── */}
      <main>
        <Component />
      </main>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: '1px solid #0f0f0f',
        padding: '10px 22px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#050505',
      }}>
        <div style={{ fontSize: 8, color: '#222', letterSpacing: 2 }}>
          THIỆN · 2025 · DEVOPS ROADMAP
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          {PAGES.map(p => (
            <button
              key={p.key}
              className="nav-btn"
              onClick={() => setActive(p.key)}
              style={{
                background: 'transparent',
                border: 'none',
                color: active === p.key ? p.color : '#2a2a2a',
                fontSize: 8,
                letterSpacing: 1,
              }}>
              {p.label}
            </button>
          ))}
        </div>
      </footer>
    </div>
  )
}
