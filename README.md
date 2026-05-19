# 🌏 Daily Market Briefing — Vercel App

Fully automated market briefing website. Claude generates fresh US, ASX and Global
market briefings every weekday morning and publishes them to your site automatically.

## How it works

```
Vercel Cron (7am AEST daily)
        ↓
/api/generate  →  Claude API  →  Vercel KV (storage)
                                        ↓
                              Website reads & displays
```

## Setup (one-time, ~10 minutes)

### 1. Get an Anthropic API key
- Go to https://console.anthropic.com
- API Keys → Create new key
- Copy it (starts with `sk-ant-...`)

### 2. Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy (from this folder)
vercel deploy
```
Follow the prompts — choose "Next.js" when asked.

### 3. Create a Vercel KV store
- Go to vercel.com → your project → Storage tab
- Create → KV (Redis) → choose free tier
- Click "Connect to project" → your market-briefing project
- Vercel auto-adds the KV env vars to your project

### 4. Add your Anthropic API key
- vercel.com → your project → Settings → Environment Variables
- Add: `ANTHROPIC_API_KEY` = your key from step 1
- Add: `CRON_SECRET` = any random string (e.g. "mySecret123")

### 5. Redeploy
```bash
vercel deploy --prod
```

### 6. Test it
- Visit `https://your-project.vercel.app/api/generate` to trigger manually
- Then visit `https://your-project.vercel.app` to see the briefing

## Cron Schedule

The cron runs at `0 21 * * 1-5` = 9pm UTC = 7am AEST (Mon–Fri).

To change the time, edit `vercel.json`:
```json
{ "crons": [{ "path": "/api/generate", "schedule": "0 21 * * 1-5" }] }
```
Use https://crontab.guru to pick your time.

## Files

```
app/
  page.js              ← The website frontend
  layout.js            ← HTML wrapper
  api/
    generate/route.js  ← Cron endpoint → calls Claude → saves to KV
    briefing/route.js  ← Serves briefing JSON to the frontend
vercel.json            ← Cron schedule config
package.json           ← Dependencies
.env.example           ← Environment variables template
```

## Cost

- Vercel: Free (Hobby plan covers this)
- Vercel KV: Free (30MB, 30k requests/month — way more than needed)
- Anthropic API: ~$0.01 per briefing generation
- Total: ~$0.20/month
