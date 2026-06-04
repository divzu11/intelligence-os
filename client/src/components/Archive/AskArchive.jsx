import { useState } from 'react'
import { Send, Loader } from 'lucide-react'
import { askArchive } from '../../lib/api'

export default function AskArchive() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!question.trim()) return
    setLoading(true)
    setError(null)
    setAnswer(null)
    try {
      const data = await askArchive(question.trim())
      setAnswer(data.answer)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '10px 14px',
        borderBottom: '1px solid var(--border)',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--ops)',
      }}>
        Ask Archive
      </div>

      <form onSubmit={handleSubmit} style={{ padding: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="Ask a question about your reading history…"
            style={{
              flex: 1,
              background: 'var(--surface2)',
              border: '1px solid var(--border2)',
              borderRadius: 6,
              padding: '8px 12px',
              fontSize: 13,
              color: 'var(--text)',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid var(--ops)',
              background: 'var(--ops-d)',
              color: 'var(--ops)',
              cursor: loading || !question.trim() ? 'not-allowed' : 'pointer',
              opacity: loading || !question.trim() ? 0.6 : 1,
              display: 'flex', alignItems: 'center',
            }}
          >
            {loading ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={14} />}
          </button>
        </div>
      </form>

      {(answer || error) && (
        <div style={{ padding: '0 12px 12px' }}>
          {error ? (
            <p style={{ fontSize: 13, color: 'var(--warn)' }}>{error}</p>
          ) : (
            <div style={{
              background: 'var(--ops-d)',
              border: '1px solid var(--ops)',
              borderRadius: 6,
              padding: '12px 14px',
            }}>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text)' }}>{answer}</p>
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
