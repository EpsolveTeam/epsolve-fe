import { useState } from 'react'
import { X, Copy } from 'lucide-react'
import './TicketDetailModal.css'

const sampleAnswer = `Printer yang berstatus offline meskipun dalam kondisi menyala umumnya disebabkan oleh kendala koneksi jaringan atau konfigurasi pada sisi perangkat maupun komputer. Berikut langkah-langkah pengecekan yang dapat dilakukan:
a. Cek Koneksi Jaringan Printer
 Pastikan printer terhubung ke jaringan yang sama dengan komputer.
  • Periksa kabel LAN atau koneksi Wi-Fi pada printer
  • Cek indikator jaringan pada printer (lampu harus stabil, tidak berkedip merah)
b. Verifikasi IP Address Printer
  • Masuk ke menu network pada printer, lalu catat IP address
  • Bandingkan dengan IP yang terdaftar di komputer
  • Jika berbeda, lakukan re-add printer menggunakan IP terbaru
c. Restart Spooler Service di Komputer
  • Buka Services di Windows
  • Cari Print Spooler, lalu klik Restart
  • Setelah itu coba print kembali
d. Pastikan Status Printer "Online"
  • Masuk ke Control Panel > Devices and Printers
  • Klik kanan printer → pilih See what's printing
  • Pastikan opsi Use Printer Offline tidak aktif
e. Uji Koneksi dengan Ping
  • Buka Command Prompt
  • Ketik: ping [IP Printer]
  • Jika tidak ada respon, kemungkinan ada masalah jaringan atau printer tidak terhubung`

export default function TicketDetailModal({ ticket, onClose }) {
  const [reply, setReply] = useState('')
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleAnswer)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal ticket-modal">
        <button className="modal-close" onClick={onClose}><X size={14} /></button>

        <div className="ticket-modal-header">
          <div>
            <h2>{ticket.type}</h2>
            <p className="ticket-modal-q">{ticket.question}</p>
          </div>
          <span className="ticket-tag">Printer</span>
        </div>

        <div className="ticket-modal-divider" />

        {ticket.answered ? (
          <>
            <div className="ticket-meta">
              <span>{ticket.email}</span>
              <span>{ticket.name}</span>
            </div>
            <div className="field-label" style={{marginTop:16}}>Balasan</div>
            <div className="answer-box">{sampleAnswer}</div>
            <div className="modal-actions">
              <button className="btn-copy" onClick={handleCopy}>
                <Copy size={13} /> {copied ? 'Tersalin!' : 'Salin Balasan'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="field-label">Terakhir diperbarui: 24 Apr 26</div>
            <div className="field-label" style={{marginTop:16}}>Jawaban</div>
            <div className="answer-box">{sampleAnswer}</div>
            <div className="modal-actions">
              <button className="btn-danger"><span>🗑</span> Hapus</button>
              <button className="btn-edit"><span>✏️</span> Edit</button>
            </div>
          </>
        )}

        {!ticket.answered && (
          <>
            <div className="field-label" style={{marginTop:20}}>Balasan</div>
            <textarea
              className="reply-textarea"
              placeholder="Ketik balasan Anda di sini"
              value={reply}
              onChange={e => setReply(e.target.value)}
            />
            <div className="modal-actions">
              <button className="btn-primary">Kirim</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
