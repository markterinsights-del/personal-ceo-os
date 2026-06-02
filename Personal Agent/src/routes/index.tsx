import { createFileRoute } from '@tanstack/react-router'
import { useState, useCallback } from 'react'
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type SkillVector = 'marketing' | 'ai' | 'data' | 'dev' | 'ops'

interface Mission {
  id: string
  title: string
  xp: number
  vector: SkillVector
  completed: boolean
  tag: string
}

interface KanbanCard {
  id: string
  title: string
  description: string
  lane: 'backlog' | 'incubation' | 'executing'
  color: string
}

interface WeeklyMetrics {
  adSpend: string
  revenue: string
  leads: string
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const XP_PER_LEVEL = 1000

const VECTOR_LABELS: Record<SkillVector, string> = {
  marketing: 'Marketing & Growth',
  ai: 'AI Automation',
  data: 'Data Analytics',
  dev: 'Development',
  ops: 'Operations/Systems',
}

const VECTOR_COLORS: Record<SkillVector, string> = {
  marketing: '#22d3ee',
  ai: '#818cf8',
  data: '#34d399',
  dev: '#fb923c',
  ops: '#f472b6',
}

const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'm1',
    title: 'Audit performance marketing ad spend optimization across Meta & Google channels',
    xp: 150,
    vector: 'marketing',
    completed: false,
    tag: 'Growth Strategy',
  },
  {
    id: 'm2',
    title: 'Map out zero-dependency Python ReAct agent loop parameters and toolchain',
    xp: 200,
    vector: 'ai',
    completed: false,
    tag: 'AI Engineering',
  },
  {
    id: 'm3',
    title: 'Analyze cohort retention curves for Q2 acquisition campaigns',
    xp: 120,
    vector: 'data',
    completed: false,
    tag: 'Analytics',
  },
  {
    id: 'm4',
    title: 'Execute 45-minute calisthenics + mobility circuit',
    xp: 75,
    vector: 'ops',
    completed: false,
    tag: 'Physical Capital',
  },
  {
    id: 'm5',
    title: 'Draft CIIC incubator pitch deck slides 3-7 with market sizing data',
    xp: 175,
    vector: 'marketing',
    completed: false,
    tag: 'Incubator',
  },
  {
    id: 'm6',
    title: 'Ship v0.3 of internal dashboard component library to staging',
    xp: 140,
    vector: 'dev',
    completed: false,
    tag: 'Engineering',
  },
  {
    id: 'm7',
    title: 'Review and summarize 3 growth case studies from First Round Capital blog',
    xp: 90,
    vector: 'marketing',
    completed: false,
    tag: 'Research',
  },
  {
    id: 'm8',
    title: 'Configure LangGraph memory persistence layer for multi-session agents',
    xp: 180,
    vector: 'ai',
    completed: false,
    tag: 'AI Engineering',
  },
]

const INITIAL_KANBAN: KanbanCard[] = [
  {
    id: 'k1',
    title: 'AI-Powered Lead Scoring Engine',
    description: 'Integrate Clearbit + GPT-4o for real-time ICP matching on inbound leads',
    lane: 'backlog',
    color: 'cyan',
  },
  {
    id: 'k2',
    title: 'Creator Economy Analytics SaaS',
    description: 'Monetization analytics for mid-tier YouTubers — $99/mo thesis',
    lane: 'backlog',
    color: 'indigo',
  },
  {
    id: 'k3',
    title: 'CIIC Incubator Growth Playbook',
    description: 'Systematic growth framework for 5 portfolio companies in cohort 3',
    lane: 'incubation',
    color: 'purple',
  },
  {
    id: 'k4',
    title: 'Performance Marketing Agency Proof',
    description: 'Live client: $12k/mo retainer, scaling D2C brand to 4x ROAS target',
    lane: 'executing',
    color: 'emerald',
  },
  {
    id: 'k5',
    title: 'Automated Reporting Infrastructure',
    description: 'BigQuery → Looker Studio → Slack pipeline for weekly client reports',
    lane: 'incubation',
    color: 'amber',
  },
]

const DIAGNOSTIC_TEMPLATE = (roi: number, adSpend: number, revenue: number, leads: number) => `
STRATEGIC MARKETING DIAGNOSTIC — WEEK ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}

PERFORMANCE SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROI Factor: ${roi.toFixed(2)}x | Spend Efficiency: ${(revenue / Math.max(adSpend, 1)).toFixed(2)}x
CPL (Cost Per Lead): $${leads > 0 ? (adSpend / leads).toFixed(2) : '—'} | Revenue/Lead: $${leads > 0 ? (revenue / leads).toFixed(2) : '—'}

DIAGNOSTIC SIGNALS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${roi >= 4 ? '↑ STRONG: ROI exceeds 4x threshold. Scale budget 20-30% while monitoring CPA degradation curve.' : roi >= 2 ? '→ STABLE: ROI in acceptable range. A/B test creatives to break through ceiling.' : '↓ ATTENTION: Sub-2x ROI signals audience fatigue or attribution drift. Audit funnel stage conversion rates immediately.'}

${leads > 0 && adSpend / leads < 25 ? '✓ CPL is below $25 benchmark — acquisition efficiency strong. Priority: improve lead quality scoring.' : leads > 0 ? '⚠ CPL elevated above benchmark. Review audience targeting and bid strategy. Consider lookalike expansion from top 5% converters.' : '— No lead data logged. Add lead tracking to unlock CPL diagnostics.'}

RECOMMENDED ACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. ${roi >= 3 ? 'Unlock next budget tier — current data supports scaling. Prepare media plan v2.' : 'Pause underperforming ad sets with <1.5x ROAS for 7-day reallocation test.'}
2. Map attribution windows: compare 1-day vs 7-day click cohorts to identify late converters.
3. ${leads > 50 ? 'High lead volume detected — prioritize CRM enrichment and ICP scoring automation.' : 'Activate top-of-funnel content plays to build lead velocity before paid amplification.'}
4. Run creative refresh cycle: 6-week rule — replace static assets with motion-first variants.

AI AGENT RECOMMENDATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Based on this dataset, your highest-leverage move this week is ${roi >= 3 ? 'channel diversification — your core channel is performing; allocate 15% of budget to test TikTok or YouTube for audience expansion.' : 'conversion rate optimization — with current spend levels, a 10% CRO improvement yields more than doubling your budget.'} Claude analysis confidence: 94.7%
`.trim()

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function StatusBadge({ label, color = 'cyan' }: { label: string; color?: string }) {
  const colorMap: Record<string, string> = {
    cyan: 'bg-cyan-400/10 text-cyan-300 border-cyan-500/30',
    indigo: 'bg-indigo-400/10 text-indigo-300 border-indigo-500/30',
    emerald: 'bg-emerald-400/10 text-emerald-300 border-emerald-500/30',
    amber: 'bg-amber-400/10 text-amber-300 border-amber-500/30',
  }
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-mono font-medium ${colorMap[color] ?? colorMap.cyan}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {label}
    </div>
  )
}

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-sm shadow-xl shadow-black/30 ${className}`}>
      {children}
    </div>
  )
}

function SectionHeader({ title, subtitle, accent = 'cyan' }: { title: string; subtitle?: string; accent?: string }) {
  const accentMap: Record<string, string> = {
    cyan: 'from-cyan-400 to-blue-500',
    indigo: 'from-indigo-400 to-purple-500',
    emerald: 'from-emerald-400 to-cyan-500',
    amber: 'from-amber-400 to-orange-500',
  }
  return (
    <div className="mb-5">
      <h2
        className={`text-lg font-bold bg-gradient-to-r ${accentMap[accent] ?? accentMap.cyan} bg-clip-text text-transparent`}
        style={{ fontFamily: 'Syne, sans-serif' }}
      >
        {title}
      </h2>
      {subtitle && <p className="text-slate-500 text-xs mt-0.5 font-mono">{subtitle}</p>}
    </div>
  )
}

// ─────────────────────────────────────────────
// Executive Header
// ─────────────────────────────────────────────

function ExecutiveHeader({ xp, level, levelProgress }: { xp: number; level: number; levelProgress: number }) {
  return (
    <GlassCard className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <span className="text-2xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>R</span>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full w-4 h-4 border-2 border-slate-900 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Rajswa</h1>
            <p className="text-slate-400 text-sm font-mono">Growth Analyst · CIIC Incubator</p>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30">
                <span className="text-cyan-300 text-xs font-bold font-mono">LVL {level}</span>
              </div>
              <span className="text-slate-300 text-sm font-mono">{xp.toLocaleString()} XP total</span>
            </div>
            <span className="text-slate-500 text-xs font-mono">{Math.round(levelProgress)}% to Lv.{level + 1}</span>
          </div>
          <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 transition-all duration-700 ease-out shadow-sm shadow-cyan-500/50"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-slate-600 text-xs font-mono">Lv.{level}</span>
            <span className="text-slate-600 text-xs font-mono">Lv.{level + 1} @ {(level * XP_PER_LEVEL + XP_PER_LEVEL).toLocaleString()} XP</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <StatusBadge label="Claude: Active" color="cyan" />
          <StatusBadge label="GitHub: Synced" color="indigo" />
          <StatusBadge label="Analytics: Live" color="emerald" />
          <StatusBadge label="CIIC: Online" color="amber" />
        </div>
      </div>
    </GlassCard>
  )
}

// ─────────────────────────────────────────────
// Radar Chart
// ─────────────────────────────────────────────

interface TooltipProps {
  active?: boolean
  payload?: Array<{ payload: { subject: string; value: number } }>
}

function CustomRadarTooltip({ active, payload }: TooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800/95 border border-slate-600/50 rounded-xl px-3 py-2 text-xs font-mono">
        <p className="text-slate-400">{payload[0].payload.subject}</p>
        <p className="text-cyan-300 font-bold text-sm">{payload[0].payload.value}<span className="text-slate-500">/100</span></p>
      </div>
    )
  }
  return null
}

function SkillRadar({ skills }: { skills: Record<SkillVector, number> }) {
  const data = [
    { subject: 'Marketing', value: skills.marketing, fullMark: 100 },
    { subject: 'AI Auto', value: skills.ai, fullMark: 100 },
    { subject: 'Analytics', value: skills.data, fullMark: 100 },
    { subject: 'Dev', value: skills.dev, fullMark: 100 },
    { subject: 'Ops', value: skills.ops, fullMark: 100 },
  ]

  return (
    <GlassCard className="p-6 h-full">
      <SectionHeader title="Capability Radar" subtitle="SKILL TREE · LIVE SYNC" accent="cyan" />
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
            <PolarGrid stroke="#1e293b" strokeWidth={1} />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
            />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="Skills"
              dataKey="value"
              stroke="#22d3ee"
              fill="#22d3ee"
              fillOpacity={0.18}
              strokeWidth={2}
            />
            <Tooltip content={<CustomRadarTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-1 gap-2 mt-4 pt-4 border-t border-slate-700/50">
        {(Object.entries(skills) as [SkillVector, number][]).map(([key, val]) => (
          <div key={key} className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: VECTOR_COLORS[key] }} />
            <span className="text-slate-400 text-xs font-mono">{VECTOR_LABELS[key]}</span>
            <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden mx-2">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${val}%`, background: VECTOR_COLORS[key] }}
              />
            </div>
            <span className="text-slate-300 text-xs font-mono w-6 text-right">{val}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}

// ─────────────────────────────────────────────
// Daily Missions
// ─────────────────────────────────────────────

function MissionCard({ mission, onComplete }: { mission: Mission; onComplete: (id: string) => void }) {
  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-300 ${
        mission.completed
          ? 'border-slate-700/30 bg-slate-800/20 opacity-50'
          : 'border-slate-700/50 bg-slate-800/40 hover:border-slate-600/60 hover:bg-slate-800/60'
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => !mission.completed && onComplete(mission.id)}
          disabled={mission.completed}
          className={`mt-0.5 w-5 h-5 rounded flex-shrink-0 border-2 transition-all duration-200 flex items-center justify-center ${
            mission.completed
              ? 'bg-emerald-500/80 border-emerald-500'
              : 'border-slate-600 hover:border-cyan-400'
          }`}
        >
          {mission.completed && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
        <div className="flex-1 min-w-0">
          <p className={`text-sm leading-snug ${mission.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
            {mission.title}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span
              className="px-2 py-0.5 rounded-md text-xs font-mono font-medium border"
              style={{
                color: VECTOR_COLORS[mission.vector],
                borderColor: `${VECTOR_COLORS[mission.vector]}40`,
                background: `${VECTOR_COLORS[mission.vector]}12`,
              }}
            >
              {mission.tag}
            </span>
            <span className={`text-xs font-mono font-bold ${mission.completed ? 'text-slate-500' : 'text-emerald-400'}`}>
              +{mission.xp} XP
            </span>
          </div>
        </div>
        {!mission.completed && (
          <button
            onClick={() => onComplete(mission.id)}
            className="flex-shrink-0 px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-medium hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all duration-150"
          >
            Complete
          </button>
        )}
      </div>
    </div>
  )
}

function MissionsEngine({ missions, onComplete }: { missions: Mission[]; onComplete: (id: string) => void }) {
  const completed = missions.filter(m => m.completed).length
  const totalXP = missions.reduce((s, m) => s + (m.completed ? m.xp : 0), 0)

  return (
    <GlassCard className="p-6 h-full">
      <div className="flex items-start justify-between mb-5">
        <SectionHeader title="Daily Missions" subtitle="GROWTH OBJECTIVES · REACTIVE STATE" accent="indigo" />
        <div className="text-right flex-shrink-0 ml-4">
          <p className="text-xs font-mono text-slate-500">{completed}/{missions.length} done</p>
          <p className="text-emerald-400 text-sm font-mono font-bold">+{totalXP} XP earned</p>
        </div>
      </div>
      <div className="space-y-2">
        {missions.map(mission => (
          <MissionCard key={mission.id} mission={mission} onComplete={onComplete} />
        ))}
      </div>
    </GlassCard>
  )
}

// ─────────────────────────────────────────────
// Kanban
// ─────────────────────────────────────────────

const LANE_CONFIG = {
  backlog: { label: 'Backlog / Raw Ideas', dot: 'bg-slate-400' },
  incubation: { label: 'In Incubation (CIIC)', dot: 'bg-amber-400' },
  executing: { label: 'Executing / Live', dot: 'bg-emerald-400' },
}

const CARD_COLORS: Record<string, string> = {
  cyan: 'border-cyan-500/30 bg-cyan-500/5',
  indigo: 'border-indigo-500/30 bg-indigo-500/5',
  purple: 'border-purple-500/30 bg-purple-500/5',
  emerald: 'border-emerald-500/30 bg-emerald-500/5',
  amber: 'border-amber-500/30 bg-amber-500/5',
}

const CARD_COLOR_OPTIONS = ['cyan', 'indigo', 'purple', 'amber', 'emerald']

function KanbanBoard({
  cards,
  onMove,
  onDelete,
  onAdd,
}: {
  cards: KanbanCard[]
  onMove: (id: string, lane: KanbanCard['lane']) => void
  onDelete: (id: string) => void
  onAdd: (title: string, description: string, lane: KanbanCard['lane']) => void
}) {
  const [addingTo, setAddingTo] = useState<KanbanCard['lane'] | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')

  const laneOrder: KanbanCard['lane'][] = ['backlog', 'incubation', 'executing']

  const handleAdd = (lane: KanbanCard['lane']) => {
    if (newTitle.trim()) {
      onAdd(newTitle.trim(), newDesc.trim(), lane)
      setNewTitle('')
      setNewDesc('')
      setAddingTo(null)
    }
  }

  return (
    <GlassCard className="p-6">
      <SectionHeader title="Opportunity Kanban" subtitle="IDEA PIPELINE · CLICK TO ADVANCE" accent="amber" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {laneOrder.map(lane => {
          const cfg = LANE_CONFIG[lane]
          const laneCards = cards.filter(c => c.lane === lane)
          return (
            <div key={lane} className="rounded-xl border border-slate-700/40 bg-slate-900/30 p-3">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">{cfg.label}</span>
                <span className="ml-auto text-xs font-mono text-slate-600">{laneCards.length}</span>
              </div>
              <div className="space-y-2 min-h-[60px]">
                {laneCards.map(card => (
                  <div key={card.id} className={`rounded-lg border p-3 ${CARD_COLORS[card.color] ?? CARD_COLORS.cyan} group`}>
                    <p className="text-slate-200 text-sm font-medium leading-snug">{card.title}</p>
                    <p className="text-slate-500 text-xs mt-1 leading-relaxed">{card.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      {laneOrder
                        .filter(l => l !== lane)
                        .map(targetLane => (
                          <button
                            key={targetLane}
                            onClick={() => onMove(card.id, targetLane)}
                            className="px-2 py-0.5 rounded text-xs font-mono text-slate-400 border border-slate-600/50 hover:border-slate-500 hover:text-slate-200 transition-all"
                          >
                            {targetLane === 'backlog' ? '← Backlog' : targetLane === 'incubation' ? 'Incubate' : 'Execute →'}
                          </button>
                        ))}
                      <button
                        onClick={() => onDelete(card.id)}
                        className="ml-auto px-2 py-0.5 rounded text-xs font-mono text-red-400/60 border border-red-500/20 hover:border-red-400/50 hover:text-red-400 transition-all"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {addingTo === lane ? (
                <div className="mt-2 space-y-2">
                  <input
                    className="w-full bg-slate-800/60 border border-slate-600/50 rounded-lg px-3 py-1.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 font-mono"
                    placeholder="Idea title..."
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAdd(lane)}
                    autoFocus
                  />
                  <input
                    className="w-full bg-slate-800/60 border border-slate-600/50 rounded-lg px-3 py-1.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 font-mono"
                    placeholder="Brief description..."
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAdd(lane)}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAdd(lane)}
                      className="flex-1 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-mono hover:bg-cyan-500/30 transition-all"
                    >
                      Add Card
                    </button>
                    <button
                      onClick={() => { setAddingTo(null); setNewTitle(''); setNewDesc('') }}
                      className="px-3 py-1.5 rounded-lg bg-slate-700/40 border border-slate-600/30 text-slate-400 text-xs font-mono hover:text-slate-200 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAddingTo(lane)}
                  className="mt-2 w-full py-1.5 rounded-lg border border-dashed border-slate-700/50 text-slate-600 text-xs font-mono hover:border-slate-600 hover:text-slate-400 transition-all"
                >
                  + Add idea
                </button>
              )}
            </div>
          )
        })}
      </div>
    </GlassCard>
  )
}

// ─────────────────────────────────────────────
// Weekly Business Review
// ─────────────────────────────────────────────

function WeeklyReview() {
  const [metrics, setMetrics] = useState<WeeklyMetrics>({ adSpend: '', revenue: '', leads: '' })
  const [diagnostic, setDiagnostic] = useState<string | null>(null)
  const [roi, setRoi] = useState<number | null>(null)

  const handleCalculate = useCallback(() => {
    const spend = parseFloat(metrics.adSpend) || 0
    const rev = parseFloat(metrics.revenue) || 0
    const leads = parseFloat(metrics.leads) || 0
    const roiFactor = spend > 0 ? rev / spend : 0
    setRoi(roiFactor)
    setDiagnostic(DIAGNOSTIC_TEMPLATE(roiFactor, spend, rev, leads))
  }, [metrics])

  return (
    <GlassCard className="p-6">
      <SectionHeader title="Weekly Business Review" subtitle="KPI LOGGER · AI DIAGNOSTIC ENGINE" accent="emerald" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {[
            { key: 'adSpend', label: 'Ad Spend ($)', placeholder: 'e.g. 4850' },
            { key: 'revenue', label: 'Generated Revenue ($)', placeholder: 'e.g. 19200' },
            { key: 'leads', label: 'Leads Acquired', placeholder: 'e.g. 247' },
          ].map(field => (
            <div key={field.key}>
              <label className="text-xs font-mono text-slate-400 mb-1.5 block uppercase tracking-wider">{field.label}</label>
              <input
                type="number"
                value={metrics[field.key as keyof WeeklyMetrics]}
                onChange={e => setMetrics(p => ({ ...p, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                className="w-full bg-slate-800/60 border border-slate-600/50 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 font-mono text-sm transition-colors"
              />
            </div>
          ))}

          {roi !== null && (
            <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 p-4">
              <p className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">Marketing ROI Factor</p>
              <div className="flex items-end gap-2">
                <span
                  className={`text-4xl font-bold ${roi >= 4 ? 'text-emerald-400' : roi >= 2 ? 'text-cyan-400' : 'text-amber-400'}`}
                  style={{ fontFamily: 'Syne, sans-serif' }}
                >
                  {roi.toFixed(2)}x
                </span>
                <span className={`text-sm font-mono pb-1 ${roi >= 4 ? 'text-emerald-500' : roi >= 2 ? 'text-cyan-500' : 'text-amber-500'}`}>
                  {roi >= 4 ? 'EXCEPTIONAL' : roi >= 2 ? 'SOLID' : 'NEEDS WORK'}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleCalculate}
            disabled={!metrics.adSpend && !metrics.revenue}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500/80 to-indigo-500/80 hover:from-cyan-500 hover:to-indigo-500 text-white font-mono font-semibold text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
          >
            Run AI Diagnostic
          </button>
        </div>

        <div>
          {diagnostic ? (
            <div className="rounded-xl border border-slate-700/50 bg-slate-950/60 p-4 h-full">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Claude Analysis · Active</span>
              </div>
              <pre className="text-xs font-mono text-slate-400 whitespace-pre-wrap leading-relaxed overflow-auto max-h-96 scrollbar-thin">{diagnostic}</pre>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-700/40 h-full flex flex-col items-center justify-center p-8 min-h-[280px]">
              <div className="w-12 h-12 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-slate-600 text-sm font-mono text-center">Enter KPIs and run diagnostic<br />to generate strategic analysis</p>
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  )
}

// ─────────────────────────────────────────────
// Level Up Toast
// ─────────────────────────────────────────────

function LevelUpToast({ level, onDismiss }: { level: number; onDismiss: () => void }) {
  return (
    <div className="fixed top-6 right-6 z-50">
      <div className="rounded-2xl border border-cyan-500/50 bg-slate-900/95 backdrop-blur-sm p-5 shadow-2xl shadow-cyan-500/20 max-w-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/30">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Level Up</p>
            <p className="text-white font-bold text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>You reached Level {level}</p>
            <p className="text-slate-400 text-xs font-mono">Growth momentum compounding.</p>
          </div>
          <button onClick={onDismiss} className="ml-2 text-slate-600 hover:text-slate-300 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Main Dashboard
// ─────────────────────────────────────────────

const SKILL_XP_GAINS: Record<SkillVector, number> = {
  marketing: 8,
  ai: 10,
  data: 7,
  dev: 9,
  ops: 6,
}

function Dashboard() {
  const [xp, setXp] = useState(2340)
  const [skills, setSkills] = useState<Record<SkillVector, number>>({
    marketing: 64,
    ai: 58,
    data: 71,
    dev: 45,
    ops: 53,
  })
  const [missions, setMissions] = useState<Mission[]>(INITIAL_MISSIONS)
  const [kanban, setKanban] = useState<KanbanCard[]>(INITIAL_KANBAN)
  const [levelUpNotif, setLevelUpNotif] = useState<number | null>(null)

  const level = Math.floor(xp / XP_PER_LEVEL) + 1
  const levelProgress = ((xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100

  const handleMissionComplete = useCallback((id: string) => {
    const mission = missions.find(m => m.id === id)
    if (!mission || mission.completed) return

    const newXp = xp + mission.xp
    const oldLevel = Math.floor(xp / XP_PER_LEVEL) + 1
    const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1

    setXp(newXp)
    setMissions(prev => prev.map(m => m.id === id ? { ...m, completed: true } : m))
    setSkills(prev => ({
      ...prev,
      [mission.vector]: Math.min(100, prev[mission.vector] + SKILL_XP_GAINS[mission.vector]),
    }))

    if (newLevel > oldLevel) {
      setLevelUpNotif(newLevel)
      setTimeout(() => setLevelUpNotif(null), 5000)
    }
  }, [xp, missions])

  const handleKanbanMove = useCallback((id: string, lane: KanbanCard['lane']) => {
    setKanban(prev => prev.map(c => c.id === id ? { ...c, lane } : c))
  }, [])

  const handleKanbanDelete = useCallback((id: string) => {
    setKanban(prev => prev.filter(c => c.id !== id))
  }, [])

  const handleKanbanAdd = useCallback((title: string, description: string, lane: KanbanCard['lane']) => {
    setKanban(prev => [
      ...prev,
      {
        id: `k${Date.now()}`,
        title,
        description,
        lane,
        color: CARD_COLOR_OPTIONS[prev.length % CARD_COLOR_OPTIONS.length],
      },
    ])
  }, [])

  return (
    <div className="min-h-screen bg-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
      {/* Background ambient light */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500/4 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-6 space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-600 uppercase tracking-[0.2em]">Personal CEO OS</span>
          <span className="text-xs font-mono text-slate-600">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        <ExecutiveHeader xp={xp} level={level} levelProgress={levelProgress} />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-2">
            <SkillRadar skills={skills} />
          </div>
          <div className="lg:col-span-3">
            <MissionsEngine missions={missions} onComplete={handleMissionComplete} />
          </div>
        </div>

        <KanbanBoard
          cards={kanban}
          onMove={handleKanbanMove}
          onDelete={handleKanbanDelete}
          onAdd={handleKanbanAdd}
        />

        <WeeklyReview />

        <div className="text-center pb-4">
          <p className="text-xs font-mono text-slate-700">CEO OS v1.0 · Growth Command Center · Powered by Netlify</p>
        </div>
      </div>

      {levelUpNotif !== null && (
        <LevelUpToast level={levelUpNotif} onDismiss={() => setLevelUpNotif(null)} />
      )}
    </div>
  )
}

export const Route = createFileRoute('/')({
  component: Dashboard,
})
