import Parser from 'rss-parser'
const parser = new Parser({ timeout: 10000 })

export async function fetchFeed(url) {
  try {
    const feed = await parser.parseURL(url)
    return feed.items.map(item => ({
      title: item.title || '',
      url: item.link || item.guid || '',
      pubDate: item.pubDate || item.isoDate || null,
      content: item.contentSnippet || item.content || item.summary || '',
      sourceName: feed.title || '',
    })).filter(i => i.url)
  } catch (err) {
    console.error(`RSS fetch failed for ${url}:`, err.message)
    return []
  }
}
