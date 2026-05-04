import { X } from 'lucide-react'
import './KBDetailModal.css'

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

export default function KBDetailModal({ item, onClose }) {
  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal kb-modal">
        <button className="modal-close" onClick={onClose}><X size={14} /></button>

        <div className="kb-modal-header">
          <div>
            <h2>{item.type}</h2>
            <p className="kb-modal-q">{item.question}</p>
          </div>
          <span className="ticket-tag">Printer</span>
        </div>

        <div className="ticket-modal-divider" />

        <div className="field-label">Terakhir diperbarui: 24 Apr 26</div>
        <div className="field-label" style={{marginTop:14}}>Jawaban</div>
        <div className="answer-box">{sampleAnswer}</div>

        <div className="modal-actions" style={{marginTop:16}}>
          <button className="btn-danger"><span>🗑</span> Hapus</button>
          <button className="btn-edit"><span>✏️</span> Edit</button>
        </div>
      </div>
    </div>
  )
}
