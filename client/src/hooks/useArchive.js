import { useState, useEffect, useRef } from 'react'
import { searchArchive } from '../lib/api'

export function useArchive(initialParams = {}) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [params, setParams] = useState(initialParams)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (!params.q && !params.section && !params.geo && !params.dateFrom && !params.dateTo) {
      setResults([])
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setLoading(true)
      setError(null)
      searchArchive(params)
        .then(data => { setResults(data); setLoading(false) })
        .catch(err => { setError(err.message); setLoading(false) })
    }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [params])

  return { results, loading, error, setParams, params }
}
