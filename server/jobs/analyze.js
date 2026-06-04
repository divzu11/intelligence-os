import cron from 'node-cron'
import { getClient } from '../lib/db.js'

export async function runAnalysis() {
  console.log('[analyze] Starting trend analysis...')

  const now = new Date()
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000)
  const fourteenDaysAgo = new Date(now - 14 * 24 * 60 * 60 * 1000)

  try {
    // Fetch tags from this week
    const { data: thisWeekTags, error: e1 } = await getClient()
      .from('tags')
      .select('topics, article_id, created_at')
      .gte('created_at', sevenDaysAgo.toISOString())

    if (e1) throw new Error(e1.message)

    // Fetch tags from last week
    const { data: lastWeekTags, error: e2 } = await getClient()
      .from('tags')
      .select('topics, article_id, created_at')
      .gte('created_at', fourteenDaysAgo.toISOString())
      .lt('created_at', sevenDaysAgo.toISOString())

    if (e2) throw new Error(e2.message)

    // Count topic occurrences this week
    const thisWeekCounts = {}
    for (const tag of (thisWeekTags || [])) {
      for (const topic of (tag.topics || [])) {
        thisWeekCounts[topic] = (thisWeekCounts[topic] || 0) + 1
      }
    }

    // Count topic occurrences last week
    const lastWeekCounts = {}
    for (const tag of (lastWeekTags || [])) {
      for (const topic of (tag.topics || [])) {
        lastWeekCounts[topic] = (lastWeekCounts[topic] || 0) + 1
      }
    }

    // All topics seen in either period
    const allTopics = new Set([
      ...Object.keys(thisWeekCounts),
      ...Object.keys(lastWeekCounts),
    ])

    let upsertCount = 0
    for (const topic of allTopics) {
      const thisWeek = thisWeekCounts[topic] || 0
      const lastWeek = lastWeekCounts[topic] || 0

      if (thisWeek === 0) continue // Not seen this week — skip

      const velocity = ((thisWeek - lastWeek) / Math.max(lastWeek, 1)) * 100

      let status
      if (velocity > 100 && thisWeek > 5) status = 'rising'
      else if (velocity > 30 && thisWeek >= 3) status = 'emerging'
      else if (velocity < -30) status = 'fading'
      else status = 'peaked'

      // Get first seen date
      const { data: firstSeenData } = await getClient()
        .from('tags')
        .select('created_at')
        .contains('topics', [topic])
        .order('created_at', { ascending: true })
        .limit(1)
        .single()

      const firstSeen = firstSeenData?.created_at || now.toISOString()

      const { error: upsertError } = await getClient()
        .from('trends')
        .upsert(
          {
            topic,
            velocity: Math.round(velocity),
            status,
            article_count_this_week: thisWeek,
            article_count_last_week: lastWeek,
            first_seen: firstSeen,
            updated_at: now.toISOString(),
          },
          { onConflict: 'topic' }
        )

      if (upsertError) console.error(`[analyze] Upsert error for "${topic}":`, upsertError.message)
      else upsertCount++
    }

    console.log(`[analyze] Upserted ${upsertCount} trends.`)
  } catch (err) {
    console.error('[analyze] Error:', err.message)
  }
}

// Schedule: daily at 2am
cron.schedule('0 2 * * *', () => {
  runAnalysis().catch(err => console.error('[analyze] Cron error:', err.message))
})
