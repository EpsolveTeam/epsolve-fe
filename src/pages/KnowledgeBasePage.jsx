import { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronDown, ArrowUpRight, RotateCcw, Loader2 } from 'lucide-react'
import KBDetailModal from '../components/KBDetailModal'
import { getKnowledgeBase, createKnowledgeBase, deleteKnowledgeBase, getOptions } from '../api'
import './KnowledgeBasePage.css'

const PLACEHOLDER_JENIS = 'Pilih jenis pertanyaan'
const PLACEHOLDER_DIVISI = 'Pilih divisi'

function formatDate(dateStr) {
  const date = new Date(dateStr)
  const day = date.getDate()
  const month = date.toLocaleString('id-ID', { month: 'short' })
  const year = date.getFullYear().toString().slice(-2)
  return `${day} ${month} ${year}`
}

function extractQuestion(content) {
  if (!content) return ''
  const match = content.match(/\*\*Keluhan Pelanggan:\*\*\s*\n(.+?)(?:\n|$)/)
  return match ? match[1].trim() : content
}

function SelectDropdown({ label, options, selected, onChange }) {
  const [open, setOpen] = useState(false)
  const [dropdownStyle, setDropdownStyle] = useState({})
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (open && ref.current) {
      const rect = ref.current.getBoundingClientRect()
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        margin: 0
      })
    }
  }, [open])

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

function DivisiDropdown({ selected, onChange, options }) {
  return <SelectDropdown label={PLACEHOLDER_DIVISI} options={options} selected={selected} onChange={onChange} />
}

function JenisPertanyaanDropdown({ selected, onChange, options }) {
  return <SelectDropdown label={PLACEHOLDER_JENIS} options={options} selected={selected} onChange={onChange} />
}

function FilterDropdown({ label, options, selected, onChange }) {
  const [open, setOpen] = useState(false)
  const [dropdownStyle, setDropdownStyle] = useState({})
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (open && ref.current) {
      const rect = ref.current.getBoundingClientRect()
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        margin: 0
      })
    }
  }, [open])

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
  const [dropdownStyle, setDropdownStyle] = useState({})
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (open && ref.current) {
      const rect = ref.current.getBoundingClientRect()
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        minWidth: rect.width,
        margin: 0
      })
    }
  }, [open])

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

export default function KnowledgeBasePage() {
  const [selectedKB, setSelectedKB] = useState(null)
  const [kbData, setKbData] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [filterDivisi, setFilterDivisi] = useState([])
  const [filterJenis, setFilterJenis] = useState([])
  const [riwayatSort, setRiwayatSort] = useState('Terbaru')
  const [totalItems, setTotalItems] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const [categories, setCategories] = useState([PLACEHOLDER_JENIS])
  const [divisions, setDivisions] = useState([PLACEHOLDER_DIVISI])
  const [optionsLoading, setOptionsLoading] = useState(true)

  const [formTitle, setFormTitle] = useState('')
  const [formContent, setFormContent] = useState('')
  const [formCategory, setFormCategory] = useState('')
  const [formDivision, setFormDivision] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchOptions = useCallback(async () => {
    try {
      const options = await getOptions()
      setCategories([PLACEHOLDER_JENIS, ...options.categories])
      setDivisions([PLACEHOLDER_DIVISI, ...options.divisions])
    } catch (error) {
      console.error('Failed to fetch options:', error)
      setCategories([PLACEHOLDER_JENIS, 'General', 'Sistem & IT Support', 'Troubleshooting Perangkat', 'Service Repair', 'Maintenance & Setup', 'Produksi & Operasi', 'Kebijakan Internal', 'Penggunaan Tools'])
      setDivisions([PLACEHOLDER_DIVISI, 'Operations', 'R&D', 'Marketing', 'Finance', 'Customer Service'])
    } finally {
      setOptionsLoading(false)
    }
  }, [])

  const fetchKbData = useCallback(async () => {
    setLoading(true)
    try {
      const category = filterJenis.length ? filterJenis.join(',') : null
      const division = filterDivisi.length ? filterDivisi.join(',') : null
      const data = await getKnowledgeBase(category, division)
      setKbData(data)
      setTotalItems(data.length)
    } catch (error) {
      console.error('Failed to fetch KB data:', error)
      setKbData([])
    } finally {
      setLoading(false)
    }
  }, [filterJenis, filterDivisi])

  useEffect(() => {
    fetchOptions()
  }, [fetchOptions])

  useEffect(() => {
    if (!optionsLoading) {
      fetchKbData()
    }
  }, [fetchKbData, optionsLoading])

  async function handleCreate() {
    if (!formTitle || !formContent || !formCategory || !formDivision) {
      alert('Semua field harus diisi')
      return
    }
    setSubmitting(true)
    try {
      const newKb = await createKnowledgeBase({
        title: formTitle,
        content: formContent,
        category: formCategory,
        division: formDivision
      })
      setKbData(prev => [newKb, ...prev])
      setPage(1)
      setFormTitle('')
      setFormContent('')
      setFormCategory('')
      setFormDivision('')
      alert('Knowledge base berhasil ditambahkan')
    } catch (error) {
      console.error('Failed to create KB:', error)
      alert('Gagal menambahkan knowledge base')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(faqId) {
    if (!confirm('Apakah Anda yakin ingin menghapus knowledge base ini?')) return
    try {
      await deleteKnowledgeBase(faqId)
      setKbData(prev => prev.filter(item => item.faq_id !== faqId))
      if (selectedKB && selectedKB.faq_id === faqId) setSelectedKB(null)
    } catch (error) {
      console.error('Failed to delete KB:', error)
      alert('Gagal menghapus knowledge base')
    }
  }

  const sortedData = [...kbData].sort((a, b) => {
    let dateA, dateB
    if (riwayatSort === 'Baru Diperbarui') {
      dateA = new Date(a.updated_at)
      dateB = new Date(b.updated_at)
    } else {
      dateA = new Date(a.created_at)
      dateB = new Date(b.created_at)
    }
    if (riwayatSort === 'Terlama') return dateA - dateB;
    return dateB - dateA;
  });

  const filteredItems = sortedData.filter(item => {
    if (filterDivisi.length && !filterDivisi.includes(item.division)) return false
    if (filterJenis.length && !filterJenis.includes(item.category)) return false
    return true
  })

  const actualTotalPages = Math.ceil(filteredItems.length / itemsPerPage)
  const startIndex = (page - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedItems = filteredItems.slice(startIndex, endIndex)

  useEffect(() => {
    if (page > actualTotalPages && actualTotalPages > 0) {
      setPage(actualTotalPages)
    }
  }, [page, actualTotalPages])

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
                  <FilterDropdown label="Divisi" options={divisions.slice(1)} selected={filterDivisi} onChange={setFilterDivisi} />
                </div>
                <div className="kb-h-aksi">Aksi</div>
              </div>
              <div className="kb-content-wrapper">
                <div className="kb-body">
                  {loading ? (
                    <div className="loading-state">
                      <Loader2 className="spin" size={24} />
                      <span>Loading...</span>
                    </div>
                  ) : filteredItems.length === 0 ? (
                    <div className="empty-state">Tidak ada data knowledge base</div>
                  ) : (
                    paginatedItems.map(item => (
                      <div key={item.id} className="kb-row">
                        <div className="kb-date">{formatDate(item.updated_at)}</div>
                        <div className="kb-info">
                          <span className="kb-type">{item.category}</span>
                          <p className="kb-q">{item.title || item.question || extractQuestion(item.content)}</p>
                        </div>
                        <div className="kb-division">
                          <span className="division-badge">{item.division}</span>
                        </div>
                        <div className="kb-actions">
                         <button className="btn-detail" onClick={() => setSelectedKB(item)}>
                           Detail <ArrowUpRight size={13} />
                         </button>
                       </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="kb-table-footer">
              <span className="muted">0 of {filteredItems.length} row(s) selected.</span>
              <div className="pagination">
                <span className="muted">Rows per page</span>
                <select className="rows-select" value={itemsPerPage} onChange={e => { setItemsPerPage(Number(e.target.value)); setPage(1) }}>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                </select>
                <span className="muted">Page {page} of {actualTotalPages}</span>
                <div className="page-btns">
                  <button onClick={() => setPage(1)}>«</button>
                  <button onClick={() => setPage(p => Math.max(1,p-1))}>‹</button>
                  <button onClick={() => setPage(p => Math.min(actualTotalPages,p+1))}>›</button>
                  <button onClick={() => setPage(actualTotalPages)}>»</button>
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
              <input
                type="text"
                placeholder="Masukkan pertanyaan..."
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
              />
            </div>

            <div className="kb-row-fields">
              <div className="kb-field">
                <label>Divisi</label>
                <DivisiDropdown selected={formDivision} onChange={setFormDivision} options={divisions} />
              </div>
              <div className="kb-field">
                <label>Jenis Pertanyaan</label>
                <JenisPertanyaanDropdown selected={formCategory} onChange={setFormCategory} options={categories} />
              </div>
            </div>

            <div className="kb-field">
              <label>Jawaban Lengkap</label>
              <textarea
                placeholder="Masukkan jawaban lengkap..."
                rows={5}
                value={formContent}
                onChange={e => setFormContent(e.target.value)}
              />
            </div>

            <button
              className="btn-tambah"
              onClick={handleCreate}
              disabled={submitting}
            >
              {submitting ? <Loader2 className="spin" size={16} /> : 'Tambahkan'}
            </button>
          </div>
        </div>
      </div>

      {selectedKB && (
        <KBDetailModal
          item={selectedKB}
          onClose={() => setSelectedKB(null)}
          onUpdate={(updated) => setKbData(prev => prev.map(item => item.faq_id === updated.faq_id ? updated : item))}
          onDelete={(faqId) => { setKbData(prev => prev.filter(item => item.faq_id !== faqId)); setSelectedKB(null) }}
        />
      )}
    </div>
  )
}
