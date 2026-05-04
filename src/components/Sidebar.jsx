import { useState } from 'react'
import { LayoutDashboard, BookOpen, FileText, MessageSquare, ChevronDown, ChevronUp, Plus, History, LogOut } from 'lucide-react'
import './Sidebar.css'

const history = ['Cara Download Driver P...', 'Proyektor Rusak', 'Cara Memasukkan Tinta']

export default function Sidebar({ page, setPage, user, onLogout }) {
  const [histOpen, setHistOpen] = useState(true)

  const adminPages = [
    { id: 'dashboard', icon: <LayoutDashboard size={15} />, label: 'Dashboard Tiket' },
    { id: 'kb', icon: <BookOpen size={15} />, label: 'Knowledge Base' },
    { id: 'report', icon: <FileText size={15} />, label: 'Analysis Report' },
  ]

  const isChatPage = page === 'chat'
  const isAdmin = user?.role === 'admin'

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon"><MessageSquare size={14} /></div>
          <div>
            <div className="logo-title">Menu</div>
            <div className="logo-sub">Epsolve Smart Helpdesk</div>
          </div>
        </div>
        <button className="logo-chevron"><ChevronDown size={14} /></button>
      </div>

      <nav className="sidebar-nav">
        {isAdmin ? (
          /* Admin: show chat + admin pages */
          <>
            <button
              className={`nav-item ${page === 'chat' ? 'active' : ''}`}
              onClick={() => setPage('chat')}
            >
              <MessageSquare size={15} /> Chatbot
            </button>
            <div className="nav-divider" />
            {adminPages.map(p => (
              <button
                key={p.id}
                className={`nav-item ${page === p.id ? 'active' : ''}`}
                onClick={() => setPage(p.id)}
              >
                {p.icon} {p.label}
              </button>
            ))}
          </>
        ) : (
          /* User: only chat with history */
          <>
            <button className="nav-item" onClick={() => setPage('chat')}>
              <Plus size={15} /> Obrolan Baru
            </button>
            <button className="nav-group-btn" onClick={() => setHistOpen(v => !v)}>
              <span className="nav-group-left"><History size={15} /> Riwayat</span>
              {histOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
            {histOpen && (
              <div className="nav-history">
                {history.map(h => (
                  <button key={h} className="nav-history-item">{h}</button>
                ))}
              </div>
            )}
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="user-avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
        <div style={{flex:1, minWidth:0}}>
          <div className="user-name">{user?.name || 'User'}</div>
          <div className="user-email">{user?.email || ''}</div>
        </div>
        <button className="logout-btn" onClick={onLogout} title="Keluar">
          <LogOut size={14} />
        </button>
      </div>
    </aside>
  )
}
