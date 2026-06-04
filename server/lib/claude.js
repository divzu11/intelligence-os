import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function generateSummary(title, content) {
  const prompt = `You are a healthcare intelligence analyst writing for a busy healthcare operator and investor.

Article title: ${title}
Article content: ${content}

Provide three things:

SUMMARY: Write 90-110 words of clear, informative prose. Cover what happened, why it matters, and the implication. Mention specific numbers, companies, or policies if present. Do not start with "This article" or the title. If content is minimal or unavailable write 1-2 sentences explaining the article appears paywalled and what the headline suggests.

OPERATOR TAKE: 2-3 sentences on what this means for someone running a hospital, clinic, or healthcare business. Focus on operational implications.

INVESTOR TAKE: 2-3 sentences on what this means for a healthcare investor. Focus on market opportunity, risk, or deal signal.

Return as JSON:
{"summary": "...", "operatorTake": "...", "investorTake": "..."}`

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    })
    const text = response.content[0].text
    const json = JSON.parse(text.match(/\{[\s\S]*\}/)[0])
    return {
      summary: json.summary || '',
      operatorTake: json.operatorTake || '',
      investorTake: json.investorTake || '',
      wordCount: (json.summary || '').split(/\s+/).length
    }
  } catch (err) {
    console.error('generateSummary error:', err.message)
    return { summary: 'Summary unavailable.', operatorTake: '', investorTake: '', wordCount: 0 }
  }
}

export async function generateTags(title, content) {
  const prompt = `Extract structured tags from this healthcare article.

Title: ${title}
Content: ${content}

Return JSON only, no other text:
{
  "topics": [],
  "companies": [],
  "people": [],
  "policies": [],
  "technologies": [],
  "geo": "US|India|Global",
  "sentiment": "positive|negative|neutral"
}

Keep each array to maximum 4 items. Only include what is explicitly mentioned.`

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }]
    })
    const text = response.content[0].text
    return JSON.parse(text.match(/\{[\s\S]*\}/)[0])
  } catch (err) {
    console.error('generateTags error:', err.message)
    return { topics: [], companies: [], people: [], policies: [], technologies: [], geo: 'Global', sentiment: 'neutral' }
  }
}

export async function generateWeeklyMemo(articlesJson, trendsJson) {
  const prompt = `You are an intelligence analyst writing a weekly briefing for a healthcare operator and investor.

Top articles this week:
${articlesJson}

Trending topics this week:
${trendsJson}

Write a 400-word weekly intelligence memo with exactly these four sections:

THIS WEEK IN BRIEF
2-3 sentences. The single most important development of the week.

TOP 3 SIGNALS
One paragraph each on the 3 most significant trends or stories. Be specific — name companies, numbers, policies.

WEAK SIGNAL TO WATCH
One paragraph on an emerging topic that is not yet mainstream but appeared multiple times this week.

US TO INDIA WATCH
One paragraph on a trend playing out in the US that shows early signs of emerging in India.

Write in direct, confident prose. No bullet points. No hedging language.`

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }]
    })
    return response.content[0].text
  } catch (err) {
    console.error('generateWeeklyMemo error:', err.message)
    return 'Memo generation failed. Please try again.'
  }
}

export async function askArchive(question, articlesJson) {
  const prompt = `Answer this question using only the articles provided. Do not use outside knowledge.

Articles from the user's reading history:
${articlesJson}

Question: ${question}

Answer in 150-200 words. Cite specific article titles where relevant. If the articles do not contain enough information to answer, say so directly.`

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    })
    return response.content[0].text
  } catch (err) {
    console.error('askArchive error:', err.message)
    return 'Unable to answer at this time. Please try again.'
  }
}
