'use client'
import { useState, useEffect } from 'react'

// ── Style maps ─────────────────────────────────────────────────────────────────
const TYPE_COLORS = {
  macro:        { bg:'#1e3a5f', text:'#93c5fd', border:'#1d4ed8', label:'MACRO' },
  earnings:     { bg:'#2e1065', text:'#c4b5fd', border:'#5b21b6', label:'EARNINGS' },
  central_bank: { bg:'#451a03', text:'#fcd34d', border:'#92400e', label:'CENTRAL BANK' },
  geopolitical: { bg:'#450a0a', text:'#fca5a5', border:'#991b1b', label:'GEOPOLITICAL' },
}
const NEWS_TAGS = {
  GEOPOLITICAL:   { bg:'#450a0a', text:'#fca5a5' },
  EARNINGS:       { bg:'#2e1065', text:'#c4b5fd' },
  MACRO:          { bg:'#1e3a5f', text:'#93c5fd' },
  'CENTRAL BANK': { bg:'#451a03', text:'#fcd34d' },
  ENERGY:         { bg:'#1a2e05', text:'#86efac' },
  CRYPTO:         { bg:'#1e1b4b', text:'#a5b4fc' },
  ASX:            { bg:'#0a2040', text:'#7dd3fc' },
}
const PULSE_CATEGORIES = {
  'EQUITY FLOWS':           { bg:'#1e3a5f', text:'#93c5fd', icon:'📊' },
  'BOND MARKET':            { bg:'#064e3b', text:'#6ee7b7', icon:'📈' },
  'HEDGE FUND LEVERAGE':    { bg:'#450a0a', text:'#fca5a5', icon:'⚡' },
  'INSTITUTIONAL POSITIONING': { bg:'#2e1065', text:'#c4b5fd', icon:'🏦' },
  'MACRO RISK FLAG':        { bg:'#451a03', text:'#fcd34d', icon:'🚨' },
}
const SENTI = {
  Bullish:  { color:'#34d399', bg:'#064e3b' },
  Bearish:  { color:'#f87171', bg:'#450a0a' },
  Cautious: { color:'#fbbf24', bg:'#451a03' },
  Mixed:    { color:'#60a5fa', bg:'#1e3a5f' },
}
const mono = { fontFamily:'monospace' }

// ── Mini bar chart ─────────────────────────────────────────────────────────────
function MiniChart({ data, type }) {
  if (!data?.length) return null
  const max = Math.max(...data.map(d => Math.abs(d.value)))
  const colors = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#06b6d4','#ec4899']

  return (
    <div style={{ marginTop:'12px' }}>
      <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
        {data.slice(0,6).map((d, i) => {
          const pct = max > 0 ? (Math.abs(d.value) / max) * 100 : 0
          const isNeg = d.value < 0
          return (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <div style={{ ...mono, fontSize:'9px', color:'#6b7280', width:'90px', flexShrink:0, textAlign:'right', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{d.label}</div>
              <div style={{ flex:1, background:'#07080f', borderRadius:'3px', height:'14px', overflow:'hidden' }}>
                <div style={{ width:`${pct}%`, height:'100%', background: isNeg ? '#ef4444' : colors[i % colors.length], borderRadius:'3px', transition:'width 0.5s ease' }} />
              </div>
              <div style={{ ...mono, fontSize:'10px', color: isNeg ? '#f87171' : '#e5e7eb', width:'50px', flexShrink:0 }}>
                {typeof d.value === 'number' && !Number.isInteger(d.value) ? d.value.toFixed(1) : d.value}{d.unit || ''}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Components ─────────────────────────────────────────────────────────────────
function IndicatorBar({ indicators }) {
  if (!indicators?.length) return null
  return (
    <div style={{ background:'#0a0c14', borderBottom:'1px solid #1e2130', padding:'10px 0', overflowX:'auto' }}>
      <div style={{ display:'inline-flex', gap:'5px', padding:'0 14px', minWidth:'max-content' }}>
        {indicators.map((ind, i) => (
          <div key={i} style={{ display:'inline-flex', alignItems:'center', gap:'7px', background:'#11141e', border:'1px solid #1e2130', borderRadius:'7px', padding:'6px 11px' }}>
            <span style={{ ...mono, fontSize:'9px', color:'#6b7280' }}>{ind.label}</span>
            <span style={{ ...mono, fontSize:'12px', fontWeight:'700', color:'#fff' }}>{ind.value}</span>
            <span style={{ ...mono, fontSize:'10px', fontWeight:'600', color: ind.direction === 'up' ? '#34d399' : '#f87171' }}>
              {ind.direction === 'up' ? '▲' : '▼'} {ind.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PulseCard({ item }) {
  const cat = PULSE_CATEGORIES[item.category] || PULSE_CATEGORIES['MACRO RISK FLAG']
  return (
    <div style={{ background:'#11141e', border:'1px solid #1e2130', borderRadius:'10px', padding:'18px', marginBottom:'12px' }}>
      {/* Category badge */}
      <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px' }}>
        <span style={{ fontSize:'14px' }}>{cat.icon}</span>
        <span style={{ ...mono, fontSize:'9px', letterSpacing:'0.12em', textTransform:'uppercase', background:cat.bg, color:cat.text, padding:'2px 8px', borderRadius:'4px' }}>
          {item.category}
        </span>
      </div>

      {/* Bold stat headline */}
      <div style={{ fontSize:'15px', fontWeight:'700', color:'#fff', lineHeight:1.35, marginBottom:'10px' }}>
        {item.headline}
      </div>

      {/* Context */}
      <p style={{ margin:'0 0 10px', fontSize:'12px', lineHeight:1.65, color:'#9ca3af' }}>{item.context}</p>

      {/* Implication */}
      <div style={{ background:'#07080f', borderLeft:'2px solid #d97706', borderRadius:'0 6px 6px 0', padding:'10px 12px', marginBottom: item.chart_data?.length ? '10px' : '0' }}>
        <div style={{ ...mono, fontSize:'8px', letterSpacing:'0.15em', color:'#d97706', textTransform:'uppercase', marginBottom:'4px' }}>Risk / Implication</div>
        <p style={{ margin:0, fontSize:'12px', lineHeight:1.55, color:'#fde68a' }}>{item.implication}</p>
      </div>

      {/* Mini chart */}
      {item.chart_data?.length > 0 && <MiniChart data={item.chart_data} type={item.chart_type} />}
    </div>
  )
}

function NewsCard({ item }) {
  const tc = NEWS_TAGS[item.tag] || NEWS_TAGS.MACRO
  return (
    <div style={{ background:'#11141e', border:'1px solid #1e2130', borderRadius:'10px', padding:'15px', marginBottom:'10px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'7px', flexWrap:'wrap' }}>
        <span style={{ ...mono, fontSize:'9px', letterSpacing:'0.1em', textTransform:'uppercase', background:tc.bg, color:tc.text, padding:'2px 8px', borderRadius:'4px' }}>{item.tag}</span>
        <span style={{ ...mono, fontSize:'9px', color:'#374151', letterSpacing:'0.08em' }}>BREAKING</span>
      </div>
      <div style={{ fontSize:'14px', fontWeight:'700', color:'#fff', marginBottom:'5px', lineHeight:1.35 }}>{item.headline}</div>
      <p style={{ margin:'0 0 8px', fontSize:'12px', lineHeight:1.6, color:'#9ca3af' }}>{item.summary}</p>
      <div style={{ borderLeft:'2px solid #d97706', paddingLeft:'10px' }}>
        <span style={{ ...mono, fontSize:'9px', color:'#d97706', textTransform:'uppercase', letterSpacing:'0.08em' }}>Market Impact: </span>
        <span style={{ fontSize:'12px', color:'#fde68a' }}>{item.marketImpact}</span>
      </div>
    </div>
  )
}

function EventCard({ event }) {
  const tc = TYPE_COLORS[event.type] || TYPE_COLORS.macro
  return (
    <div style={{ background:'#11141e', border:'1px solid #1e2130', borderRadius:'10px', padding:'15px', marginBottom:'10px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'7px', marginBottom:'7px', flexWrap:'wrap' }}>
        <span style={{ ...mono, fontSize:'9px', textTransform:'uppercase', letterSpacing:'0.1em', background:tc.bg, color:tc.text, border:`1px solid ${tc.border}`, padding:'2px 7px', borderRadius:'4px' }}>{tc.label}</span>
        <span style={{ ...mono, fontSize:'10px', color:'#6b7280' }}>{event.when}</span>
      </div>
      <div style={{ fontSize:'14px', fontWeight:'700', color:'#fff', marginBottom:'5px' }}>{event.title}</div>
      <p style={{ margin:'0 0 9px', fontSize:'12px', lineHeight:1.6, color:'#9ca3af' }}>{event.description}</p>
      <div style={{ background:'#07080f', borderRadius:'5px', padding:'9px 11px', marginBottom:'7px' }}>
        <div style={{ ...mono, fontSize:'8px', letterSpacing:'0.15em', color:'#065f46', textTransform:'uppercase', marginBottom:'3px' }}>Economic Impact</div>
        <p style={{ margin:0, fontSize:'12px', lineHeight:1.5, color:'#d1d5db' }}>{event.impact}</p>
      </div>
      <div style={{ background:'#07080f', borderLeft:'2px solid #d97706', borderRadius:'0 5px 5px 0', padding:'9px 11px' }}>
        <div style={{ ...mono, fontSize:'8px', letterSpacing:'0.15em', color:'#d97706', textTransform:'uppercase', marginBottom:'3px' }}>Watch For</div>
        <p style={{ margin:0, fontSize:'12px', lineHeight:1.5, color:'#fde68a' }}>{event.watchFor}</p>
      </div>
    </div>
  )
}

function Section({ section, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ border:'1px solid #1e2130', borderRadius:'11px', overflow:'hidden', marginBottom:'11px', background:'#0c0e18' }}>
      <button onClick={() => setOpen(o => !o)} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 17px', background:'none', border:'none', cursor:'pointer' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'9px' }}>
          <span style={{ fontSize:'20px' }}>{section.flag}</span>
          <span style={{ fontSize:'14px', fontWeight:'700', color:'#fff' }}>{section.region}</span>
          <span style={{ ...mono, fontSize:'10px', color:'#6b7280', border:'1px solid #374151', borderRadius:'999px', padding:'1px 7px' }}>{section.events?.length || 0}</span>
        </div>
        <span style={{ color:'#6b7280', fontSize:'16px' }}>{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div style={{ padding:'0 13px 13px', borderTop:'1px solid #1e2130', paddingTop:'11px' }}>
          {(section.events || []).map((ev, i) => <EventCard key={i} event={ev} />)}
        </div>
      )}
    </div>
  )
}

// ── App ────────────────────────────────────────────────────────────────────────
export default function Home() {
  const [briefing, setBriefing]     = useState(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [triggering, setTriggering] = useState(false)
  const [triggered, setTriggered]   = useState(false)
  const [activeTab, setActiveTab]   = useState('pulse')

  const fetchBriefing = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/briefing')
      if (res.status === 404) setError('no_briefing')
      else if (!res.ok) throw new Error(`Error ${res.status}`)
      else setBriefing(await res.json())
    } catch (e) { setError(e.message) }
    setLoading(false)
  }

  const triggerNow = async () => {
    setTriggering(true)
    try {
      const res = await fetch('/api/generate')
      if (res.ok) { setTriggered(true); setTimeout(() => fetchBriefing(), 5000) }
    } catch {}
    setTriggering(false)
  }

  useEffect(() => { fetchBriefing() }, [])

  const sc = briefing ? (SENTI[briefing.sentiment] || SENTI.Cautious) : null

  const tabs = [
    { id:'pulse',  label:`⚡ Market Pulse${briefing?.marketPulse ? ` (${briefing.marketPulse.length})` : ''}` },
    { id:'news',   label:`📰 Breaking News${briefing?.breakingNews ? ` (${briefing.breakingNews.length})` : ''}` },
    { id:'events', label:'📅 Events' },
  ]

  const Tab = ({ id, label }) => (
    <button onClick={() => setActiveTab(id)} style={{
      ...mono, fontSize:'11px', letterSpacing:'0.03em', padding:'8px 14px', flex:1,
      borderRadius:'6px', border:'none', cursor:'pointer', transition:'all 0.15s', textAlign:'center',
      background: activeTab === id ? '#d97706' : 'transparent',
      color: activeTab === id ? '#fff' : '#6b7280',
      fontWeight: activeTab === id ? '700' : '400',
    }}>{label}</button>
  )

  return (
    <main style={{ minHeight:'100vh', background:'#07080f', fontFamily:'Georgia,serif', color:'#e2e4ed' }}>
      {briefing?.indicators && (
        <div style={{ position:'sticky', top:0, zIndex:50 }}>
          <IndicatorBar indicators={briefing.indicators} />
        </div>
      )}

      <div style={{ maxWidth:'700px', margin:'0 auto', padding:'22px 13px' }}>

        {/* Header */}
        <div style={{ marginBottom:'20px', borderBottom:'1px solid #1e2130', paddingBottom:'15px' }}>
          <div style={{ ...mono, fontSize:'9px', letterSpacing:'0.22em', color:'#d97706', textTransform:'uppercase', marginBottom:'4px' }}>Market Intelligence</div>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'10px', flexWrap:'wrap' }}>
            <div>
              <h1 style={{ margin:'0 0 3px', fontSize:'23px', fontWeight:'700', color:'#fff', lineHeight:1.1 }}>Daily Market Briefing</h1>
              {briefing && <div style={{ ...mono, fontSize:'11px', color:'#6b7280' }}>{briefing.date}{briefing.generatedAt && ` · ${new Date(briefing.generatedAt).toLocaleTimeString('en-AU',{hour:'2-digit',minute:'2-digit'})}`}</div>}
            </div>
            <button onClick={fetchBriefing} style={{ ...mono, fontSize:'11px', background:'none', border:'1px solid #374151', color:'#6b7280', padding:'4px 11px', borderRadius:'6px', cursor:'pointer' }}>↻ Refresh</button>
          </div>
        </div>

        {loading && <div style={{ textAlign:'center', padding:'60px 0', ...mono, fontSize:'13px', color:'#6b7280' }}>Loading briefing…</div>}

        {!loading && error === 'no_briefing' && (
          <div style={{ background:'#0c0e18', border:'1px dashed #374151', borderRadius:'12px', padding:'40px', textAlign:'center' }}>
            <div style={{ fontSize:'38px', marginBottom:'13px' }}>📊</div>
            <div style={{ fontSize:'16px', fontWeight:'700', color:'#fff', marginBottom:'7px' }}>No briefing yet</div>
            <p style={{ fontSize:'13px', color:'#6b7280', margin:'0 0 20px' }}>Cron runs every weekday 7am AEST. Trigger now:</p>
            <button onClick={triggerNow} disabled={triggering||triggered} style={{
              background: triggered ? '#065f46' : 'linear-gradient(135deg,#d97706,#b45309)',
              color:'#fff', border:'none', padding:'11px 26px', borderRadius:'8px',
              ...mono, fontSize:'13px', cursor: triggering ? 'wait' : 'pointer', fontWeight:'700',
            }}>{triggering ? 'Generating…' : triggered ? '✓ Done! Reloading…' : 'Generate Now'}</button>
          </div>
        )}

        {!loading && error && error !== 'no_briefing' && (
          <div style={{ background:'#160b0b', border:'1px solid #7f1d1d', borderRadius:'10px', padding:'14px', color:'#f87171', ...mono, fontSize:'12px' }}>Error: {error}</div>
        )}

        {briefing && !loading && (
          <>
            {/* Sentiment */}
            <div style={{ background:'#0c0e18', border:`1px solid ${sc.bg}`, borderRadius:'11px', padding:'16px', marginBottom:'14px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'9px', marginBottom:'9px', flexWrap:'wrap' }}>
                <span style={{ background:sc.bg, color:sc.color, ...mono, fontSize:'11px', fontWeight:'700', letterSpacing:'0.1em', textTransform:'uppercase', padding:'3px 10px', borderRadius:'6px' }}>
                  {briefing.sentiment}
                </span>
                <span style={{ fontSize:'12px', color:'#9ca3af' }}>— {briefing.sentimentReason}</span>
              </div>
              <div style={{ borderLeft:'3px solid #d97706', paddingLeft:'13px' }}>
                <div style={{ ...mono, fontSize:'9px', letterSpacing:'0.15em', color:'#d97706', textTransform:'uppercase', marginBottom:'4px' }}>Top Insight</div>
                <p style={{ margin:0, fontSize:'13px', lineHeight:1.75, color:'#e5e7eb' }}>{briefing.topInsight}</p>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display:'flex', gap:'3px', background:'#0c0e18', border:'1px solid #1e2130', borderRadius:'10px', padding:'3px', marginBottom:'13px' }}>
              {tabs.map(t => <Tab key={t.id} id={t.id} label={t.label} />)}
            </div>

            {/* Market Pulse tab */}
            {activeTab === 'pulse' && (
              <div>
                <div style={{ ...mono, fontSize:'9px', letterSpacing:'0.15em', color:'#6b7280', textTransform:'uppercase', marginBottom:'12px', paddingLeft:'2px' }}>
                  Flow data · Leverage signals · Institutional positioning · Risk flags
                </div>
                {briefing.marketPulse?.length > 0
                  ? briefing.marketPulse.map((item, i) => <PulseCard key={i} item={item} />)
                  : <div style={{ ...mono, fontSize:'12px', color:'#6b7280', textAlign:'center', padding:'30px' }}>No pulse data.</div>
                }
              </div>
            )}

            {/* Breaking News tab */}
            {activeTab === 'news' && (
              briefing.breakingNews?.length > 0
                ? briefing.breakingNews.map((item, i) => <NewsCard key={i} item={item} />)
                : <div style={{ ...mono, fontSize:'12px', color:'#6b7280', textAlign:'center', padding:'30px' }}>No breaking news.</div>
            )}

            {/* Events tab */}
            {activeTab === 'events' && (briefing.sections || []).map((s, i) => <Section key={i} section={s} defaultOpen={i===0} />)}
          </>
        )}

        <div style={{ ...mono, fontSize:'9px', letterSpacing:'0.1em', color:'#1f2937', textAlign:'center', marginTop:'22px', paddingTop:'13px', borderTop:'1px solid #1e2130' }}>
          AUTO-GENERATED EVERY WEEKDAY · US · ASX · GLOBAL · POWERED BY CLAUDE
        </div>
      </div>
    </main>
  )
}
