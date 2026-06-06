import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'
import './App.css'
import { apiFetch, setUnauthorizedHandler } from './api'
import AuthPage from './pages/AuthPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import Sidebar from './components/Sidebar'
import { ToastProvider } from './components/Toast'
import ChatPage from './pages/ChatPage'
import DashboardPage from './pages/DashboardPage'
import KnowledgeBasePage from './pages/KnowledgeBasePage'
import ReportPage from './pages/ReportPage'

export default function App() {
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('chat')
  const [chatSession, setChatSession] = useState(null)
  const [historyKey, setHistoryKey] = useState(0)
  const [initializing, setInitializing] = useState(true)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')

  const resetToken = new URLSearchParams(window.location.search).get('reset_token')

  // Apply theme ke <html>
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  useEffect(() => {
    setUnauthorizedHandler(() => {
      localStorage.clear()
      setUser(null)
    })

    const token = localStorage.getItem('access_token')
    if (!token) { setInitializing(false); return }

    apiFetch('/auth/me')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(me => {
        const userData = { name: me.full_name, email: me.email, role: me.role }
        setUser(userData)
        setPage(userData.role?.toLowerCase() === 'admin' ? 'dashboard' : 'chat')
      })
      .catch(() => localStorage.clear())
      .finally(() => setInitializing(false))
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
    setPage(userData.role?.toLowerCase() === 'admin' ? 'dashboard' : 'chat')
  }

  const handleSessionCreated = (sessionData) => {
    if (sessionData) {
      setChatSession({ session_id: sessionData.session_id, title: sessionData.title })
    }
    setHistoryKey(k => k + 1)
  }

  const handleLogout = async () => {
    await apiFetch('/auth/logout', { method: 'POST' })
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
    setPage('chat')
  }

  if (initializing) return null

  if (resetToken) {
    return (
      <ResetPasswordPage
        token={resetToken}
        onDone={() => {
          window.history.replaceState({}, '', window.location.pathname)
          window.location.reload()
        }}
      />
    )
  }

  if (!user) return <AuthPage onLogin={handleLogin} />

  return (
    <ToastProvider>
    <div className="app">
      <Sidebar page={page} setPage={setPage} user={user} onLogout={handleLogout} setChatSession={setChatSession} chatSession={chatSession} refreshKey={historyKey} />
      <div className="app-main">
        <div className="topbar">
          <div style={{ flex: 1 }}>
            <img src="/logo_light.png" alt="Epsolve" className="topbar-logo topbar-logo--light" />
            <img src="/logo_dark.png" alt="Epsolve" className="topbar-logo topbar-logo--dark" />
          </div>
          <button className="theme-btn" onClick={toggleTheme} title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {page === 'chat' && <ChatPage user={user} session={chatSession} onSessionCreated={handleSessionCreated} />}
          {page === 'dashboard' && user.role?.toLowerCase() === 'admin' && <DashboardPage user={user} />}
          {page === 'kb' && user.role?.toLowerCase() === 'admin' && <KnowledgeBasePage />}
          {page === 'report' && user.role?.toLowerCase() === 'admin' && <ReportPage />}
        </div>
      </div>
    </div>
    </ToastProvider>
  )
}
