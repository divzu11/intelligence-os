// ─────────────────────────────────────────────────────────────────────────────
// DEMO DATA
//
// This module powers "demo mode" — a fully populated, offline version of
// Intelligence OS that runs with no backend, no Supabase project, and no
// Anthropic API key. It exists so the app can be demoed or screen-recorded
// instantly with `npm run dev`.
//
// The data shapes here match exactly what the real Express/Supabase backend
// returns (see server/lib/db.js and server/routes/*). When demo mode is off
// (VITE_DEMO=false), api.js talks to the live backend instead and this file
// is ignored.
// ─────────────────────────────────────────────────────────────────────────────

// Build ISO timestamps relative to "now" so the reader always shows fresh
// "Xh ago" labels regardless of when the demo is recorded.
const now = Date.now()
const hoursAgo = (h) => new Date(now - h * 60 * 60 * 1000).toISOString()
const daysAgo = (d) => new Date(now - d * 24 * 60 * 60 * 1000).toISOString()

// ── Articles ──────────────────────────────────────────────────────────────────
// Each article carries flattened summary fields (summary, operator_take,
// investor_take, word_count, paywalled) exactly as the backend's flattenSummary()
// produces. `topics` is used to link articles to trends.
export const ARTICLES = [
  {
    id: 'a1',
    title: 'CMS finalizes rule expanding telehealth reimbursement parity through 2027',
    url: 'https://www.example-news.com/cms-telehealth-parity',
    source_name: 'Fierce Healthcare',
    section: 'operations',
    geo: 'US',
    published_at: hoursAgo(3),
    content:
      'The Centers for Medicare & Medicaid Services issued a final rule on Tuesday extending payment parity for telehealth visits through the end of 2027, locking in pandemic-era flexibilities that providers had warned could expire. The rule keeps reimbursement for audio-video visits at the same level as in-person care across most specialties and preserves audio-only coverage for behavioral health. Hospital groups praised the certainty, while some payers cautioned that permanent parity could inflate utilization. The agency estimated the change affects roughly 50 million covered lives and will be revisited in a 2026 utilization study.',
    summary:
      'CMS finalized a rule extending telehealth payment parity through 2027, keeping audio-video visit reimbursement equal to in-person care across most specialties and preserving audio-only behavioral health coverage. The decision locks in pandemic-era flexibilities providers feared would lapse, affecting roughly 50 million covered lives. Hospital associations welcomed the certainty for virtual-care investments, while several payers warned that permanent parity could drive up utilization and cost. CMS said it will revisit the policy after a 2026 utilization study, leaving a window of regulatory risk but giving health systems a multi-year runway to build durable virtual-care programs around stable economics.',
    operator_take:
      'Lock in your virtual-care staffing and capacity plans now — the economics are stable through 2027. Behavioral health teams especially can lean into audio-only without reimbursement anxiety.',
    investor_take:
      'A tailwind for telehealth and virtual-first platforms; revenue durability just improved through 2027. Watch the 2026 utilization study as the key re-rating catalyst.',
    word_count: 104,
    paywalled: false,
    topics: ['Telehealth', 'Medicare', 'Reimbursement'],
  },
  {
    id: 'a2',
    title: 'Hippocratic AI raises $200M Series C to scale clinical voice agents',
    url: 'https://www.example-news.com/hippocratic-series-c',
    source_name: 'Rock Health',
    section: 'healthtech',
    geo: 'Global',
    published_at: hoursAgo(6),
    content:
      'Hippocratic AI announced a $200 million Series C at a $2.6 billion valuation to expand its fleet of generative-AI voice agents that handle non-diagnostic patient outreach — appointment prep, post-discharge check-ins, and chronic-care follow-ups. The round was led by a major growth fund with participation from existing healthcare investors. The company said its agents have completed more than 4 million patient calls and now contract with several large health systems on a per-completed-call basis.',
    summary:
      'Hippocratic AI raised a $200 million Series C at a $2.6 billion valuation to scale its generative-AI voice agents for non-diagnostic patient outreach such as appointment prep, post-discharge check-ins, and chronic-care follow-up. The company reports its agents have completed over 4 million patient calls and sells on a per-completed-call basis to large health systems. The raise underscores investor conviction that voice AI can absorb administrative and care-coordination labor amid clinical staffing shortages. Pricing tied to completed calls aligns vendor incentives with outcomes, a model operators find easier to justify than seat licenses, and signals maturing commercialization in the clinical-AI category.',
    operator_take:
      'Per-completed-call pricing de-risks pilots — you pay for work done, not seats. A credible lever against call-center and care-coordination labor shortages.',
    investor_take:
      'Validates outcome-aligned pricing in clinical AI and a $2.6B comp for the voice-agent category. Watch net revenue retention and call-completion quality as the durability test.',
    word_count: 106,
    paywalled: false,
    topics: ['Generative AI', 'Clinical AI', 'Staffing'],
  },
  {
    id: 'a3',
    title: 'Apollo Hospitals to deploy AI triage across 70 Indian facilities',
    url: 'https://www.example-news.com/apollo-ai-triage',
    source_name: 'ET Health',
    section: 'healthtech',
    geo: 'India',
    published_at: hoursAgo(9),
    content:
      'Apollo Hospitals said it will roll out an AI-assisted triage and clinical-documentation system across 70 facilities over the next 18 months, partnering with a domestic health-AI startup. The system listens to clinician-patient conversations, drafts notes, and flags high-acuity cases for faster routing. Apollo framed the move as a response to physician burnout and rising outpatient volumes in tier-2 and tier-3 cities.',
    summary:
      'Apollo Hospitals will deploy an AI triage and ambient-documentation system across 70 Indian facilities over 18 months, partnering with a domestic health-AI startup. The tool transcribes clinician-patient conversations, drafts notes, and flags high-acuity cases for faster routing, targeting physician burnout and surging outpatient volumes in tier-2 and tier-3 cities. The scale of the rollout makes it one of India’s largest ambient-AI clinical deployments and a signal that documentation automation is moving from pilot to production in emerging markets. Success here could establish a reference architecture other Indian chains follow, and validate lower-cost, locally built models against US incumbents.',
    operator_take:
      'Ambient documentation at this scale is a burnout and throughput play — watch clinician adoption and note-acceptance rates as the real KPIs, not deployment counts.',
    investor_take:
      'Evidence that India is a production market, not just a pilot market, for ambient clinical AI. Locally built models competing on cost is the structural story.',
    word_count: 101,
    paywalled: false,
    topics: ['Clinical AI', 'Generative AI', 'India Healthcare'],
  },
  {
    id: 'a4',
    title: 'UnitedHealth posts mixed quarter as Medicare Advantage costs climb',
    url: 'https://www.example-news.com/uhg-q-results',
    source_name: 'Becker’s Finance',
    section: 'investing',
    geo: 'US',
    published_at: hoursAgo(14),
    content:
      'UnitedHealth Group reported quarterly results that beat on revenue but missed on margin as its medical loss ratio rose to 84.8%, pressured by higher-than-expected Medicare Advantage utilization among seniors. Executives reaffirmed full-year guidance but flagged continued cost pressure from outpatient procedures and specialty drugs.',
    summary:
      'UnitedHealth Group beat on revenue but missed on margin as its medical loss ratio climbed to 84.8%, driven by elevated Medicare Advantage utilization among seniors and rising outpatient and specialty-drug costs. Management reaffirmed full-year guidance while cautioning that cost pressure is likely to persist. The print reinforces a sector-wide theme: MA economics are tightening as utilization normalizes above pre-pandemic baselines and risk-adjustment scrutiny grows. For the largest US insurer to absorb this, smaller MA plans face sharper strain, foreshadowing benefit-design cuts, narrower networks, and possible market exits that ripple into provider revenue and patient access in 2026.',
    operator_take:
      'Expect MA plans to tighten networks and prior-auth — model slower approvals and more denials into your revenue cycle for 2026.',
    investor_take:
      'MLR at 84.8% confirms the MA margin-compression thesis. Smaller plans are the squeeze point; watch for consolidation and exits as opportunities and risks.',
    word_count: 103,
    paywalled: false,
    topics: ['Medicare Advantage', 'Medicare', 'Payers'],
  },
  {
    id: 'a5',
    title: 'FDA clears first generative-AI tool for autonomous radiology drafting',
    url: 'https://www.example-news.com/fda-genai-radiology',
    source_name: 'Healthcare IT News',
    section: 'healthtech',
    geo: 'Global',
    published_at: hoursAgo(20),
    content:
      'The FDA granted clearance to a generative-AI system that drafts preliminary radiology reports for chest X-rays, which radiologists then review and sign. It is among the first generative (rather than purely classification) tools to clear the agency’s review for report generation, and arrives with guardrails requiring human sign-off on every study.',
    summary:
      'The FDA cleared a generative-AI system that drafts preliminary chest X-ray radiology reports for radiologist review and sign-off, one of the first generative tools — as opposed to narrow image classifiers — to clear for report generation. The clearance mandates human sign-off on every study, establishing a regulatory template for assistive rather than autonomous generative tools. It marks a meaningful precedent: the agency is willing to clear text-generating clinical AI when paired with mandatory human oversight. Expect a wave of similar submissions for pathology, cardiology, and discharge summaries, and intensifying debate over liability, reimbursement, and how productivity gains are shared between vendors and providers.',
    operator_take:
      'A productivity lever for radiology backlogs, but workflow integration and sign-off discipline determine whether you actually capture the gains.',
    investor_take:
      'A regulatory template just opened for generative clinical documentation. First-mover clearance is a moat signal; watch fast-follower submissions across modalities.',
    word_count: 105,
    paywalled: false,
    topics: ['Generative AI', 'Clinical AI', 'FDA'],
  },
  {
    id: 'a6',
    title: 'Star Health expands cashless network as Indian health-insurance claims surge',
    url: 'https://www.example-news.com/star-health-cashless',
    source_name: 'Mint Health',
    section: 'insurance',
    geo: 'India',
    published_at: hoursAgo(26),
    content:
      'Star Health and Allied Insurance said it added 3,000 hospitals to its cashless network and is investing in AI-based claims adjudication to handle a sharp rise in claim volumes following regulatory pushes to broaden retail health coverage in India.',
    summary:
      'Star Health expanded its cashless hospital network by 3,000 facilities and is investing in AI-based claims adjudication to manage surging claim volumes, driven by regulatory efforts to broaden retail health coverage across India. The move reflects intensifying competition in India’s fast-growing retail health-insurance market, where network breadth and claims speed are becoming primary differentiators. Automating adjudication is both a cost play and a customer-experience bet as insurers race to onboard first-time policyholders. The expansion signals that India’s under-penetrated health-insurance market is entering a scale phase, with technology infrastructure — not just pricing — emerging as the competitive battleground for the next wave of growth.',
    operator_take:
      'For Indian providers, a wider cashless network means faster receivables but tighter rate negotiation — revisit your payer mix assumptions.',
    investor_take:
      'India retail health insurance is entering a scale phase; claims-automation infrastructure is the pick-and-shovel angle. Watch loss ratios as growth accelerates.',
    word_count: 102,
    paywalled: false,
    topics: ['India Healthcare', 'Payers', 'Claims Automation'],
  },
  {
    id: 'a7',
    title: 'Health systems report 30% drop in documentation time with ambient AI scribes',
    url: 'https://www.example-news.com/ambient-scribe-study',
    source_name: 'Modern Healthcare',
    section: 'operations',
    geo: 'US',
    published_at: daysAgo(2),
    content:
      'A multi-site study across 12 health systems found clinicians using ambient AI scribes reduced documentation time by an average of 30% and reported lower burnout scores, though results varied widely by specialty and scribe vendor.',
    summary:
      'A 12-system study found clinicians using ambient AI scribes cut documentation time by an average of 30% and reported lower burnout, though results varied widely by specialty and vendor. Primary care and behavioral health saw the largest gains; procedural specialties saw less. The findings add rigor to a category that has scaled largely on vendor-reported metrics, giving CMIOs harder evidence to justify enterprise contracts. The variance, however, is the real story: outcomes depend heavily on workflow fit, clinician training, and note-acceptance behavior, suggesting that buying the tool is necessary but not sufficient, and that implementation quality will separate winners from disappointed adopters.',
    operator_take:
      'The 30% is an average, not a guarantee — implementation, training, and specialty fit drive the spread. Pilot by specialty before enterprise rollout.',
    investor_take:
      'Independent evidence strengthens the ambient-scribe TAM, but vendor variance means differentiation is real. Workflow integration depth, not model quality, is the moat.',
    word_count: 100,
    paywalled: false,
    topics: ['Clinical AI', 'Generative AI', 'Staffing'],
  },
  {
    id: 'a8',
    title: 'Specialty drug spending projected to hit 65% of pharmacy budgets by 2027',
    url: 'https://www.example-news.com/specialty-drug-spend',
    source_name: 'Health Affairs',
    section: 'investing',
    geo: 'US',
    published_at: daysAgo(2),
    content:
      'A new analysis projects specialty drugs will account for 65% of total pharmacy spending by 2027, up from roughly 55% today, driven by GLP-1s, cell and gene therapies, and biologics. Payers are responding with tighter utilization management and value-based contracts.',
    summary:
      'A new analysis projects specialty drugs will reach 65% of total pharmacy spending by 2027, up from about 55% today, propelled by GLP-1s, cell and gene therapies, and biologics. Payers are countering with tighter utilization management, step therapy, and value-based contracts that tie payment to outcomes. The trajectory reframes pharmacy from a cost line to a strategic battleground, with GLP-1 demand the single largest swing factor. For health systems and PBMs, the shift intensifies pressure to manage high-cost therapies actively, and for investors it sharpens the divide between drugmakers capturing the spend and intermediaries whose margins depend on managing it down.',
    operator_take:
      'Specialty pharmacy is now a strategic function, not a back office. Build or partner for utilization management before GLP-1 demand overruns your budget.',
    investor_take:
      'Bifurcation thesis: manufacturers of GLP-1s and cell/gene therapies capture spend; PBMs and UM vendors monetize managing it down. Both sides have angles.',
    word_count: 103,
    paywalled: true,
    topics: ['Specialty Drugs', 'GLP-1', 'Payers'],
  },
  {
    id: 'a9',
    title: 'Oscar Health touts AI agent that cut prior-auth turnaround to under an hour',
    url: 'https://www.example-news.com/oscar-prior-auth-ai',
    source_name: 'Health Payer Intelligence',
    section: 'insurance',
    geo: 'US',
    published_at: daysAgo(3),
    content:
      'Oscar Health said its AI-driven prior-authorization system now resolves a majority of routine requests in under an hour, down from a multi-day average, by auto-approving cases that meet clinical criteria and routing only edge cases to human reviewers.',
    summary:
      'Oscar Health says its AI-driven prior-authorization system resolves most routine requests in under an hour — down from multi-day averages — by auto-approving cases that clearly meet clinical criteria and routing only ambiguous ones to human reviewers. Faster authorizations ease a chronic friction point between payers, providers, and patients, and arrive as regulators scrutinize prior-auth burdens and propose electronic-standard mandates. If the results hold at scale, automated adjudication could become table stakes for payers, reframing prior auth from a cost-control blunt instrument into a speed-and-experience differentiator — while raising questions about transparency, appeal rights, and whether automation tightens or loosens approval criteria over time.',
    operator_take:
      'Faster auths could improve your throughput and cash flow — but push payers on transparency about what the model auto-denies, not just what it auto-approves.',
    investor_take:
      'Prior-auth automation is becoming table stakes for payers. The differentiation shifts to integration with provider EHRs and regulatory-compliant transparency.',
    word_count: 101,
    paywalled: false,
    topics: ['Claims Automation', 'Payers', 'Generative AI'],
  },
  {
    id: 'a10',
    title: 'Practo lays off staff, pivots to AI-first primary care in India',
    url: 'https://www.example-news.com/practo-ai-pivot',
    source_name: 'The Ken Health',
    section: 'healthtech',
    geo: 'India',
    published_at: daysAgo(3),
    content:
      'Digital-health platform Practo announced a restructuring that cuts staff while redirecting investment toward an AI-first primary-care model combining asynchronous triage, automated follow-ups, and a smaller pool of physicians handling escalations.',
    summary:
      'Practo announced a restructuring that cuts staff while pivoting toward an AI-first primary-care model: asynchronous AI triage, automated follow-ups, and a leaner physician pool handling escalations. The move reflects pressure on Indian digital-health platforms to reach profitability after years of growth-at-all-costs, betting that AI can lower the cost-to-serve enough to make virtual primary care economically viable at Indian price points. It is a high-stakes test of whether automation can substitute for clinical labor without eroding quality or trust — a question with global resonance, since a workable unit economics model in India would be a template for cost-constrained markets everywhere.',
    operator_take:
      'Watch the escalation rate — too-aggressive automation erodes trust fast. The model lives or dies on triage accuracy, not headcount savings.',
    investor_take:
      'A real-world test of AI-driven cost-to-serve in primary care. If unit economics work at Indian price points, it is a template for global cost-constrained markets.',
    word_count: 101,
    paywalled: false,
    topics: ['India Healthcare', 'Generative AI', 'Staffing'],
  },
  {
    id: 'a11',
    title: 'Epic to embed generative-AI inbox and chart-summary tools for all customers',
    url: 'https://www.example-news.com/epic-genai-inbox',
    source_name: 'Healthcare IT News',
    section: 'operations',
    geo: 'US',
    published_at: daysAgo(4),
    content:
      'EHR giant Epic said it will make generative-AI tools for drafting in-basket message replies and summarizing patient charts available to all customers, embedding the features directly in clinician workflows at no additional per-seat license cost.',
    summary:
      'Epic will roll out generative-AI tools for drafting patient-message replies and summarizing charts to all customers, embedded directly in clinician workflows with no extra per-seat license. By bundling rather than upselling, Epic raises the bar for standalone AI documentation vendors that sell the same capabilities as separate products. Embedding AI where clinicians already work removes an adoption barrier and could accelerate normalization of generative tools across US health systems. The strategic implication is sharp: incumbents with workflow distribution can commoditize point solutions, pressuring independent vendors to differentiate on depth, specialty fit, or measurable outcomes rather than on the existence of the feature itself.',
    operator_take:
      'If you are an Epic shop, audit standalone AI contracts — you may be paying for what is now bundled. Renegotiate or consolidate.',
    investor_take:
      'Platform bundling is the key risk for standalone documentation vendors. Differentiation must move to depth and outcomes; feature parity is no longer defensible.',
    word_count: 102,
    paywalled: false,
    topics: ['Generative AI', 'Clinical AI', 'EHR'],
  },
  {
    id: 'a12',
    title: 'GLP-1 demand drives record quarter for digital weight-management platforms',
    url: 'https://www.example-news.com/glp1-digital-platforms',
    source_name: 'MedCity News',
    section: 'investing',
    geo: 'US',
    published_at: daysAgo(5),
    content:
      'Digital weight-management companies reported record enrollment as GLP-1 prescriptions surged, though analysts cautioned that reimbursement uncertainty and supply constraints could temper growth in coming quarters.',
    summary:
      'Digital weight-management platforms reported record enrollment as GLP-1 prescriptions surged, positioning themselves as the wraparound clinical and adherence layer around the drugs. Analysts cautioned that reimbursement uncertainty, supply constraints, and questions about long-term adherence could temper growth in coming quarters. The dynamic captures both the opportunity and fragility of GLP-1-adjacent business models: demand is enormous but the platforms’ durability depends on payer coverage decisions and whether they can prove they improve outcomes and retention enough to justify their fees. Expect intensifying competition and consolidation as employers and payers scrutinize which programs actually bend cost curves versus simply riding drug demand.',
    operator_take:
      'If you offer weight management, the GLP-1 wave is real demand but coverage-dependent. Tie your program to measurable adherence and outcomes or risk being cut.',
    investor_take:
      'GLP-1-adjacent platforms ride huge demand but durability hinges on payer coverage and proven retention. Expect consolidation; favor outcomes-validated models.',
    word_count: 100,
    paywalled: false,
    topics: ['GLP-1', 'Specialty Drugs', 'Payers'],
  },
]

// ── Tags lookup (article_id -> { topics, ... }) for the article detail view ─────
export const TAGS_BY_ARTICLE = ARTICLES.reduce((acc, a) => {
  acc[a.id] = {
    topics: a.topics || [],
    companies: [],
    people: [],
    policies: [],
    technologies: [],
    geo: a.geo,
    sentiment: 'neutral',
  }
  return acc
}, {})

// ── Trends ──────────────────────────────────────────────────────────────────
// Velocity = pct change in weekly article volume; status derived as in analyze.js.
export const TRENDS = [
  { id: 't1', topic: 'Generative AI',     velocity: 220, status: 'rising',   article_count_this_week: 8, article_count_last_week: 3, first_seen: daysAgo(40), updated_at: hoursAgo(2) },
  { id: 't2', topic: 'Clinical AI',       velocity: 150, status: 'rising',   article_count_this_week: 6, article_count_last_week: 2, first_seen: daysAgo(55), updated_at: hoursAgo(2) },
  { id: 't3', topic: 'GLP-1',             velocity:  80, status: 'emerging', article_count_this_week: 4, article_count_last_week: 2, first_seen: daysAgo(30), updated_at: hoursAgo(2) },
  { id: 't4', topic: 'India Healthcare',  velocity:  60, status: 'emerging', article_count_this_week: 4, article_count_last_week: 2, first_seen: daysAgo(48), updated_at: hoursAgo(2) },
  { id: 't5', topic: 'Claims Automation', velocity:  45, status: 'emerging', article_count_this_week: 3, article_count_last_week: 1, first_seen: daysAgo(22), updated_at: hoursAgo(2) },
  { id: 't6', topic: 'Payers',            velocity:   5, status: 'peaked',   article_count_this_week: 5, article_count_last_week: 5, first_seen: daysAgo(70), updated_at: hoursAgo(2) },
  { id: 't7', topic: 'Specialty Drugs',   velocity:  10, status: 'peaked',   article_count_this_week: 2, article_count_last_week: 2, first_seen: daysAgo(35), updated_at: hoursAgo(2) },
  { id: 't8', topic: 'Medicare Advantage',velocity: -40, status: 'fading',   article_count_this_week: 2, article_count_last_week: 4, first_seen: daysAgo(60), updated_at: hoursAgo(2) },
]

// ── Memos ──────────────────────────────────────────────────────────────────
// Section headers MUST match WeeklyMemo.jsx parseMemo(): THIS WEEK IN BRIEF,
// TOP 3 SIGNALS, WEAK SIGNAL TO WATCH, US TO INDIA WATCH.
const MEMO_THIS_WEEK = `THIS WEEK IN BRIEF
Generative AI moved decisively from pilot to production this week. The FDA cleared its first generative tool for radiology report drafting, Epic announced it will bundle generative inbox and chart-summary features for every customer, and a 12-system study put hard numbers (a 30% cut in documentation time) behind ambient scribes. The throughline: AI documentation is becoming infrastructure, and the competitive question is shifting from "does it work" to "who captures the value."

TOP 3 SIGNALS
1. Regulatory template for generative clinical AI. The FDA's radiology clearance, paired with a mandatory human-sign-off requirement, gives the industry a repeatable path for text-generating tools. Expect fast-follower submissions in pathology, cardiology, and discharge summaries.
2. Incumbent bundling pressure. Epic embedding generative AI at no per-seat cost commoditizes standalone documentation vendors. Differentiation now has to come from depth, specialty fit, and measurable outcomes — not feature existence.
3. MA margin compression is here. UnitedHealth's 84.8% MLR confirms Medicare Advantage utilization is normalizing above pre-pandemic levels. Smaller plans are the squeeze point; watch for benefit cuts, narrower networks, and consolidation into 2026.

WEAK SIGNAL TO WATCH
Outcome-aligned pricing in clinical AI. Hippocratic AI's $200M raise on a per-completed-call model — and Oscar's sub-hour prior-auth automation — both point to vendors selling work done rather than seats. If buyers reward this, seat-license SaaS in healthcare AI starts to look structurally disadvantaged.

US TO INDIA WATCH
India is becoming a production market for clinical AI, not just a pilot or offshore-dev market. Apollo's 70-facility ambient-documentation rollout and Practo's AI-first primary-care pivot are testing whether automation can make virtual care economically viable at Indian price points. A workable unit-economics model there would be a template the US studies, not the other way around — an inversion of the usual direction of healthcare innovation transfer.`

const MEMO_LAST_WEEK = `THIS WEEK IN BRIEF
Payer economics dominated the week. Specialty drug spend projections, prior-authorization automation, and early Medicare Advantage cost signals all pointed to a system straining to manage high-cost care. AI showed up mostly as a cost-control tool rather than a clinical one.

TOP 3 SIGNALS
1. Specialty drugs heading to 65% of pharmacy budgets by 2027, with GLP-1s the largest swing factor.
2. Prior-auth automation moving from experiment to expectation among payers.
3. India retail health insurance entering a scale phase, with claims-automation infrastructure as the differentiator.

WEAK SIGNAL TO WATCH
PBMs and utilization-management vendors quietly repositioning as the layer that monetizes managing specialty spend down — a different bet than the drugmakers capturing it.

US TO INDIA WATCH
Indian insurers are leapfrogging straight to AI-based claims adjudication as coverage broadens, skipping the manual-scale phase US payers spent decades in.`

export const MEMOS = [
  { id: 'm1', week_start: daysAgo(2),  content: MEMO_THIS_WEEK, created_at: daysAgo(2) },
  { id: 'm2', week_start: daysAgo(9),  content: MEMO_LAST_WEEK, created_at: daysAgo(9) },
]

// ── Sources ──────────────────────────────────────────────────────────────────
export const SOURCES = [
  { id: 's1',  name: 'STAT News',            url: 'https://www.statnews.com/feed/',                                   type: 'rss', section: 'healthtech', geo: 'US',     active: true,  health_score: 95, last_fetched: hoursAgo(2) },
  { id: 's2',  name: 'Rock Health',          url: 'https://rockhealth.com/feed/',                                     type: 'rss', section: 'healthtech', geo: 'Global', active: true,  health_score: 88, last_fetched: hoursAgo(2) },
  { id: 's3',  name: 'MedCity News',         url: 'https://medcitynews.com/feed/',                                    type: 'rss', section: 'healthtech', geo: 'US',     active: true,  health_score: 90, last_fetched: hoursAgo(2) },
  { id: 's4',  name: 'Fierce Healthcare',    url: 'https://www.fiercehealthcare.com/rss/xml',                         type: 'rss', section: 'healthtech', geo: 'US',     active: true,  health_score: 92, last_fetched: hoursAgo(2) },
  { id: 's5',  name: 'Healthcare IT News',   url: 'https://www.healthcareitnews.com/rss.xml',                         type: 'rss', section: 'healthtech', geo: 'Global', active: true,  health_score: 87, last_fetched: hoursAgo(2) },
  { id: 's6',  name: 'ET Health',            url: 'https://health.economictimes.indiatimes.com/rss/topstories',       type: 'rss', section: 'healthtech', geo: 'India',  active: true,  health_score: 84, last_fetched: hoursAgo(3) },
  { id: 's7',  name: 'The Ken Health',       url: 'https://the-ken.com/feed/',                                        type: 'rss', section: 'healthtech', geo: 'India',  active: true,  health_score: 80, last_fetched: hoursAgo(3) },
  { id: 's8',  name: 'Becker’s Finance',url: 'https://www.beckershospitalreview.com/rss/finance.xml',            type: 'rss', section: 'investing',  geo: 'US',     active: true,  health_score: 91, last_fetched: hoursAgo(2) },
  { id: 's9',  name: 'Health Affairs',       url: 'https://www.healthaffairs.org/rss/site_5/41.xml',                  type: 'rss', section: 'investing',  geo: 'US',     active: true,  health_score: 89, last_fetched: hoursAgo(4) },
  { id: 's10', name: 'Mint Health',          url: 'https://www.livemint.com/rss/healthcare',                          type: 'rss', section: 'investing',  geo: 'India',  active: true,  health_score: 82, last_fetched: hoursAgo(3) },
  { id: 's11', name: 'Modern Healthcare',    url: 'https://www.modernhealthcare.com/section/rss',                     type: 'rss', section: 'operations', geo: 'US',     active: true,  health_score: 90, last_fetched: hoursAgo(2) },
  { id: 's12', name: 'Health Payer Intel',   url: 'https://healthpayerintelligence.com/feed/',                        type: 'rss', section: 'insurance',  geo: 'US',     active: false, health_score: 60, last_fetched: daysAgo(2) },
  { id: 's13', name: 'KFF',                   url: 'https://kff.org/feed/',                                            type: 'rss', section: 'insurance',  geo: 'US',     active: true,  health_score: 93, last_fetched: hoursAgo(5) },
]

// Canned answer for the "Ask the Archive" feature. Echoes the question so the
// demo feels responsive while staying fully offline.
export function buildArchiveAnswer(question) {
  return `Based on the ${ARTICLES.length} articles in your archive, here's what's relevant to "${question}":\n\n` +
    `The dominant theme is the shift of generative AI from pilots to production across documentation, triage, and prior authorization. The FDA's first clearance for generative radiology drafting and Epic's decision to bundle generative tools for all customers both point to AI documentation becoming infrastructure rather than a differentiator. On the economics side, UnitedHealth's rising medical loss ratio and projections that specialty drugs will reach 65% of pharmacy budgets signal sustained cost pressure on payers. A notable cross-cutting signal is the move toward outcome-aligned pricing (per-completed-call, sub-hour prior-auth) and the emergence of India as a production market for clinical AI rather than just a pilot environment.\n\n` +
    `(Demo mode: this is a representative synthesized answer. With a live Anthropic API key, this response is generated by Claude over your actual ingested archive.)`
}
