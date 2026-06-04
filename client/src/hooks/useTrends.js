import { useState, useEffect, useCallback } from 'react'
import { getTrends } from '../lib/api'

export function useTrends() {
  const [trends, setTrends] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(() => {
    setLoading(true)
    setError(null)
    return getTrends()
      .then(data => { setTrends(data); setLoading(false) })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { trends, loading, error, refetch: fetch }
}
