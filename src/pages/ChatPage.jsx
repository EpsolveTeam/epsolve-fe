import { useState, useEffect, useRef } from 'react'
import { Image, ArrowUp, ExternalLink, AlertCircle } from 'lucide-react'
import { apiFetch } from '../api'
import TicketFormModal from '../components/TicketFormModal'
import './ChatPage.css'



export default function ChatPage({ user, session }) {
  const [chatState, setChatState] = useState('idle')
  const [input, setInput] = useState('')
  const [showTicketForm, setShowTicketForm] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const userName = user?.name || 'User'

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (session) {
      // Load history
      setSessionId(session.session_id)
      apiFetch('/chat/history/' + session.session_id)
        .then(r => r.json())
        .then(history => {
          const allMsgs = []
          history.forEach(h => {
            allMsgs.push({
              id: h.id + '_user',
              type: 'user',
              content: h.user_query,
              image: h.image_query_url,
              created_at: h.created_at
            })
            allMsgs.push({
              id: h.id + '_bot',
              type: 'bot',
              content: h.bot_response,
              resolved: h.is_resolved,
              created_at: h.created_at
            })
          })
          allMsgs.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
          setMessages(allMsgs)
          setChatState('response')
        })
        .catch(() => setChatState('error'))
    } else {
      // New chat
      setSessionId(crypto.randomUUID())
      setMessages([])
      setChatState('idle')
    }
  }, [session])

  const SHORTCUT_OPTIONS = [
    { label: 'Produksi & Operasional' },
    { label: 'Troubleshooting Perangkat' },
    { label: 'Sistem & IT Support' },
    { label: 'Maintenance & Setup' },
  ]

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedImage(file)
    }
  }

  const handleImageClick = () => {
    fileInputRef.current.click()
  }

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return
    const userQuery = input.trim() || 'Image query'
    setInput('')
    setMessages(prev => [...prev, { id: Date.now(), type: 'user', content: userQuery, image: selectedImage }])
    setChatState('loading')

    const formData = new FormData()
    formData.append('session_id', sessionId)
    formData.append('user_query', userQuery)
    if (selectedImage) {
      formData.append('image', selectedImage)
    }
    setSelectedImage(null)

    try {
      const res = await apiFetch('/chat', {
        method: 'POST',
        body: formData
      })
      if (res.ok) {
        const responseData = await res.json()
        const botResponse = responseData.data?.chat_log?.bot_response || 'No response'
        setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', content: botResponse }])
        setChatState('response')
      } else {
        setChatState('error')
      }
    } catch (e) {
      setChatState('error')
    }
  }

  const handleShortcut = (text) => {
    setInput(text)
    handleSend()
  }

  return (
    <div className="chat-page">
      <div className="chat-messages">
        {messages.length === 0 && chatState === 'idle' && (
          <div className="chat-empty-state">
            <div className="empty-main">
              <span className="empty-robot">🤖</span>
              <div className="empty-texts">
                <div className="empty-greeting-small">Hi, {userName}</div>
                <div className="empty-greeting">Butuh bantuan? Ketik<br />masalah Anda di sini</div>
              </div>
            </div>

            <div className="chat-input-bar chat-input-bar--centered">
              {selectedImage && (
                <div className="image-preview">
                  <img src={URL.createObjectURL(selectedImage)} alt="Preview" />
                  <button onClick={() => setSelectedImage(null)}>✕</button>
                </div>
              )}
              <div className="chat-input-wrap">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageSelect}
                />
                <button className="input-img-btn" title="Upload image" onClick={handleImageClick}><Image size={16} /></button>
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

        {messages.map(msg => (
          <div key={msg.id} style={{ alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start' }}>
            {msg.image && <img src={typeof msg.image === 'string' ? msg.image : URL.createObjectURL(msg.image)} alt="Uploaded" style={{ maxWidth: '200px', marginBottom: '8px', display: 'block' }} />}
            <div className={`msg ${msg.type === 'user' ? 'user-msg' : 'bot-msg'}`}>
              {msg.content}
            </div>
          </div>
        ))}

        {chatState === 'loading' && (
          <div className="msg bot-msg loading-msg">
            <span className="dot" /><span className="dot" /><span className="dot" />
          </div>
        )}

        <div ref={messagesEndRef} />

        {chatState === 'error' && (
          <div className="error-bubble">
            <div className="error-title"><AlertCircle size={15} /> Error</div>
            <p>Gagal mengirim pesan. Coba lagi.</p>
          </div>
        )}
      </div>

      {(messages.length > 0 || chatState !== 'idle') && (
        <div className="chat-input-bar">
          {selectedImage && (
            <div className="image-preview">
              <img src={URL.createObjectURL(selectedImage)} alt="Preview" />
              <button onClick={() => setSelectedImage(null)}>✕</button>
            </div>
          )}
          <div className="chat-input-wrap">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageSelect}
            />
            <button className="input-img-btn" title="Upload image" onClick={handleImageClick}><Image size={16} /></button>
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