import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (
    process.env.NODE_ENV === 'production' &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = new Date().toLocaleDateString('en-AU', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 1000,
        system: `You are a senior financial market analyst. Respond ONLY with a valid JSON object — no markdown, no backticks, nothing outside the JSON braces. Use this exact structure:
{
  "date": "string",
  "sentiment": "Bullish|Bearish|Cautious|Mixed",
  "sentimentReason": "one sentence",
  "topInsight": "2 sentences",
  "indicators": [
    { "label": "S&P 500", "value": "7,173", "change": "+0.12%", "direction": "up" },
    { "label": "ASX 200", "value": "8,766", "change": "-0.23%", "direction": "down" },
    { "label": "Brent Oil", "value": "$99.76", "change": "+3.52%", "direction": "up" },
    { "label": "Gold", "value": "$4,618", "change": "-1.60%", "direction": "down" },
    { "label": "AUD/USD", "value": "0.7165", "change": "+0.59%", "direction": "up" },
    { "label": "VIX", "value": "18.37", "change": "+1.94%", "direction": "up" },
    { "label": "BTC", "value": "$76,568", "change": "-1.66%", "direction": "down" },
    { "label": "10Y UST", "value": "4.42%", "change": "+0.03%", "direction": "up" }
  ],
  "breakingNews": [
    {
      "headline": "short punchy headline",
      "summary": "2 sentences of context",
      "marketImpact": "1 sentence impact",
      "tag": "GEOPOLITICAL|EARNINGS|MACRO|CENTRAL BANK|CRYPTO|ENERGY|ASX"
    }
  ],
  "marketPulse": [
    {
      "category": "EQUITY FLOWS|BOND MARKET|HEDGE FUND LEVERAGE|INSTITUTIONAL POSITIONING|MACRO RISK FLAG",
      "headline": "ONE bold stat headline e.g. 'Equity funds bleed $14.4B in a single week'",
      "context": "2-3 sentences of data-driven context explaining what it means",
      "implication": "1-2 sentences: who benefits, who is at risk",
      "chart_type": "line|bar|area",
      "chart_data": [
        { "label": "string", "value": 0 }
      ]
    }
  ],
  "sections": [
    {
      "flag": "🇺🇸",
      "region": "US Markets",
      "events": [
        {
          "title": "string",
          "when": "Day, Time ET",
          "type": "macro|earnings|central_bank|geopolitical",
          "description": "1-2 sentences",
          "impact": "1-2 sentences",
          "watchFor": "specific threshold or signal"
        }
      ]
    },
    { "flag": "🇦🇺", "region": "Australia (ASX)", "events": [] },
    { "flag": "🌏", "region": "Global (Asia / Europe)", "events": [] }
  ]
}`,
        messages: [{
          role: 'user',
          content: `Today is ${today}.

Generate a complete market briefing. For the marketPulse section, write exactly 5 items covering these categories in order: EQUITY FLOWS, BOND MARKET, HEDGE FUND LEVERAGE, INSTITUTIONAL POSITIONING, MACRO RISK FLAG.

Style: Bloomberg terminal meets Twitter — precise numbers, bold claims, clear implications. Tone of The Kobeissi Letter. No fluff.

Use these real data points for Market Pulse:
- ICI data week Apr 15: equity fund outflows $14.37B domestic, $2.40B world funds. Bond fund outflows $2.56B.
- Hedge fund repo borrowing grew 154% since 2022. Prime brokerage borrowing +83%. Industry gross assets $11.8T, levered 2.6x. Macro/multi-strat/relative value funds at 6x leverage.
- IG corporate bond issuance forecast $2.25T in 2026, +35% YoY. VTC yield 4.91%.
- IMF GFSR: household S&P 500 exposure via 401k/ETFs at record highs. Capital flows skewed toward debt.
- S&P 500 RSI near 70 (overbought). Chip stocks RSI above 80. Only 53% of S&P 500 stocks above 50-day MA, down from 60% last week. Goldman raised Brent forecast to $90 avg Q4 2026.

Include 5-6 breaking news items and 4-5 events per region.`,
        }],
      }),
    })

    const data = await response.json()
    if (!response.ok || data.type === 'error') throw new Error(data?.error?.message || 'Claude API error')

    const text = data.content?.find(b => b.type === 'text')?.text || ''
    const start = text.indexOf('{'), end = text.lastIndexOf('}')
    if (start === -1) throw new Error('No JSON in response')

    const briefing = JSON.parse(text.slice(start, end + 1))
    briefing.generatedAt = new Date().toISOString()

    const dateKey = new Date().toISOString().split('T')[0]
    await kv.set('briefing:latest', briefing)
    await kv.set(`briefing:${dateKey}`, briefing)
    await kv.expire(`briefing:${dateKey}`, 60 * 60 * 24 * 7)

    return NextResponse.json({ success: true, date: today })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
