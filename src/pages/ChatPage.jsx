import { useState } from 'react'
import { Image, ArrowUp, ExternalLink, AlertCircle } from 'lucide-react'
import TicketFormModal from '../components/TicketFormModal'
import './ChatPage.css'

const STATES = ['idle', 'loading', 'response', 'error']

export default function ChatPage({ user }) {
  const [chatState, setChatState] = useState('idle')
  const [input, setInput] = useState('')
  const [showTicketForm, setShowTicketForm] = useState(false)
  const userName = user?.name || 'User'

  const SHORTCUT_OPTIONS = [
    { label: 'Produksi & Operasional' },
    { label: 'Troubleshooting Perangkat' },
    { label: 'Sistem & IT Support' },
    { label: 'Maintenance & Setup' },
  ]

  const handleSend = () => {
    if (!input.trim() && chatState === 'idle') return
    setChatState('loading')
    setTimeout(() => setChatState('response'), 1500)
  }

  const handleShortcut = (text) => {
    setInput(text)
    setChatState('loading')
    setTimeout(() => setChatState('response'), 1500)
  }

  const userMsg = 'Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?'

  return (
    <div className="chat-page">
      <div className="chat-messages">
        {chatState === 'idle' && (
          <div className="chat-empty-state">
            <div className="empty-main">
              <span className="empty-robot">🤖</span>
              <div className="empty-texts">
                <div className="empty-greeting-small">Hi, {userName}</div>
                <div className="empty-greeting">Butuh bantuan? Ketik<br />masalah Anda di sini</div>
              </div>
            </div>

            <div className="chat-input-bar chat-input-bar--centered">
              <div className="chat-input-wrap">
                <button className="input-img-btn" title="Upload image"><Image size={16} /></button>
                <input
                  type="text"
                  placeholder="Tanyakan apa saja"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                />
                <button className="send-btn" onClick={handleSend}><ArrowUp size={16} /></button>
              </div>
              <div className="chat-shortcuts">
                {SHORTCUT_OPTIONS.map(({ label }) => (
                  <button
                    key={label}
                    className="shortcut-btn"
                    onClick={() => handleShortcut(label)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {chatState !== 'idle' && (
          <div className="msg user-msg">{userMsg}</div>
        )}

        {chatState === 'loading' && (
          <div className="msg bot-msg loading-msg">
            <span className="dot" /><span className="dot" /><span className="dot" />
          </div>
        )}

        {chatState === 'response' && (
          <div className="bot-response">
            <h3>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</h3>
            <br />
            <p>a. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
            <p>b. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            <p>c. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>
            <br />
            <p>Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.</p>
            <br />
            <h3>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</h3>
            <br />
            <p>a. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            <p>b. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            <br />
            <button className="escalate-btn" onClick={() => setShowTicketForm(true)}>
              Ajukan Pertanyaan ke Customer Support <ExternalLink size={13} />
            </button>
          </div>
        )}

        {chatState === 'error' && (
          <div className="error-bubble">
            <div className="error-title"><AlertCircle size={15} /> Error XXX</div>
            <p>Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur</p>
          </div>
        )}
      </div>

      {chatState !== 'idle' && (
        <div className="chat-input-bar">
          <div className="chat-input-wrap">
            <button className="input-img-btn" title="Upload image"><Image size={16} /></button>
            <input
              type="text"
              placeholder="Tanyakan apa saja"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button className="send-btn" onClick={handleSend}><ArrowUp size={16} /></button>
          </div>
        </div>
      )}

      {showTicketForm && <TicketFormModal onClose={() => setShowTicketForm(false)} user={user} />}
    </div>
  )
}