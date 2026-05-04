import { useState } from 'react'
import './App.css'
import AuthPage from './pages/AuthPage'
import Sidebar from './components/Sidebar'
import ChatPage from './pages/ChatPage'
import DashboardPage from './pages/DashboardPage'
import KnowledgeBasePage from './pages/KnowledgeBasePage'
import ReportPage from './pages/ReportPage'

export default function App() {
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('chat')

  const handleLogin = (userData) => {
    setUser(userData)
    setPage('chat')
  }

  const handleLogout = () => {
    setUser(null)
    setPage('chat')
  }

  // Not logged in → show auth
  if (!user) {
    return <AuthPage onLogin={handleLogin} />
  }

  return (
    <div className="app">
      <Sidebar page={page} setPage={setPage} user={user} onLogout={handleLogout} />
      <div className="app-main">
        <div className="topbar">
          <h1>Epsolve Smart Helpdesk</h1>
          {user.role === 'admin' && (
            <span className="admin-badge">Admin</span>
          )}
        </div>
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
          {page === 'chat' && <ChatPage user={user} />}
          {page === 'dashboard' && user.role === 'admin' && <DashboardPage />}
          {page === 'kb' && user.role === 'admin' && <KnowledgeBasePage />}
          {page === 'report' && user.role === 'admin' && <ReportPage />}
        </div>
      </div>
    </div>
  )
}
