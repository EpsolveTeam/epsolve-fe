import { useState, useEffect } from 'react'
import './App.css'
import { apiFetch, setUnauthorizedHandler } from './api'
import AuthPage from './pages/AuthPage'
import Sidebar from './components/Sidebar'
import ChatPage from './pages/ChatPage'
import DashboardPage from './pages/DashboardPage'
import KnowledgeBasePage from './pages/KnowledgeBasePage'
import ReportPage from './pages/ReportPage'

export default function App() {
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('chat')
  const [chatSession, setChatSession] = useState(null) // null for new, {session_id, title} for history
  const [initializing, setInitializing] = useState(true)

  // Auto-login: cek token tersimpan saat pertama kali render
  useEffect(() => {
    setUnauthorizedHandler(() => {
      localStorage.clear()
      setUser(null)
    })

    const token = localStorage.getItem('access_token')
    if (!token) {
      setInitializing(false)
      return
    }

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

  const handleLogout = async () => {
    await apiFetch('/auth/logout', { method: 'POST' })
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
    setPage('chat')
  }

  if (initializing) return null

  if (!user) {
    return <AuthPage onLogin={handleLogin} />
  }

  return (
    <div className="app">
      <Sidebar page={page} setPage={setPage} user={user} onLogout={handleLogout} setChatSession={setChatSession} chatSession={chatSession} />
      <div className="app-main">
        <div className="topbar">
          <h1>Epsolve Smart Helpdesk</h1>
           {user.role?.toLowerCase() === 'admin' && (
             <span className="admin-badge">Admin</span>
           )}
        </div>
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {page === 'chat' && <ChatPage user={user} session={chatSession} />}
          {page === 'dashboard' && user.role?.toLowerCase() === 'admin' && <DashboardPage user={user} />}
          {page === 'kb' && user.role?.toLowerCase() === 'admin' && <KnowledgeBasePage />}
          {page === 'report' && user.role?.toLowerCase() === 'admin' && <ReportPage />}
        </div>
      </div>
    </div>
  )
}
