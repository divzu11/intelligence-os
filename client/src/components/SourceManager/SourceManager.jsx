import { useState, useEffect } from 'react'
import { getSources, addSource, toggleSource, deleteSource, runIngest } from '../../lib/api'
import { Plus, Trash2, RefreshCw, CheckCircle } from 'lucide-react'

const SECTIONS = ['healthtech', 'investing', 'operations', 'insurance']
const GEOS = ['US', 'India', 'Global']

function HealthDot({ score }) {
  const color = score > 80 ? 'var(--ht)' : score > 40 ? 'var(--inv)' : 'var(--warn)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
      <span style={{ fontSize: 12, color }}>{score ?? '—'}</span>
    </div>
  )
}

const EMPTY_FORM = { name: '', url: '', type: 'rss', section: 'healthtech', geo: 'US' }

export default function SourceManager() {
  const [sources, setSources] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY_FORM)
  const [adding, setAdding] = useState(false)
  const [ingesting, setIngesting] = useState(false)
  const [toast, setToast] = useState(null) // { msg, type: 'ok'|'err' }
  const [error, setError] = useState(null)

  const showToast = (msg, type = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const load = () => {
    setLoading(true)
    getSources()
      .then(data => { setSources(data); setLoading(false) })
      .catch(err => { setError(err.message); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.url || !form.name) return
    setAdding(true)
    try {
      await addSource(form)
      setForm(EMPTY_FORM)
      load()
      showToast('Source added successfully')
    } catch (err) {
      showToast(err.message, 'err')
      setError(err.message)
    } finally {
      setAdding(false)
    }
  }

  const handleIngest = async () => {
    setIngesting(true)
    try {
      await runIngest()
      showToast('Ingest started — new articles will appear shortly')
    } catch (err) {
      showToast('Ingest failed: ' + err.message, 'err')
    } finally {
      setIngesting(false)
      // Reload sources after a short delay to see updated health/last_fetched
      setTimeout(load, 4000)
    }
  }

  const handleToggle = async (id, active) => {
    try {
      await toggleSource(id, !active)
      setSources(prev => prev.map(s => s.id === id ? { ...s, active: !active } : s))
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteSource(id)
      setSources(prev => prev.filter(s => s.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '24px' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 999,
          display: 'flex', alignItems: 'center', gap: 8,
          background: toast.type === 'ok' ? 'var(--ht-d)' : 'var(--warn-d)',
          border: `1px solid ${toast.type === 'ok' ? 'var(--ht)' : 'var(--warn)'}`,
          color: toast.type === 'ok' ? 'var(--ht)' : 'var(--warn)',
          borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 500,
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          animation: 'fadeIn 0.2s ease',
        }}>
          {toast.type === 'ok' ? <CheckCircle size={14} /> : null}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', fontFamily: '"Playfair Display", serif', marginBottom: 4 }}>
            Source Manager
          </h1>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>
            {sources.filter(s => s.active !== false).length} active · {sources.length} total
          </p>
        </div>
        <button
          onClick={handleIngest}
          disabled={ingesting}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 6,
            border: '1px solid var(--border2)',
            background: 'var(--surface2)',
            color: 'var(--text)', fontSize: 13, fontWeight: 500,
            cursor: ingesting ? 'not-allowed' : 'pointer',
            opacity: ingesting ? 0.6 : 1, flexShrink: 0,
          }}
        >
          <RefreshCw size={13} style={{ animation: ingesting ? 'spin 1s linear infinite' : 'none' }} />
          {ingesting ? 'Fetching…' : 'Fetch now'}
        </button>
      </div>

      {error && (
        <div style={{
          background: 'var(--warn-d)', border: '1px solid var(--warn)',
          borderRadius: 6, padding: '10px 14px', fontSize: 13, color: 'var(--warn)', marginBottom: 16,
        }}>
          {error}
        </div>
      )}

      {/* Add Source Form */}
      <form onSubmit={handleAdd} style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 10, padding: 20, marginBottom: 24,
      }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
          Add Source
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          <input
            placeholder="Source name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            style={inputStyle}
            required
          />
          <input
            placeholder="RSS feed URL"
            value={form.url}
            onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
            style={inputStyle}
            required
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: 10, alignItems: 'center' }}>
          <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={inputStyle}>
            <option value="rss">RSS</option>
            <option value="atom">Atom</option>
          </select>
          <select value={form.section} onChange={e => setForm(f => ({ ...f, section: e.target.value }))} style={inputStyle}>
            {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={form.geo} onChange={e => setForm(f => ({ ...f, geo: e.target.value }))} style={inputStyle}>
            {GEOS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <button
            type="submit"
            disabled={adding}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 6,
              border: '1px solid var(--ht)', background: 'var(--ht-d)',
              color: 'var(--ht)', fontSize: 13, fontWeight: 500,
              cursor: adding ? 'not-allowed' : 'pointer',
              gridColumn: 'span 2',
              justifyContent: 'center',
            }}
          >
            <Plus size={14} /> {adding ? 'Adding…' : 'Add Source'}
          </button>
        </div>
      </form>

      {/* Sources Table */}
      {loading ? (
        <div style={{ color: 'var(--muted)', fontSize: 14 }}>Loading sources…</div>
      ) : sources.length === 0 ? (
        <div style={{ color: 'var(--faint)', fontSize: 14 }}>No sources yet.</div>
      ) : (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden',
        }}>
          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr 80px 120px 60px 40px',
            padding: '10px 16px',
            borderBottom: '1px solid var(--border)',
            fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'var(--muted)',
            gap: 8,
          }}>
            <span>Name</span>
            <span>Type</span>
            <span>Section</span>
            <span>Geo</span>
            <span>Health</span>
            <span>Last fetched</span>
            <span>Active</span>
            <span></span>
          </div>

          {sources.map((source, i) => (
            <div
              key={source.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr 80px 120px 60px 40px',
                padding: '12px 16px',
                borderBottom: i < sources.length - 1 ? '1px solid var(--border)' : 'none',
                alignItems: 'center',
                gap: 8,
                opacity: source.active === false ? 0.5 : 1,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{source.name}</span>
              <span style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{source.type}</span>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>{source.section}</span>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>{source.geo}</span>
              <HealthDot score={source.health_score} />
              <span style={{ fontSize: 11, color: 'var(--faint)' }}>
                {source.last_fetched
                  ? new Date(source.last_fetched).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                  : 'Never'}
              </span>
              {/* Toggle */}
              <button
                onClick={() => handleToggle(source.id, source.active !== false)}
                style={{
                  width: 36, height: 20, borderRadius: 10,
                  background: source.active !== false ? 'var(--ht)' : 'var(--faint)',
                  border: 'none', cursor: 'pointer', position: 'relative',
                  transition: 'background 0.2s',
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 2, left: source.active !== false ? 18 : 2,
                  width: 16, height: 16, borderRadius: '50%',
                  background: 'var(--bg)', transition: 'left 0.2s',
                }} />
              </button>
              {/* Delete */}
              <button
                onClick={() => handleDelete(source.id)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--faint)', padding: 4,
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--warn)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--faint)'}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  )
}

// Styles injected via <style> in component root — see return() above
// (keyframes defined here for reference)
// @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
// @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }

const inputStyle = {
  background: 'var(--surface2)',
  border: '1px solid var(--border2)',
  borderRadius: 6,
  padding: '8px 10px',
  fontSize: 13,
  color: 'var(--text)',
  outline: 'none',
  width: '100%',
}
