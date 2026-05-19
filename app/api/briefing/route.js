import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const briefing = await kv.get('briefing:latest')
    if (!briefing) {
      return NextResponse.json({ error: 'No briefing yet — cron hasn\'t run' }, { status: 404 })
    }
    return NextResponse.json(briefing)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
