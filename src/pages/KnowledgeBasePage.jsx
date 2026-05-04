import { useState, useRef, useEffect } from 'react'
import { ChevronDown, ArrowUpRight, RotateCcw } from 'lucide-react'
import KBDetailModal from '../components/KBDetailModal'
import './KnowledgeBasePage.css'

const DIVISI_OPTIONS = ['Operations', 'R&D', 'Marketing', 'Finance', 'Customer Service']
const PRODUK_OPTIONS = ['Pilih jenis produk', 'Printer', 'Scanner', 'Laptop', 'Komputer Desktop', 'Monitor', 'Proyektor', 'Jaringan & WiFi', 'Server', 'Perangkat Lainnya']

const JENIS_OPTIONS = ['Pilih jenis pertanyaan', 'General', 'Sistem & IT Support', 'Troubleshooting Perangkat', 'Service Repair', 'Maintenance & Setup', 'Produksi & Operasional', 'Kebijakan Internal', 'Penggunaan Tools']

function SelectDropdown({ label, options, selected, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  let dropdownStyle = {}
  if (open && ref.current) {
    const rect = ref.current.getBoundingClientRect()
    dropdownStyle = {
      position: 'fixed',
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
      margin: 0
    }
  }

  return (
    <div ref={ref} style={{position:'relative',display:'block'}}>
      <div className="kb-select-trigger" onClick={() => setOpen(o => !o)}>
        <span>{selected || label}</span>
        <ChevronDown size={12} style={open ? {transform:'rotate(180deg)',transition:'transform 0.15s'} : {transition:'transform 0.15s'}} />
      </div>
      {open && (
        <div className="kb-select-dropdown" style={dropdownStyle}>
          {options.map(opt => (
            <div key={opt} className="kb-select-option" onClick={() => { onChange(opt === selected ? '' : opt); setOpen(false); }}>
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function JenisProdukDropdown() {
  const [selected, setSelected] = useState('')
  return <SelectDropdown label="Pilih jenis produk" options={PRODUK_OPTIONS} selected={selected} onChange={setSelected} />
}

function JenisPertanyaanDropdown() {
  const [selected, setSelected] = useState('')
  return <SelectDropdown label="Pilih jenis pertanyaan" options={JENIS_OPTIONS} selected={selected} onChange={setSelected} />
}

function FilterDropdown({ label, options, selected, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  let dropdownStyle = {}
  if (open && ref.current) {
    const rect = ref.current.getBoundingClientRect()
    dropdownStyle = {
      position: 'fixed',
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
      margin: 0
    }
  }

  return (
    <div ref={ref} style={{position:'relative',display:'inline-block'}}>
      <span className={`kb-th-trigger ${selected.length ? 'active' : ''}`} onClick={() => setOpen(o => !o)}>
        {label} <ChevronDown size={12} style={open ? {transform:'rotate(180deg)',transition:'transform 0.15s'} : {transition:'transform 0.15s'}} />
        {selected.length > 0 && <span className="kb-filter-dot" style={{marginLeft:2}} />}
      </span>
      {open && (
        <div className="kb-filter-dropdown" style={dropdownStyle}>
          <div className="kb-filter-reset" onClick={() => onChange([])}>
            <RotateCcw size={11} /> Reset
          </div>
          {options.map(opt => (
            <label key={opt} className="kb-filter-option">
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => onChange(selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt])}
              />
              {opt}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

const RIWAYAT_OPTIONS = ['Terbaru', 'Terlama', 'Baru Diperbarui']

function RiwayatDropdown({ selected, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  let dropdownStyle = {}
  if (open && ref.current) {
    const rect = ref.current.getBoundingClientRect()
    dropdownStyle = {
      position: 'fixed',
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
      minWidth: rect.width,
      margin: 0
    }
  }

  return (
    <div ref={ref} style={{position:'relative',display:'inline-block'}}>
      <span className={`kb-th-trigger ${open || selected ? 'active' : ''}`} onClick={() => setOpen(o => !o)}>
        Riwayat Pembaruan <ChevronDown size={12} style={open ? {transform:'rotate(180deg)',transition:'transform 0.15s'} : {transition:'transform 0.15s'}} />
      </span>
      {open && (
        <div className="kb-filter-dropdown" style={dropdownStyle}>
          <div className="kb-filter-reset" onClick={() => { onChange(null); setOpen(false) }}>
            <RotateCcw size={11} /> Reset
          </div>
          {RIWAYAT_OPTIONS.map(opt => (
            <label key={opt} className="kb-filter-option">
              <input type="radio" checked={selected === opt} onChange={() => { onChange(opt); setOpen(false) }} />
              {opt}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

const KB_DATA = [
  { id: 1, date: '24 Apr 27', type: 'Sistem & IT Support', question: 'Aplikasi email saya tiba-tiba tidak bisa mengirim pesan. Muncul pesan error \'server tidak merespon\'. Saya sudah cek koneksi internet baik-baik saja.', division: 'Pemasaran' },
  { id: 2, date: '24 Apr 30', type: 'Sistem & IT Support', question: 'Kami membutuhkan akses ke folder bersama di server, tapi tidak bisa membuka folder tersebut. Muncul pesan \'akses ditolak\'.', division: 'Direksi' },
  { id: 3, date: '24 Apr 28', type: 'Sistem & IT Support', question: 'Saya mengalami kesulitan login ke akun kantor di komputer baru. Password sudah dicek benar, tapi tetap gagal masuk dengan pesan \'akses ditolak\'.', division: 'Produksi' },
  { id: 4, date: '24 Mei 1', type: 'Sistem & IT Support', question: 'Koneksi Wi-Fi di lantai 3 sangat lambat dan sering terputus. Ini mengganggu pekerjaan kami yang harus online terus-menerus.', division: 'Logistik' },
  { id: 5, date: '24 Apr 26', type: 'Sistem & IT Support', question: 'Printer di ruangan saya tidak bisa digunakan melalui jaringan. Status di komputer "offline", padahal printer menyala. Sudah coba restart tapi masih tidak bisa. Mohon bantuannya.', division: 'Penjualan' },
  { id: 6, date: '24 Mei 3', type: 'Sistem & IT Support', question: 'Monitor saya sering mati sendiri setelah beberapa menit digunakan, meskipun komputer tetap hidup. Sudah coba ganti kabel tapi sama saja.', division: 'Printer' },
  { id: 7, date: '24 Mei 4', type: 'Sistem & IT Support', question: 'Saya tidak bisa membuka dokumen di SharePoint. Terkadang muncul error \'file tidak ditemukan\' padahal dokumen masih ada.', division: 'Riset' },
  { id: 8, date: '24 Mei 2', type: 'Sistem & IT Support', question: 'Aplikasi akuntansi tidak bisa dibuka setelah update terakhir. Muncul notifikasi error \'file corrupt\'. Tolong bantu cek.', division: 'Keuangan' },
  { id: 9, date: '24 Apr 29', type: 'Sistem & IT Support', question: 'Komputer saya sering restart sendiri tanpa pemberitahuan. Sudah coba bersihkan file sementara tapi masalah masih terjadi.', division: 'Hukum' },
  { id: 10, date: '24 Mei 5', type: 'Sistem & IT Support', question: 'Keyboard di laptop sering menulis huruf ganda tanpa saya tekan dua kali. Sudah coba restart tapi masalah masih muncul.', division: 'Umum' },
];

export default function KnowledgeBasePage() {
  const [selectedKB, setSelectedKB] = useState(null)
  const [page, setPage] = useState(1)
  const [filterDivisi, setFilterDivisi] = useState([])
const [filterJenis, setFilterJenis] = useState([])
  const [riwayatSort, setRiwayatSort] = useState('Terbaru')
  const totalPages = Math.ceil(68 / 10)

function parseDate(dateStr) {
    const [day, monthStr, yearDay] = dateStr.split(' ');
    const months = { 'Jan':0, 'Feb':1, 'Mar':2, 'Apr':3, 'Mei':4, 'Jun':5, 'Jul':6, 'Agu':7, 'Sep':8, 'Okt':9, 'Nov':10, 'Des':11 };
    const month = months[monthStr.slice(0,3)] || 4; // default Mei
    const dayNum = parseInt(yearDay || day) || 1;
    return new Date(2024, month, dayNum);
  }

  const sortedData = [...KB_DATA].sort((a, b) => {
    const dateA = parseDate(a.date);
    const dateB = parseDate(b.date);
    if (riwayatSort === 'Terlama') return dateA - dateB;
    if (riwayatSort === 'Terbaru') return dateB - dateA;
    return dateB - dateA; // Baru Diperbarui default Terbaru
  });

  const filteredItems = sortedData.filter(item => {
    if (filterDivisi.length && !filterDivisi.includes(item.division)) return false
    if (filterJenis.length && !filterJenis.includes(item.type)) return false
    return true
  })

  return (
    <div className="page-content">
      <div className="kb-layout">
        <div className="kb-left">
          <h1 className="page-title">Manajemen Knowledge Base</h1>

          <div className="kb-table-wrap">
            <div className="kb-custom-table">
              <div className="kb-header">
                <div className="kb-h-date">Diperbarui</div>
                <div className="kb-h-riwayat">
                  <RiwayatDropdown selected={riwayatSort} onChange={setRiwayatSort} />
                </div>
                <div className="kb-h-divisi">
                  <FilterDropdown label="Divisi" options={DIVISI_OPTIONS} selected={filterDivisi} onChange={setFilterDivisi} />
                </div>
                <div className="kb-h-aksi">Aksi</div>
              </div>
              <div className="kb-content-wrapper">
                <div className="kb-body">
                  {filteredItems.map(item => (
                    <div key={item.id} className="kb-row">
                      <div className="kb-date">{item.date}</div>
                      <div className="kb-info">
                        <span className="kb-type">{item.type}</span>
                        <p className="kb-q">{item.question}</p>
                      </div>
                      <div className="kb-division">
                        <span className="division-badge">{item.division}</span>
                      </div>
                      <div className="kb-actions">
                        <button className="btn-detail" onClick={() => setSelectedKB(item)}>Detail</button>
                        <button className="icon-btn" onClick={() => setSelectedKB(item)}><ArrowUpRight size={13} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="kb-table-footer">
                <span className="muted">0 of 68 row(s) selected.</span>
                <div className="pagination">
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
            </div>
          </div>
        </div>

        <div className="kb-right">
          <div className="kb-add-form">
            <h3>Tambah Knowledge Base</h3>

            <div className="kb-field">
              <label>Pertanyaan</label>
              <input type="text" placeholder="Masukkan pertanyaan..." />
            </div>

            <div className="kb-row-fields">
              <div className="kb-field">
                <label>Jenis Produk</label>
                <JenisProdukDropdown />
              </div>
              <div className="kb-field">
                <label>Jenis Pertanyaan</label>
                <JenisPertanyaanDropdown />
              </div>
            </div>

            <div className="kb-field">
              <label>Jawaban Lengkap</label>
              <textarea placeholder="Masukkan jawaban lengkap..." rows={5} />
            </div>

            <button className="btn-tambah">Tambahkan</button>
          </div>
        </div>
      </div>

      {selectedKB && (
        <KBDetailModal item={selectedKB} onClose={() => setSelectedKB(null)} />
      )}
    </div>
  )
}
