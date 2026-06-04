const PAYWALL_PHRASES = [
  'subscribe to continue', 'subscribers only', 'sign in to read',
  'premium content', 'continue reading', 'create a free account',
  'already a subscriber', 'read the full story', 'to read the full'
]

export function isPaywalled(content) {
  if (!content) return false
  const lower = content.toLowerCase()
  let score = 0
  if (content.length < 150) score++
  if (PAYWALL_PHRASES.some(p => lower.includes(p))) score++
  if (content.length > 0 && content.length < 120) score++
  return score >= 2
}
