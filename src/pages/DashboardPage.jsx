import { useState, useRef, useEffect } from 'react'
import { ChevronDown, ArrowUpRight, Check, MessageSquare, RotateCcw } from 'lucide-react'
import TicketDetailModal from '../components/TicketDetailModal'
import TicketFormModal from '../components/TicketFormModal'
import './DashboardPage.css'
import { apiFetch } from '../api'

const DIVISIONS = ['Operations', 'R&D', 'Marketing', 'Finance', 'Customer Service']
const QUESTION_TYPES = [
  'General', 'Sistem & IT Support', 'Troubleshooting Perangkat',
  'Service Repair', 'Maintenance & Setup', 'Produksi & Operasi',
  'Kebijakan Internal', 'Penggunaan Tools',
]

function FilterDropdown({ label, options, selected, onChange, type = 'checkbox' }) {
  const [open, setOpen] = useState(false)
  const [dropPos, setDropPos] = useState({ top: 0, left: 0 })
  const triggerRef = useRef(null)
  const dropRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        dropRef.current && !dropRef.current.contains(e.target)
      ) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleOpen = () => {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setDropPos({ top: rect.bottom + 6, left: rect.left })
    }
    setOpen(o => !o)
  }

  const toggle = (val) => {
    if (type === 'radio') {
      onChange([val])
    } else {
      onChange(selected.includes(val) ? selected.filter(s => s !== val) : [...selected, val])
    }
  }

  return (
    <div className="th-filter-wrap">
      <span
        ref={triggerRef}
        className={`th-filter-trigger ${open || selected.length ? 'active' : ''}`}
        onClick={handleOpen}
      >
        {label} <ChevronDown size={12} className={open ? 'rotated' : ''} />
        {selected.length > 0 && <span className="filter-dot" />}
      </span>
      {open && (
        <div
          ref={dropRef}
          className="filter-dropdown"
          style={{ position: 'fixed', top: dropPos.top, left: dropPos.left }}
        >
          <div className="filter-reset" onClick={() => onChange([])}>
            <RotateCcw size={11} /> Reset
          </div>
          {options.map(opt => (
            <label key={opt} className="filter-option">
              {type === 'radio' ? (
                <input type="radio" checked={selected.includes(opt)} onChange={() => toggle(opt)} />
              ) : (
                <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} />
              )}
              {opt}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

export default function DashboardPage({ user }) {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [page, setPage] = useState(1)
  const [filterDivisi, setFilterDivisi] = useState([])
  const [filterStatus, setFilterStatus] = useState([])
  const [filterTiket, setFilterTiket] = useState([])
  const rowsPerPage = 10

  const fetchTickets = () => {
    setLoading(true)
    apiFetch('/tickets/')
      .then(r => r.json())
      .then(data => setTickets(Array.isArray(data) ? data : []))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchTickets() }, [])

  // 3.3 — hitung jumlah per kategori dari data real
  const categoryCounts = tickets.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1
    return acc
  }, {})

  // filter pakai field name dari API
  const filteredTickets = tickets.filter(t => {
    if (filterDivisi.length && !filterDivisi.includes(t.division)) return false
    if (filterStatus.length) {
      const isAnswered = t.status !== 'open'
      const isTerjawab = filterStatus.includes('Terjawab') && isAnswered
      const isBelum = filterStatus.includes('Belum Terjawab') && !isAnswered
      if (!isTerjawab && !isBelum) return false
    }
    if (filterTiket.length && !filterTiket.includes(t.category)) return false
    return true
  })

  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / rowsPerPage))
  const pagedTickets = filteredTickets.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  const changeFilter = (setter) => (val) => { setter(val); setPage(1) }

  return (
    <div className="page-content">
      <h1 className="page-title">Dashboard Tiket</h1>

      {/* 3.3 — total dari data real */}
      <div className="total-card">
        <span>Total Pertanyaan</span>
        <span className="total-num">{tickets.length}</span>
      </div>

      {/* 3.3 — kategori dari data real */}
      <div className="categories-grid">
        {QUESTION_TYPES.map(label => (
          <div key={label} className="category-row">
            <span>{label}</span>
            <span className="category-count">{categoryCounts[label] || 0}</span>
          </div>
        ))}
      </div>

      <div className="table-wrap">
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            Memuat tiket...
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>
                  <FilterDropdown label="Tiket" options={QUESTION_TYPES} selected={filterTiket} onChange={changeFilter(setFilterTiket)} />
                </th>
                <th>
                  <FilterDropdown label="Divisi" options={DIVISIONS} selected={filterDivisi} onChange={changeFilter(setFilterDivisi)} />
                </th>
                <th>Email</th>
                <th>Nama</th>
                <th>
                  <FilterDropdown label="Status" options={['Terjawab', 'Belum Terjawab']} selected={filterStatus} onChange={changeFilter(setFilterStatus)} />
                </th>
              </tr>
            </thead>
            <tbody>
              {pagedTickets.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    Tidak ada tiket.
                  </td>
                </tr>
              ) : pagedTickets.map(t => (
                <tr key={t.id}>
                  <td>
                    <div className="ticket-cell">
                      <span className="ticket-type">{t.category}</span>
                      <span className="ticket-q">{t.description}</span>
                    </div>
                  </td>
                  <td><span className="division-badge">{t.division}</span></td>
                  <td className="muted">{t.user_email}</td>
                  <td className="muted">{t.name}</td>
                  <td>
                    <div className="status-cell">
                      {t.status !== 'open' ? (
                        <span className="status-badge answered"><Check size={12} /> Terjawab</span>
                      ) : (
                        <button className="status-badge respon" onClick={() => setSelectedTicket(t)}>
                          <MessageSquare size={12} /> Respon
                        </button>
                      )}
                      <button className="icon-btn" onClick={() => setSelectedTicket(t)}>
                        <ArrowUpRight size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="table-footer">
          <span className="muted">{filteredTickets.length} tiket ditemukan.</span>
          <div className="pagination">
            <span className="muted">Rows per page</span>
            <select className="rows-select">
              <option>10</option><option>25</option><option>50</option>
            </select>
            <span className="muted">Page {page} of {totalPages}</span>
            <div className="page-btns">
              <button onClick={() => setPage(1)}>«</button>
              <button onClick={() => setPage(p => Math.max(1, p - 1))}>‹</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))}>›</button>
              <button onClick={() => setPage(totalPages)}>»</button>
            </div>
          </div>
        </div>
      </div>

      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onRespond={() => {
            setSelectedTicket(null)
            fetchTickets()
          }}
        />
      )}
      {showForm && <TicketFormModal onClose={() => setShowForm(false)} user={user} />}
    </div>
  )
}
