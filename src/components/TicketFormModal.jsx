import { X } from 'lucide-react'
import './TicketFormModal.css'

export default function TicketFormModal({ onClose }) {
  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ticket-form-wrap">
        <h2>Kirim Pertanyaan Anda</h2>

        <div className="form-row">
          <div className="form-field">
            <label>Nama</label>
            <input type="text" placeholder="Masukkan nama Anda..." />
          </div>
          <div className="form-field">
            <label>Email</label>
            <input type="email" placeholder="Masukkan email Anda..." />
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label>Divisi</label>
            <select>
              <option value="">Pilih divisi Anda</option>
              <option>Operations</option>
              <option>Marketing</option>
              <option>Finance</option>
              <option>HR</option>
              <option>IT Department</option>
            </select>
          </div>
          <div className="form-field">
            <label>Jenis Pertanyaan</label>
            <select>
              <option value="">Pilih jenis pertanyaan</option>
              <option>General</option>
              <option>Troubleshooting Perangkat</option>
              <option>Service Repair</option>
              <option>Sistem & IT Support</option>
              <option>Maintenance & Setup</option>
            </select>
          </div>
        </div>

        <div className="form-field">
          <label>Pertanyaan</label>
          <textarea placeholder="Ketik pertanyaan Anda di sini" rows={4} />
        </div>

        <div className="form-field">
          <label>Gambar Pendukung (Opsional)</label>
          <div className="file-input-wrap">
            <label className="file-label">
              <input type="file" accept="image/*" />
              Choose File
            </label>
            <span className="file-name">No file chosen</span>
          </div>
        </div>

        <div className="form-actions">
          <button className="btn-cancel" onClick={onClose}>Batal</button>
          <button className="btn-submit">Kirim</button>
        </div>
      </div>
    </div>
  )
}
