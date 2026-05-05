import { useState } from 'react'
import { X, Copy } from 'lucide-react'
import './TicketDetailModal.css'
import { apiFetch } from '../api'

export default function TicketDetailModal({ ticket, onClose, onRespond }) {
  const [reply, setReply] = useState('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  const isAnswered = ticket.status !== 'open'
  const answer = ticket.admin_response || ''

  const handleCopy = () => {
    navigator.clipboard.writeText(answer)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleKirim = async () => {
    if (!reply.trim()) return
    setLoading(true)
    try {
      const res = await apiFetch(`/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'answered', admin_response: reply }),
      })
      if (res.ok) {
        onRespond()
        onClose()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal ticket-modal">
        <button className="modal-close" onClick={onClose}><X size={14} /></button>

        <div className="ticket-modal-header">
          <div>
            <h2>{ticket.category}</h2>
            <p className="ticket-modal-q">{ticket.description}</p>
          </div>
          <span className="ticket-tag">{ticket.division || ticket.category}</span>
        </div>

        <div className="ticket-modal-divider" />

        <div className="ticket-meta">
          <span>{ticket.user_email}</span>
          <span>{ticket.name}</span>
        </div>

        {isAnswered ? (
          <>
            <div className="field-label" style={{ marginTop: 16 }}>Balasan</div>
            <div className="answer-box">{answer || '-'}</div>
            <div className="modal-actions">
              <button className="btn-copy" onClick={handleCopy}>
                <Copy size={13} /> {copied ? 'Tersalin!' : 'Salin Balasan'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="field-label" style={{ marginTop: 16 }}>Balasan</div>
            <textarea
              className="reply-textarea"
              placeholder="Ketik balasan Anda di sini"
              value={reply}
              onChange={e => setReply(e.target.value)}
              disabled={loading}
            />
            <div className="modal-actions">
              <button
                className="btn-primary"
                onClick={handleKirim}
                disabled={loading || !reply.trim()}
              >
                {loading ? 'Mengirim...' : 'Kirim'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
