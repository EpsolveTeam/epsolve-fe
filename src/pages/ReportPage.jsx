import { useState, useRef, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, ArrowUpRight, ChevronDown, Share2, RotateCcw } from 'lucide-react'
import ShareModal from '../components/ShareModal'
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

const chartData = [
  { date: 'Apr 2', v: 820 }, { date: 'Apr 8', v: 680 }, { date: 'Apr 14', v: 750 },
  { date: 'Apr 21', v: 900 }, { date: 'Apr 28', v: 1100 }, { date: 'May 5', v: 850 },
  { date: 'May 12', v: 780 }, { date: 'May 19', v: 920 }, { date: 'May 25', v: 860 },
  { date: 'Jun 2', v: 940 }, { date: 'Jun 8', v: 1050 }, { date: 'Jun 15', v: 980 },
  { date: 'Jun 22', v: 1080 }, { date: 'Jun 30', v: 1200 },
]

const questionTypes = [
  { type: 'Backup Data', chatbot: 15, tiket: 4, eskalasi: '26.7%' },
  { type: 'Pemecahan Masalah Jaringan', chatbot: 12, tiket: 3, eskalasi: '20.0%' },
  { type: 'Pemulihan Sistem Operasi', chatbot: 11, tiket: 3, eskalasi: '21.4%' },
  { type: 'Diagnosa Perangkat Keras', chatbot: 17, tiket: 5, eskalasi: '29.4%' },
  { type: 'Konfigurasi Sistem', chatbot: 20, tiket: 6, eskalasi: '30.0%' },
  { type: 'Troubleshooting Perangkat', chatbot: 18, tiket: 5, eskalasi: '27.7%' },
  { type: 'Instalasi Software', chatbot: 22, tiket: 7, eskalasi: '31.8%' },
  { type: 'Pengaturan Keamanan', chatbot: 14, tiket: 5, eskalasi: '26.3%' },
  { type: 'Upgrade Hardware', chatbot: 9, tiket: 2, eskalasi: '18.2%' },
  { type: 'Pengelolaan Database', chatbot: 13, tiket: 4, eskalasi: '23.5%' },
]

const StatCard = ({ label, value, delta, deltaDir, note }) => (
  <div className="stat-card">
    <div className="stat-top">
      <span className="stat-label">{label}</span>
      {deltaDir === 'up' ? <TrendingUp size={14} className="trend-up" /> : <TrendingDown size={14} className="trend-down" />}
    </div>
    <div className="stat-value">{value}</div>
    <div className="stat-meta">
      <span className={deltaDir === 'up' ? 'delta-up' : 'delta-down'}>
        {deltaDir === 'up' ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
        {delta}
      </span>
    </div>
    <div className="stat-note">{note}</div>
  </div>
)

export default function ReportPage() {
  const [period, setPeriod] = useState('3months')
  const [showShare, setShowShare] = useState(false)
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState(null)
  const totalPages = Math.ceil(68 / 10)

  const sortedQuestions = [...questionTypes].sort((a, b) => {
    if (sortBy === 'Frekuensi pada Chatbot') return b.chatbot - a.chatbot
    if (sortBy === 'Frekuensi pada Tiket') return b.tiket - a.tiket
    if (sortBy === 'Eskalasi ke Tiket') return parseFloat(b.eskalasi) - parseFloat(a.eskalasi)
    return 0
  })

  return (
    <div className="page-content">
      <div className="report-topbar">
        <div>
          <h1 className="page-title" style={{marginBottom:2}}>Analysis Report</h1>
          <span className="muted" style={{fontSize:12.5}}>Analisis selama periode 3 bulan</span>
        </div>
        <div className="report-controls">
          <div className="period-tabs">
            {[['3months','Last 3 months'],['30days','Last 30 days'],['7days','Last 7 days']].map(([k,l]) => (
              <button key={k} className={`period-tab ${period===k?'active':''}`} onClick={() => setPeriod(k)}>{l}</button>
            ))}
          </div>
          <button className="btn-share" onClick={() => setShowShare(true)}>
            <Share2 size={14} /> Bagikan Laporan Periode Ini
          </button>
        </div>
      </div>

      <section className="report-section">
        <h2 className="section-title">Interaksi Chatbot</h2>
        <div className="stats-grid">
          <StatCard label="Total pertanyaan yang masuk" value="1.234" delta="+12.5%" deltaDir="up" note="Meningkat 12.5% dibanding periode sebelumnya" />
          <StatCard label="Total interaksi chatbot" value="1.234" delta="-20%" deltaDir="down" note="Menurun 20% dibanding periode sebelumnya" />
          <StatCard label="Persentase penyelesaian tanpa tiket" value="78%" delta="+12.5%" deltaDir="up" note="Meningkat 12.5% dibanding periode sebelumnya" />
        </div>
      </section>

      <section className="report-section">
        <h2 className="section-title">Tiket Helpdesk</h2>
        <div className="stats-grid">
          <StatCard label="Total eskalasi ke tiket (tiket masuk)" value="10" delta="-20%" deltaDir="down" note="Menurun 20% dibanding periode sebelumnya" />
          <StatCard label="Persentase tiket yang terselesaikan" value="76%" delta="+12.5%" deltaDir="up" note="Meningkat 12.5% dibanding periode sebelumnya" />
          <StatCard label="Rata-rata waktu penyelesaian tiket" value="03:12:33" delta="+12.5%" deltaDir="up" note="Meningkat 12.5% dibanding periode sebelumnya" />
        </div>
      </section>

      <section className="report-section">
        <h2 className="section-title">Total Pengguna Aktif</h2>
        <div className="chart-card">
          <div className="chart-label muted" style={{fontSize:12, marginBottom:8}}>Total for the last 3 months</div>
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
        </div>
      </section>

      <section className="report-section">
        <div className="section-topbar">
          <h2 className="section-title" style={{marginBottom:0}}>Jenis Pertanyaan</h2>
          <SortDropdown sortBy={sortBy} onChange={setSortBy} />
        </div>

        <div className="table-wrap">
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
              {sortedQuestions.map(q => (
                <tr key={q.type}>
                  <td>{q.type}</td>
                  <td>{q.chatbot}</td>
                  <td>{q.tiket}</td>
                  <td>{q.eskalasi}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="table-footer">
            <span className="muted">Rows per page</span>
            <select className="rows-select"><option>10</option><option>25</option></select>
            <span className="muted">Page {page} of {totalPages}</span>
            <div className="page-btns">
              <button onClick={() => setPage(1)}>«</button>
              <button onClick={() => setPage(p => Math.max(1,p-1))}>‹</button>
              <button onClick={() => setPage(p => Math.min(totalPages,p+1))}>›</button>
              <button onClick={() => setPage(totalPages)}>»</button>
            </div>
          </div>
        </div>
      </section>

      {showShare && <ShareModal onClose={() => setShowShare(false)} />}
    </div>
  )
}
