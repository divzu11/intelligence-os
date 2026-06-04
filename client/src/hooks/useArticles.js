import { useState, useEffect } from 'react'
import { getArticles } from '../lib/api'

export function useArticles(filter = 'all') {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    const params = filter !== 'all' ? { section: filter } : {}
    getArticles(params)
      .then(data => { setArticles(data); setLoading(false) })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [filter])

  return { articles, loading, error }
}
