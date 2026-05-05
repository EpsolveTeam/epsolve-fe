import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import './TicketFormModal.css'
import { apiFetch, BASE_URL } from '../api'

export default function TicketFormModal({ onClose, user }) {
  const [form, setForm] = useState({
    name: user?.name || '',
    user_email: user?.email || '',
    description: '',
    category: '',
    division: '',
    image: null,
  })
  const [options, setOptions] = useState({ categories: [], divisions: [] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('No file chosen')

  useEffect(() => {
    fetch(`${BASE_URL}/options/`)
      .then(r => r.json())
      .then(data => setOptions(data))
      .catch(() => {})
  }, [])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (file) {
      setForm(f => ({ ...f, image: file }))
      setFileName(file.name)
    }
  }

  const handleSubmit = async () => {
    setError('')
    if (!form.name || !form.user_email || !form.description || !form.category || !form.division) {
      setError('Mohon isi semua field yang wajib diisi.')
      return
    }

    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('name', form.name)
      fd.append('user_email', form.user_email)
      fd.append('description', form.description)
      fd.append('category', form.category)
      fd.append('division', form.division)
      if (form.image) fd.append('image', form.image)

      const res = await apiFetch('/tickets/', { method: 'POST', body: fd })

      if (res.ok) {
        onClose()
      } else {
        const err = await res.json()
        setError(typeof err.detail === 'string' ? err.detail : 'Gagal mengirim tiket.')
      }
    } catch {
      setError('Tidak dapat terhubung ke server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ticket-form-wrap">
        <h2>Kirim Pertanyaan Anda</h2>

        <div className="form-row">
          <div className="form-field">
            <label>Nama</label>
            <input
              type="text"
              placeholder="Masukkan nama Anda..."
              value={form.name}
              onChange={set('name')}
            />
          </div>
          <div className="form-field">
            <label>Email</label>
            <input
              type="email"
              placeholder="Masukkan email Anda..."
              value={form.user_email}
              onChange={set('user_email')}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label>Divisi</label>
            <select value={form.division} onChange={set('division')}>
              <option value="">Pilih divisi Anda</option>
              {options.divisions.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label>Jenis Pertanyaan</label>
            <select value={form.category} onChange={set('category')}>
              <option value="">Pilih jenis pertanyaan</option>
              {options.categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-field">
          <label>Pertanyaan</label>
          <textarea
            placeholder="Ketik pertanyaan Anda di sini"
            rows={4}
            value={form.description}
            onChange={set('description')}
          />
        </div>

        <div className="form-field">
          <label>Gambar Pendukung (Opsional)</label>
          <div className="file-input-wrap">
            <label className="file-label">
              <input type="file" accept="image/*" onChange={handleImage} />
              Choose File
            </label>
            <span className="file-name">{fileName}</span>
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button className="btn-cancel" onClick={onClose} disabled={loading}>Batal</button>
          <button className="btn-submit" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Mengirim...' : 'Kirim'}
          </button>
        </div>
      </div>
    </div>
  )
}
