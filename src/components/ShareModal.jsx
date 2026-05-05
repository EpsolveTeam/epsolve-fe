import { useState } from 'react'
import { X, Download, Loader2 } from 'lucide-react'
import { apiFetch } from '../api'
import './ShareModal.css'

export default function ShareModal({ onClose }) {
  const [downloading, setDownloading] = useState(false)
  const [distributing, setDistributing] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const res = await apiFetch('/analytics/export-excel')
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert(err.detail || 'Gagal mengunduh laporan')
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'report_analytics_epsolve.xlsx'
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert('Gagal mengunduh laporan')
    } finally {
      setDownloading(false)
    }
  }

  const handleDistribute = async () => {
    setDistributing(true)
    try {
      const res = await apiFetch('/analytics/distribute-report', { method: 'POST' })
      if (res.ok) {
        alert('Laporan sedang dikirim ke admin.')
      } else {
        const err = await res.json().catch(() => ({}))
        alert(err.detail || 'Gagal mengirim laporan')
      }
    } catch (e) {
      alert('Gagal mengirim laporan')
    } finally {
      setDistributing(false)
    }
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal share-modal">
        <button className="modal-close" onClick={onClose}><X size={14} /></button>

        <h2>Bagikan Laporan Analisis</h2>
        <p className="share-sub">Unduh laporan atau kirim secara otomatis ke seluruh Admin</p>

        <div className="ticket-modal-divider" />

        <div className="share-section">
          <h4>Download Excel Laporan</h4>
          <div className="download-row" onClick={handleDownload} style={{ cursor: downloading ? 'wait' : 'pointer' }}>
            {downloading ? (
              <Loader2 size={18} style={{color: 'var(--text-secondary)', animation: 'spin 1s linear infinite'}} />
            ) : (
              <Download size={18} style={{color: 'var(--text-secondary)'}} />
            )}
            <div>
              <div className="file-name-txt">
                {downloading ? 'Mengunduh...' : 'report_analytics_epsolve.xlsx'}
              </div>
              <div className="file-size">Klik untuk mengunduh</div>
            </div>
          </div>
        </div>

        <div className="auto-section">
          <div className="auto-header">
            <h4>Distribusi Laporan</h4>
            <p className="auto-sub">Kirim laporan analitik terbaru ke seluruh Admin</p>
          </div>

          <div className="modal-actions">
            <button
              className="btn-primary"
              onClick={handleDistribute}
              disabled={distributing}
            >
              {distributing ? 'Mengirim...' : 'Kirim Laporan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
