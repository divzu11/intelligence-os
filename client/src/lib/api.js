const BASE = ''

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || `Request failed: ${res.status}`)
  }
  return res.json()
}

export function getArticles(params = {}) {
  const qs = new URLSearchParams(params).toString()
  return request(`/api/articles${qs ? '?' + qs : ''}`)
}

export function getArticle(id) {
  return request(`/api/articles/${id}`)
}

export function getSummary(articleId) {
  return request(`/api/summaries/${articleId}`, { method: 'POST' })
}

export function getTrends() {
  return request('/api/trends')
}

export function getTrendArticles(topic) {
  return request(`/api/trends/${encodeURIComponent(topic)}/articles`)
}

export function searchArchive(params = {}) {
  const qs = new URLSearchParams(params).toString()
  return request(`/api/archive/search${qs ? '?' + qs : ''}`)
}

export function askArchive(question) {
  return request('/api/archive/ask', {
    method: 'POST',
    body: JSON.stringify({ question }),
  })
}

export function getLatestMemo() {
  return request('/api/memo/latest')
}

export function getAllMemos() {
  return request('/api/memo/all')
}

export function getMemoById(id) {
  return request(`/api/memo/${id}`)
}

export function generateMemo() {
  return request('/api/memo/generate', { method: 'POST' })
}

export function getSources() {
  return request('/api/sources')
}

export function addSource(data) {
  return request('/api/sources', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function toggleSource(id, active) {
  return request(`/api/sources/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ active }),
  })
}

export function deleteSource(id) {
  return request(`/api/sources/${id}`, { method: 'DELETE' })
}

export function runTrendAnalysis() {
  return request('/api/trends/analyze', { method: 'POST' })
}

export function markRead(articleId, opts = {}) {
  return request(`/api/articles/${articleId}/read`, {
    method: 'POST',
    body: JSON.stringify(opts),
  }).catch(() => {}) // fire-and-forget, never throw
}

export function runIngest() {
  return request('/api/sources/ingest', { method: 'POST' })
}
