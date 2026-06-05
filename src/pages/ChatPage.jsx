import { useState, useEffect, useRef } from 'react'
import { Image, ArrowUp, ExternalLink, AlertCircle } from 'lucide-react'
import { apiFetch } from '../api'
import TicketFormModal from '../components/TicketFormModal'
import './ChatPage.css'

const createSessionId = () => {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID()
  }
  return `session-${Date.now()}-${Math.floor(Math.random() * 100000)}`
}

export default function ChatPage({ user, session, onSessionCreated }) {
  const [chatState, setChatState] = useState('idle')
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [showTicketForm, setShowTicketForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sessionId, setSessionId] = useState(session?.session_id || null)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState('')
  const [imageName, setImageName] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [lastBotMeta, setLastBotMeta] = useState({ no_answer: false, ticket_flag: false })
  const [categoryWarning, setCategoryWarning] = useState(false)
  const fileInputRef = useRef(null)
  const messagesEndRef = useRef(null)
  const userName = user?.name || 'User'

  const CATEGORY_OPTIONS = [
    'Produksi & Operasi',
    'Troubleshooting Perangkat',
    'Sistem & IT Support',
    'Maintenance & Setup',
    'Service Repair',
    'Kebijakan Internal',
    'Penggunaan Tools',
    'General',
  ]

  useEffect(() => {
    if (session?.session_id) {
      if (session.session_id !== sessionId) {
        setSessionId(session.session_id)
      }
      setSelectedCategory(null)
      setLastBotMeta({ no_answer: false, ticket_flag: false })
      loadChatHistory(session.session_id)
      return
    }

    setSessionId(null)
    setMessages([])
    setChatState('idle')
    setSelectedCategory(null)
    setCategoryWarning(false)
    setLastBotMeta({ no_answer: false, ticket_flag: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  const loadChatHistory = async (id) => {
    setError('')
    setChatState('loading')
    setLoading(true)

    try {
      const res = await apiFetch(`/chat/history/${encodeURIComponent(id)}`)
      if (!res.ok) {
        throw new Error('Gagal memuat riwayat chat')
      }
      const history = await res.json()
      const toImageUrl = (imageUrl) => {
        if (!imageUrl) return undefined
        if (typeof imageUrl === 'string' && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
          return imageUrl
        }
        return imageUrl.startsWith('/')
          ? `${import.meta.env.VITE_API_BASE_URL || ''}${imageUrl}`
          : `${import.meta.env.VITE_API_BASE_URL || ''}/${imageUrl}`
      }

      const ordered = history
        .flatMap(entry => [
          {
            id: `user-${entry.id}`,
            role: 'user',
            text: entry.user_query,
            imageUrl: toImageUrl(entry.image_query_url || entry.image_url),
            created_at: entry.created_at,
          },
          { id: `bot-${entry.id}`, role: 'bot', text: (entry.bot_response || '').replace(/CREATE_SUPPORT_TICKET_FLAG\s*/gi, '').trim(), created_at: entry.created_at },
        ])
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))

      setMessages(ordered)
      setChatState(ordered.length ? 'response' : 'idle')

      if (history.length > 0) {
        const lastEntry = history[history.length - 1]
        setLastBotMeta({
          no_answer: lastEntry.no_answer === true,
          ticket_flag: lastEntry.ticket_flag === true,
          user_query: lastEntry.user_query || '',
          category: lastEntry.category || null,
          image_query_url: lastEntry.image_query_url || null,
        })
      } else {
        setLastBotMeta({ no_answer: false, ticket_flag: false })
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat memuat riwayat chat')
      setChatState('error')
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!input.trim()) {
      if (imageFile) {
        setError('Tambahkan teks sebelum mengirim gambar')
      }
      return
    }

    const isNewSession = !sessionId

    if (isNewSession && !selectedCategory) {
      setCategoryWarning(true)
      return
    }

    setCategoryWarning(false)
    setError('')
    setLoading(true)
    setChatState('loading')
    const activeSessionId = sessionId || createSessionId()

    const capturedInput = input
    const capturedImagePreviewUrl = imagePreviewUrl
    const capturedImageName = imageName

    setInput('')
    setImageFile(null)
    setImagePreviewUrl('')
    setImageName('')

    const userMessage = {
      id: `${activeSessionId}-user-${Date.now()}`,
      role: 'user',
      text: capturedInput,
      imageUrl: capturedImagePreviewUrl || undefined,
    }

    const loadingId = `${activeSessionId}-loading-${Date.now()}`
    const loadingMessage = { id: loadingId, role: 'bot', loading: true }

    setMessages(prev => [...prev, userMessage, loadingMessage])
    setSessionId(activeSessionId)

    const formData = new FormData()
    formData.append('session_id', activeSessionId)
    formData.append('user_query', capturedInput)
    if (selectedCategory) {
      formData.append('category', selectedCategory)
    }
    if (imageFile) {
      formData.append('image', imageFile)
    }

    try {
      const res = await apiFetch('/chat/', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.detail || 'Gagal mengirim chat ke server')
      }

      const data = await res.json()
      // Remove internal flag markers from bot response text before displaying
      let botText = (data?.data?.chat_log?.bot_response || '')
        .replace(/CREATE_SUPPORT_TICKET_FLAG\s*/gi, '')
        .trim()

      // Extract no_answer and ticket_flag booleans from backend response
      const noAnswer = data?.data?.no_answer === true
      const ticketFlag = data?.data?.ticket_flag === true
      setLastBotMeta({
        no_answer: noAnswer,
        ticket_flag: ticketFlag,
        user_query: capturedInput,
        category: selectedCategory,
        image_query_url: data?.data?.chat_log?.image_query_url || null,
      })

      setMessages(prev => prev.map(msg => msg.id === loadingId
        ? { ...msg, loading: false, text: botText }
        : msg
      ))
      setChatState('response')
      if (isNewSession) onSessionCreated?.()
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat mengirim pesan')
      setChatState('error')
      setMessages(prev => prev.filter(msg => !msg.loading))
    } finally {
      setLoading(false)
    }
  }

  const removeImage = () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl)
    }
    setImageFile(null)
    setImagePreviewUrl('')
    setImageName('')
  }

  const handleImagePick = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl)
      }
      setImageFile(file)
      setImagePreviewUrl(URL.createObjectURL(file))
      setImageName(file.name)
    }
  }

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat)
    setCategoryWarning(false)
  }

  const openImagePicker = () => {
    fileInputRef.current?.click()
  }

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl)
      }
    }
  }, [])

  useEffect(() => {
    const el = messagesEndRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [messages])

  const hasCompletedBotResponse = messages.some(msg => msg.role === 'bot' && !msg.loading)
  const hasLoadingMessage = messages.some(msg => msg.loading)

  const showEscalateButton = hasCompletedBotResponse && !hasLoadingMessage && lastBotMeta.no_answer

  const renderTextWithLinks = (text) => {
    if (!text) return { cleanText: '', urls: [] }
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const urls = text.match(urlRegex) || []
    const cleanText = urls.reduce((t, url) => t.replace(url, '').trim(), text)
    return { cleanText, urls }
  }

  const renderMessages = () => {
    if (messages.length === 0 && !loading && !error) {
      return (
        <div className="chat-empty-state">
          <div className="empty-main">
            <span className="empty-robot">🤖</span>
            <div className="empty-texts">
              <div className="empty-greeting-small">Hi, {userName}</div>
              <div className="empty-greeting">Butuh bantuan? Ketik masalah Anda di sini</div>
            </div>
          </div>

          <div className="chat-input-bar chat-input-bar--centered">
            <div className="chat-input-bar-row">
              <div className={`chat-input-wrap ${imagePreviewUrl ? 'has-image' : ''}`}>
                {imagePreviewUrl && (
                  <div className="input-top-row">
                    <div className="image-preview-chip">
                      <span className="image-preview-name">{imageName}</span>
                      <button type="button" className="image-remove-btn" onClick={removeImage}>×</button>
                    </div>
                  </div>
                )}
                <div className="input-bottom-row">
                  <button className="input-img-btn" type="button" title="Upload image" onClick={openImagePicker}><Image size={16} /></button>
                  <input
                    type="text"
                    placeholder={selectedCategory ? 'Tanyakan apa saja' : 'Pilih kategori terlebih dahulu...'}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                  />
                </div>
              </div>
              <button className="send-btn" type="button" onClick={handleSend}><ArrowUp size={16} /></button>
            </div>
            {categoryWarning && (
              <p className="category-warning">Pilih kategori masalah terlebih dahulu</p>
            )}
          </div>

          <div className="category-section">
            <p className="category-prompt">Pilih kategori masalah Anda:</p>
            <div className="category-grid">
              {CATEGORY_OPTIONS.map((cat) => (
                <button
                  key={cat}
                  className={`category-btn${selectedCategory === cat ? ' active' : ''}`}
                  type="button"
                  onClick={() => handleCategorySelect(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    }

    return messages.map(message => (
      message.role === 'user' ? (
        <div key={message.id} className="user-message-block">
          {message.imageUrl && (
            <div className="user-message-image-wrap">
              <img src={message.imageUrl} alt="Preview" className="user-message-image" />
            </div>
          )}
          <div className="msg user-msg">{message.text}</div>
        </div>
      ) : message.loading ? (
        <div key={message.id} className="msg bot-msg loading-msg">
          <span className="dot" /><span className="dot" /><span className="dot" />
        </div>
      ) : (() => {
        const { cleanText, urls } = renderTextWithLinks(message.text)
        return (
          <div key={message.id} className="bot-response">
            {cleanText && <p>{cleanText}</p>}
            {urls.length > 0 && (
              <div className="chat-link-section">
                {urls.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="chat-link"
                  >
                    <span className="chat-link-text">{url}</span>
                    <ExternalLink size={13} className="chat-link-icon" />
                  </a>
                ))}
              </div>
            )}
          </div>
        )
      })()
    ))
  }

  return (
    <div className="chat-page">
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImagePick} />
      <div className="chat-messages" ref={messagesEndRef}>
        {messages.length > 0 || loading || error ? (
          <>
            <div className="chat-messages-spacer" />
            <div className="chat-messages-inner">
              {renderMessages()}
              {error && (
                <div className="error-bubble">
                  <div className="error-title"><AlertCircle size={15} /> Terjadi Kesalahan</div>
                  <p>{error}</p>
                </div>
              )}
               {showEscalateButton && (
                <>
                  <div className="no-answer-banner">
                    <em>Maaf, belum ditemukan jawaban yang tepat untuk pertanyaan Anda. Silakan ajukan pertanyaan Anda langsung ke tim Customer Support kami untuk ditindaklanjuti.</em>
                  </div>
                  <button className="escalate-btn escalate-btn--active" type="button" onClick={() => setShowTicketForm(true)}>
                    Ajukan Pertanyaan ke Customer Support <ExternalLink size={13} />
                  </button>
                </>
              )}
            </div>
          </>
        ) : (
          renderMessages()
        )}
      </div>

      {(chatState !== 'idle' || messages.length > 0) && (
        <div className="chat-input-section chat-input-section--session">
          <div className="chat-input-bar-row">
            {/* ↓ tambah class --floating agar tanpa background container */}
            <div className={`chat-input-wrap chat-input-wrap--floating ${imagePreviewUrl ? 'has-image' : ''}`}>
              {imagePreviewUrl && (
                <div className="input-top-row">
                  <div className="image-preview-chip">
                    <span className="image-preview-name">{imageName}</span>
                    <button type="button" className="image-remove-btn" onClick={removeImage}>×</button>
                  </div>
                </div>
              )}
              <div className="input-bottom-row">
                <button className="input-img-btn" type="button" title="Upload image" onClick={openImagePicker}><Image size={16} /></button>
                <input
                  type="text"
                  placeholder="Tanyakan apa saja"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                />
              </div>
            </div>
            <button className="send-btn" type="button" onClick={handleSend}><ArrowUp size={16} /></button>
          </div>
        </div>
      )}

      {showTicketForm && (
        <TicketFormModal
          onClose={() => setShowTicketForm(false)}
          user={user}
          sessionId={sessionId}
          initialQuery={lastBotMeta.user_query}
          initialCategory={lastBotMeta.category}
        />
      )}
    </div>
  )
}