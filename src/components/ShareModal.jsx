import { useState } from 'react'
import { X, Download } from 'lucide-react'
import './ShareModal.css'

export default function ShareModal({ onClose }) {
  const [email, setEmail] = useState('')
  const [period, setPeriod] = useState('1minggu')

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal share-modal">
        <button className="modal-close" onClick={onClose}><X size={14} /></button>

        <h2>Bagikan Laporan Analisis Periode Ini</h2>
        <p className="share-sub">Analisis selama periode 3 bulan: 1 Februari - 30 April 2026</p>

        <div className="ticket-modal-divider" />

        <div className="share-section">
          <h4>Download PDF Laporan</h4>
          <div className="download-row">
            <Download size={18} style={{color: 'var(--text-secondary)'}} />
            <div>
              <div className="file-name-txt">Laporan_01022026-30042026.pdf</div>
              <div className="file-size">10MB</div>
            </div>
          </div>
        </div>

        <div className="auto-section">
          <div className="auto-header">
            <h4>Mode Otomatis Aktif</h4>
            <p className="auto-sub">Laporan periode 1 minggu: 23 April - 30 April 2026 telah terkirim</p>
          </div>

          <div className="share-field">
            <label>Email Penerima Laporan</label>
            <input
              type="email"
              placeholder="abc@gmail.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="share-field">
            <label>Periode Pengiriman Otomatis</label>
            <div className="radio-group">
              {[['3bulan','3 bulan'],['1bulan','1 bulan'],['1minggu','1 minggu']].map(([v,l]) => (
                <label key={v} className="radio-item">
                  <input
                    type="radio"
                    name="period"
                    value={v}
                    checked={period === v}
                    onChange={() => setPeriod(v)}
                  />
                  <span className={`radio-circle ${period===v?'checked':''}`} />
                  {l}
                </label>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button className="btn-primary">Simpan Perubahan</button>
          </div>
        </div>
      </div>
    </div>
  )
}
