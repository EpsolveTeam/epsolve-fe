import { useState, useRef, useEffect } from 'react'
import { ChevronDown, ArrowUpRight, Check, MessageSquare, RotateCcw } from 'lucide-react'
import TicketDetailModal from '../components/TicketDetailModal'
import TicketFormModal from '../components/TicketFormModal'
import './DashboardPage.css'

const categories = [
  { label: 'General', count: 10 },
  { label: 'Troubleshooting Perangkat', count: 5 },
  { label: 'Service Repair', count: 12 },
  { label: 'Sistem & IT Support', count: 11 },
  { label: 'Maintenance & Setup', count: 4 },
  { label: 'Produksi & Operasional', count: 8 },
  { label: 'Kebijakan Internal', count: 3 },
  { label: 'Penggunaan Tools', count: 4 },
]

const tickets = [
  { id: 1, type: 'Sistem & IT Support', question: 'Printer di ruangan saya tidak bisa digunakan melalui jaringan. Status di komputer "offline", padahal printer menyala. Sudah coba restart tapi masih tidak bisa. Mohon bantuannya.', division: 'Operations', email: 'email@gmail.com', name: 'namadiasiapa', status: 'respon', answered: false },
  { id: 2, type: 'Troubleshooting Perangkat', question: 'Printer tidak merespon saat diberi perintah cetak, apa penyebabnya?', division: 'R&D', email: 'email@gmail.com', name: 'namadiasiapa', status: 'respon', answered: false },
  { id: 3, type: 'Troubleshooting Perangkat', question: 'Kenapa hasil print bergaris atau buram?', division: 'Marketing', email: 'email@gmail.com', name: 'namadiasiapa', status: 'respon', answered: false },
  { id: 4, type: 'Service Repair', question: 'Bagaimana prosedur pengajuan perbaikan perangkat?', division: 'Finance', email: 'email@gmail.com', name: 'namadiasiapa', status: 'respon', answered: false },
  { id: 5, type: 'Maintenance & Setup', question: 'Bagaimana cara instalasi projector baru di jaringan kantor?', division: 'Customer Service', email: 'email@gmail.com', name: 'namadiasiapa', status: 'respon', answered: false },
  { id: 6, type: 'Maintenance & Setup', question: 'Bagaimana cara update firmware perangkat?', division: 'Sales', email: 'email@gmail.com', name: 'namadiasiapa', status: 'terjawab', answered: true },
  { id: 7, type: 'Troubleshooting Perangkat', question: 'Scanner tidak terdeteksi di komputer, bagaimana cara mengatasinya?', division: 'Human Resources', email: 'email@gmail.com', name: 'namadiasiapa', status: 'terjawab', answered: true },
  { id: 8, type: 'Produksi & Operasional', question: 'Apakah ada SOP terbaru untuk operasional mesin?', division: 'Product Management', email: 'email@gmail.com', name: 'namadiasiapa', status: 'terjawab', answered: true },
  { id: 9, type: 'Produksi & Operasional', question: 'Bagaimana cara melaporkan kendala di lini produksi?', division: 'IT Department', email: 'email@gmail.com', name: 'namadiasiapa', status: 'terjawab', answered: true },
  { id: 10, type: 'General', question: 'Di mana saya bisa melihat panduan penggunaan sistem?', division: 'Legal', email: 'email@gmail.com', name: 'namadiasiapa', status: 'terjawab', answered: true },
]

const DIVISIONS = ['Operations', 'R&D', 'Marketing', 'Finance', 'Customer Service']
const QUESTION_TYPES = ['General', 'Sistem & IT Support', 'Troubleshooting Perangkat', 'Service Repair', 'Maintenance & Setup', 'Produksi & Operasional', 'Kebijakan Internal', 'Penggunaan Tools']

function FilterDropdown({ label, options, selected, onChange, type = 'checkbox' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggle = (val) => {
    if (type === 'radio') {
      onChange([val])
    } else {
      onChange(selected.includes(val) ? selected.filter(s => s !== val) : [...selected, val])
    }
  }

  return (
    <div className="th-filter-wrap" ref={ref}>
      <span className={`th-filter-trigger ${open || selected.length ? 'active' : ''}`} onClick={() => setOpen(o => !o)}>
        {label} <ChevronDown size={12} className={open ? 'rotated' : ''} />
        {selected.length > 0 && <span className="filter-dot" />}
      </span>
      {open && (
        <div className="filter-dropdown">
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

export default function DashboardPage() {
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [page, setPage] = useState(1)
  const [filterDivisi, setFilterDivisi] = useState([])
  const [filterStatus, setFilterStatus] = useState([])
  const [filterTiket, setFilterTiket] = useState([])
  const rowsPerPage = 10
  const totalPages = Math.ceil(68 / rowsPerPage)

  const filteredTickets = tickets.filter(t => {
    if (filterDivisi.length && !filterDivisi.includes(t.division)) return false
    if (filterStatus.length) {
      const isTerjawab = filterStatus.includes('Terjawab') && t.answered
      const isBelum = filterStatus.includes('Belum Terjawab') && !t.answered
      if (!isTerjawab && !isBelum) return false
    }
    if (filterTiket.length && !filterTiket.includes(t.type)) return false
    return true
  })

  return (
    <div className="page-content">
      <h1 className="page-title">Dashboard Tiket</h1>

      <div className="total-card">
        <span>Total Pertanyaan</span>
        <span className="total-num">57</span>
      </div>

      <div className="categories-grid">
        {categories.map(c => (
          <div key={c.label} className="category-row">
            <span>{c.label}</span>
            <span className="category-count">{c.count}</span>
          </div>
        ))}
      </div>

      <div className="table-wrap">
        <table className="data-table">
            <thead>
              <tr>
                <th>
                  <FilterDropdown label="Tiket" options={QUESTION_TYPES} selected={filterTiket} onChange={setFilterTiket} />
                </th>
                <th>
                  <FilterDropdown label="Divisi" options={DIVISIONS} selected={filterDivisi} onChange={setFilterDivisi} />
                </th>
                <th>Email</th>
                <th>Nama</th>
                <th>
                  <FilterDropdown label="Status" options={['Terjawab', 'Belum Terjawab']} selected={filterStatus} onChange={setFilterStatus} />
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map(t => (
              <tr key={t.id}>
                <td>
                  <div className="ticket-cell">
                    <span className="ticket-type">{t.type}</span>
                    <span className="ticket-q">{t.question}</span>
                  </div>
                </td>
                <td><span className="division-badge">{t.division}</span></td>
                <td className="muted">{t.email}</td>
                <td className="muted">{t.name}</td>
                <td>
                  <div className="status-cell">
                    {t.answered ? (
                      <span className="status-badge answered"><Check size={12} /> Terjawab</span>
                    ) : (
                      <button className="status-badge respon" onClick={() => setSelectedTicket(t)}>
                        <MessageSquare size={12} /> Respon
                      </button>
                    )}
                    <button className="icon-btn" onClick={() => setSelectedTicket(t)}><ArrowUpRight size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="table-footer">
          <span className="muted">0 of 68 row(s) selected.</span>
          <div className="pagination">
            <span className="muted">Rows per page</span>
            <select className="rows-select">
              <option>10</option><option>25</option><option>50</option>
            </select>
            <span className="muted">Page {page} of {totalPages}</span>
            <div className="page-btns">
              <button onClick={() => setPage(1)}>«</button>
              <button onClick={() => setPage(p => Math.max(1,p-1))}>‹</button>
              <button onClick={() => setPage(p => Math.min(totalPages,p+1))}>›</button>
              <button onClick={() => setPage(totalPages)}>»</button>
            </div>
          </div>
        </div>
      </div>

      {selectedTicket && (
        <TicketDetailModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
      )}
      {showForm && <TicketFormModal onClose={() => setShowForm(false)} />}
    </div>
  )
}
