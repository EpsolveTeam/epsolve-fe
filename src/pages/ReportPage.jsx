import { useState, useRef, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ChevronDown, Share2, RotateCcw } from 'lucide-react'
import ShareModal from '../components/ShareModal'
import { apiFetch } from '../api'
import './ReportPage.css'

const SORT_OPTIONS = ['Frekuensi pada Chatbot', 'Frekuensi pada Tiket', 'Eskalasi ke Tiket']

function SortDropdown({ sortBy, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="th-filter-wrap" ref={ref}>
      <button className={`sort-trigger-btn ${open || sortBy ? 'active' : ''}`} onClick={() => setOpen(o => !o)}>
        <span>{sortBy || 'Frekuensi pada Chatbot'}</span>
        <span className="sort-arrows-icon">⇅</span>
      </button>
      {open && (
        <div className="filter-dropdown sort-dropdown-right">
          <div className="sort-dropdown-label">Urutkan Berdasarkan:</div>
          {SORT_OPTIONS.map(opt => (
            <div
              key={opt}
              className={`sort-dropdown-item ${sortBy === opt ? 'selected' : ''}`}
              onClick={() => { onChange(opt); setOpen(false) }}
            >
              <span>{opt}</span>
              <span className="sort-arrows-icon">⇅</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const PERIOD_MAP = {
  '3months': '3m',
  '30days': '30d',
  '7days': '7d'
}

const StatCard = ({ label, value, delta, deltaDir, note }) => {
  const trendIcon = deltaDir === 'up'
    ? <TrendingUp size={14} className="trend-up" />
    : deltaDir === 'down'
      ? <TrendingDown size={14} className="trend-down" />
      : <Minus size={14} className="trend-flat" />

  const deltaIcon = deltaDir === 'up'
    ? <TrendingUp size={11} />
    : deltaDir === 'down'
      ? <TrendingDown size={11} />
      : <Minus size={11} />

  const deltaClass = deltaDir === 'up' ? 'delta-up' : deltaDir === 'down' ? 'delta-down' : 'delta-flat'

  const deltaDisplay = delta && delta !== '—'
    ? `${deltaDir === 'up' ? '+' : deltaDir === 'down' ? '-' : ''}${delta}`
    : delta

  return (
    <div className="stat-card">
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        <span className={`stat-trend ${deltaClass}`}>
          {trendIcon}
          {deltaDisplay}
        </span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-note">{note}</div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="stat-card" style={{ opacity: 0.4 }}>
      <div style={{ height: 14, background: '#333', borderRadius: 4, width: '60%', marginBottom: 8 }} />
      <div style={{ height: 28, background: '#333', borderRadius: 4, width: '40%', marginBottom: 8 }} />
      <div style={{ height: 12, background: '#333', borderRadius: 4, width: '80%' }} />
    </div>
  )
}

export default function ReportPage() {
  const [period, setPeriod] = useState('3months')
  const [showShare, setShowShare] = useState(false)
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState(null)

  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    apiFetch(`/analytics/summary?period=${PERIOD_MAP[period]}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(data => setAnalytics(data))
      .catch(err => setError(err.message || 'Gagal memuat data analitik'))
      .finally(() => setLoading(false))
  }, [period])

  const chartData = analytics?.chart_data?.map(d => ({
    date: new Date(d.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
    v: d.count,
  })) ?? []

  const problemFrequency = analytics?.problem_frequency ?? []

  const sortedQuestions = [...problemFrequency].sort((a, b) => {
    if (sortBy === 'Frekuensi pada Chatbot') return b.chat_count - a.chat_count
    if (sortBy === 'Frekuensi pada Tiket') return b.ticket_count - a.ticket_count
    if (sortBy === 'Eskalasi ke Tiket') return parseFloat(b.escalation_rate) - parseFloat(a.escalation_rate)
    return 0
  })

  const rowsPerPage = 10
  const totalPages = Math.max(1, Math.ceil(sortedQuestions.length / rowsPerPage))
  const pagedQuestions = sortedQuestions.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  const cm = analytics?.chatbot_metrics
  const tm = analytics?.ticket_metrics

  const periodLabel = { '3months': '3 bulan', '30days': '30 hari', '7days': '7 hari' }[period]

  const dateRange = (() => {
    const days = { '3months': 90, '30days': 30, '7days': 7 }[period]
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days)
    const fmt = d => d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    return `${fmt(start)} – ${fmt(end)}`
  })()

  return (
    <div className="page-content">
      <div className="report-topbar">
        <div>
          <h1 className="page-title" style={{ marginBottom: 2 }}>Analysis Report</h1>
          <span className="muted" style={{ fontSize: 12.5 }}>Analisis selama periode {periodLabel}</span>
        </div>
        <div className="report-controls">
          <div className="period-tabs">
            {[['3months', 'Last 3 months'], ['30days', 'Last 30 days'], ['7days', 'Last 7 days']].map(([k, l]) => (
              <button key={k} className={`period-tab ${period === k ? 'active' : ''}`} onClick={() => { setPeriod(k); setPage(1) }}>{l}</button>
            ))}
          </div>
          <button className="btn-share" onClick={() => setShowShare(true)}>
            <Share2 size={14} /> Bagikan Laporan Periode Ini
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          background: '#3b1212', border: '1px solid #7f1d1d', borderRadius: 8,
          padding: '12px 16px', marginBottom: 16, color: '#fca5a5', fontSize: 13
        }}>
          ⚠️ {error}
        </div>
      )}

      <section className="report-section">
        <h2 className="section-title">Interaksi Chatbot</h2>
        <div className="stats-grid">
          {loading ? (
            <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
          ) : (
            <>
              <StatCard
                label="Total Pertanyaan yang Masuk"
                value={cm ? cm.total_sessions?.toLocaleString('id-ID') : '—'}
                delta={cm?.sessions_trend?.value !== undefined ? `${Math.abs(cm.sessions_trend.value)}%` : '—'}
                deltaDir={cm?.sessions_trend?.direction ?? 'down'}
                note={cm?.sessions_trend?.text ?? ''}
              />
              <StatCard
                label="Total Interaksi Chatbot"
                value={cm ? cm.total_interactions?.toLocaleString('id-ID') : '—'}
                delta={cm?.interactions_trend?.value !== undefined ? `${Math.abs(cm.interactions_trend.value)}%` : '—'}
                deltaDir={cm?.interactions_trend?.direction ?? 'up'}
                note={cm?.interactions_trend?.text ?? ''}
              />
              <StatCard
                label="Presentase Penyelesaian Tanpa Tiket"
                value={cm ? `${cm.resolution_rate}%` : '—'}
                delta={cm?.resolution_trend?.value !== undefined ? `${Math.abs(cm.resolution_trend.value)}%` : '—'}
                deltaDir={cm?.resolution_trend?.direction ?? 'up'}
                note={cm?.resolution_trend?.text ?? ''}
              />
            </>
          )}
        </div>
      </section>

      <section className="report-section">
        <h2 className="section-title">Tiket Helpdesk</h2>
        <div className="stats-grid">
          {loading ? (
            <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
          ) : (
            <>
              <StatCard
                label="Total Eskalasi ke Tiket"
                value={tm ? tm.total_escalations.toLocaleString('id-ID') : '—'}
                delta={tm?.escalations_trend?.value !== undefined ? `${Math.abs(tm.escalations_trend.value)}%` : '—'}
                deltaDir={tm?.escalations_trend?.direction ?? 'down'}
                note={tm?.escalations_trend?.text ?? ''}
              />
              <StatCard
                label="Persentase Tiket Terselesaikan"
                value={tm ? `${tm.resolution_rate}%` : '—'}
                delta={tm?.resolution_trend?.value !== undefined ? `${Math.abs(tm.resolution_trend.value)}%` : '—'}
                deltaDir={tm?.resolution_trend?.direction ?? 'up'}
                note={tm?.resolution_trend?.text ?? ''}
              />
              <StatCard
                label="Rata-rata Waktu Penyelesaian"
                value={tm?.avg_resolution_time ?? '—'}
                delta={tm?.avg_resolution_time_trend?.value !== undefined ? `${Math.abs(tm.avg_resolution_time_trend.value)}%` : '—'}
                deltaDir={tm?.avg_resolution_time_trend?.direction ?? 'up'}
                note={tm?.avg_resolution_time_trend?.text ?? ''}
              />
            </>
          )}
        </div>
      </section>

      <section className="report-section">
        <h2 className="section-title">Tren Interaksi &amp; Tiket</h2>
        <div className="chart-card">
          <div className="chart-label muted" style={{ fontSize: 12, marginBottom: 8 }}>Total for the last {periodLabel}</div>
          {loading ? (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: 13 }}>
              Memuat grafik…
            </div>
          ) : chartData.length === 0 ? (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: 13 }}>
              Tidak ada data untuk periode ini
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#888' }}
                  itemStyle={{ color: '#f0f0f0' }}
                />
                <Area type="monotone" dataKey="v" stroke="#6366f1" strokeWidth={2} fill="url(#areaGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section className="report-section">
        <div className="section-topbar">
          <h2 className="section-title" style={{ marginBottom: 0 }}>Jenis Pertanyaan</h2>
          <SortDropdown sortBy={sortBy} onChange={setSortBy} />
        </div>

        <div className="table-wrap question-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Jenis Pertanyaan</th>
                <th>Frekuensi pada Chatbot</th>
                <th>Frekuensi pada Tiket</th>
                <th>Eskalasi ke Tiket</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: '#555', padding: '24px 0' }}>Memuat data…</td>
                </tr>
              ) : pagedQuestions.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: '#555', padding: '24px 0' }}>Tidak ada data</td>
                </tr>
              ) : (
                pagedQuestions.map((q, i) => (
                  <tr key={q.category ?? i}>
                    <td>{q.category}</td>
                    <td>{q.chat_count}</td>
                    <td>{q.ticket_count}</td>
                    <td>{q.escalation_rate}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="table-footer question-table-footer">
          <span className="muted">Rows per page</span>
          <select className="rows-select"><option>10</option><option>25</option></select>
          <span className="muted">Page {page} of {totalPages}</span>
          <div className="page-btns">
            <button onClick={() => setPage(1)}>«</button>
            <button onClick={() => setPage(p => Math.max(1, p - 1))}>‹</button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))}>›</button>
            <button onClick={() => setPage(totalPages)}>»</button>
          </div>
        </div>
      </section>

      {showShare && <ShareModal onClose={() => setShowShare(false)} apiPeriod={PERIOD_MAP[period]} periodLabel={periodLabel} dateRange={dateRange} />}
    </div>
  )
}