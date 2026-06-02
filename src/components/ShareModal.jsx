import { useState, useEffect } from 'react'
import { X, Download, Loader2, CheckCircle } from 'lucide-react'
import { apiFetch } from '../api'
import './ShareModal.css'

const PERIOD_OPTIONS = [
  { value: 'off', label: 'Off' },
  { value: '1w', label: '1 minggu' },
  { value: '1m', label: '1 bulan' },
  { value: '3m', label: '3 bulan' },
]

const PERIOD_OPTIONS_DISPLAY = [
  { value: '3m', label: '3 bulan' },
  { value: '1m', label: '1 bulan' },
  { value: '1w', label: '1 minggu' },
]

export default function ShareModal({
  onClose,
  apiPeriod = '3m',
  periodLabel = '3 bulan',
  dateRange = '',
}) {
  const [downloading, setDownloading] = useState(false)
  const [email, setEmail] = useState('')
  const [period, setPeriod] = useState('off')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loadingSettings, setLoadingSettings] = useState(true)
  const [saveError, setSaveError] = useState('')
  const [fileSize, setFileSize] = useState('')

  useEffect(() => {
    apiFetch('/analytics/report-settings')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setEmail(data.email ?? '')
          setPeriod(data.period ?? 'off')
        }
      })
      .finally(() => setLoadingSettings(false))
  }, [])

  const formatFileSize = (bytes) => {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${bytes} B`
  }

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const res = await apiFetch(`/analytics/export-pdf?period=${apiPeriod}`)
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert(err.detail || 'Gagal mengunduh laporan')
        return
      }

      const contentLength = res.headers.get('Content-Length')
      if (contentLength) {
        setFileSize(formatFileSize(Number(contentLength)))
      }

      const blob = await res.blob()
      setFileSize(formatFileSize(blob.size))

      const disposition = res.headers.get('Content-Disposition')
      const filename =
        disposition?.match(/filename="([^"]+)"/)?.[1] || `Laporan_${apiPeriod}.pdf`

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Gagal mengunduh laporan')
    } finally {
      setDownloading(false)
    }
  }

  const handleSave = async () => {
    setSaveError('')
    if (period !== 'off' && !email.trim()) {
      setSaveError('Masukkan email penerima untuk mengaktifkan mode otomatis.')
      return
    }

    setSaving(true)
    setSaved(false)

    try {
      const body = { recipient_email: email.trim(), period }
      const res = await apiFetch(`/analytics/report-settings`, {
        method: 'POST',
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setSaveError(err.detail || 'Gagal menyimpan pengaturan.')
        return
      }

      setSaved(true)
    } catch {
      setSaveError('Tidak dapat terhubung ke server.')
    } finally {
      setSaving(false)
    }
  }

  const getPeriodDateRange = (value) => {
    const days = value === '1w' ? 7 : value === '1m' ? 30 : value === '3m' ? 90 : 0
    if (!days) return ''

    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days)

    const fmt = (d) => d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    return `${fmt(start)} – ${fmt(end)}`
  }

  const activePeriodLabel = PERIOD_OPTIONS.find((o) => o.value === period)?.label ?? ''
  const selectedDateRange = getPeriodDateRange(period)

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal share-modal">
        <button className="modal-close" onClick={onClose}>
          <X size={14} />
        </button>

        <h2>Bagikan Laporan Analisis Periode Ini</h2>
        <p className="share-sub">
          Analisis selama periode {periodLabel}: {dateRange}
        </p>

        <div className="ticket-modal-divider" />

        <div className="share-modal-body">
          {/* Download Manual */}
          <div className="share-section">
            <h4>Download PDF Laporan</h4>
            <div
              className="download-row"
              onClick={!downloading ? handleDownload : undefined}
              style={{ cursor: downloading ? 'wait' : 'pointer' }}
            >
              {downloading ? (
                <Loader2 size={18} className="icon-muted spin" />
              ) : (
                <Download size={18} className="icon-muted" />
              )}
              <div>
                <div className="file-name-txt">
                  {downloading ? 'Mengunduh...' : `Laporan_${apiPeriod}.pdf`}
                </div>
                <div className="file-size">
                  {downloading ? '' : fileSize || 'Klik unduh untuk melihat ukuran file'}
                </div>
              </div>
            </div>
          </div>

          {/* Mode Otomatis */}
          <div className="auto-section">
            <div className="auto-header">
              <h4>Mode Otomatis {period !== 'off' ? 'Aktif' : ''}</h4>
              <p className="auto-sub">
                {period !== 'off'
                  ? `Laporan periode ${activePeriodLabel}: ${selectedDateRange} telah terkirim`
                  : 'Laporan akan dikirimkan otomatis melalui email di setiap akhir periode'}
              </p>
            </div>

            {loadingSettings ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
                <Loader2 size={18} className="icon-muted spin" />
              </div>
            ) : (
              <>
                <div className="share-field">
                  <label>Email Penerima Laporan</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setSaved(false)
                      setSaveError('')
                    }}
                    placeholder="contoh: manager@perusahaan.com"
                  />
                </div>

                <div className="share-field">
                  <label>Periode Pengiriman Otomatis</label>
                  <div className="radio-group">
                    {PERIOD_OPTIONS_DISPLAY.map((opt) => (
                      <label
                        key={opt.value}
                        className={`radio-item ${period === opt.value ? 'checked' : ''}`}
                        onClick={() => {
                          setPeriod(opt.value)
                          setSaved(false)
                        }}
                      >
                        <input type="radio" name="period" value={opt.value} readOnly />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>

                {saveError && (
                  <p style={{ color: 'var(--error)', fontSize: 12, marginBottom: 12 }}>{saveError}</p>
                )}

                <div className="modal-actions" style={{ alignItems: 'center', gap: 12 }}>
                  {saved && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--success)', fontSize: 13 }}>
                      <CheckCircle size={14} /> Tersimpan
                    </span>
                  )}
                  <button className="btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

