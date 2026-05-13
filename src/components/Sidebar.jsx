import { useState, useEffect } from "react";
import {
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  History,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { apiFetch } from "../api";
import "./Sidebar.css";

const MenuIcon = () => (
  <svg width="13" height="15" viewBox="0 0 13 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.16667 0.5H9.83333M1.83333 3.16667H11.1667M1.83333 5.83333H11.1667C11.903 5.83333 12.5 6.43029 12.5 7.16667V12.5C12.5 13.2364 11.903 13.8333 11.1667 13.8333H1.83333C1.09695 13.8333 0.5 13.2364 0.5 12.5V7.16667C0.5 6.43029 1.09695 5.83333 1.83333 5.83333Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const DashboardIcon = () => (
  <svg width="13" height="15" viewBox="0 0 13 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0.5 6.5H2.5C2.85362 6.5 3.19276 6.64048 3.44281 6.89052C3.69286 7.14057 3.83333 7.47971 3.83333 7.83333V9.83333C3.83333 10.187 3.69286 10.5261 3.44281 10.7761C3.19276 11.0262 2.85362 11.1667 2.5 11.1667H1.83333C1.47971 11.1667 1.14057 11.0262 0.890524 10.7761C0.640476 10.5261 0.5 10.187 0.5 9.83333V6.5ZM0.5 6.5C0.5 5.71207 0.655195 4.93185 0.956723 4.2039C1.25825 3.47595 1.70021 2.81451 2.25736 2.25736C2.81451 1.70021 3.47595 1.25825 4.2039 0.956723C4.93185 0.655195 5.71207 0.5 6.5 0.5C7.28793 0.5 8.06815 0.655195 8.7961 0.956723C9.52405 1.25825 10.1855 1.70021 10.7426 2.25736C11.2998 2.81451 11.7417 3.47595 12.0433 4.2039C12.3448 4.93185 12.5 5.71207 12.5 6.5M12.5 6.5V9.83333M12.5 6.5H10.5C10.1464 6.5 9.80724 6.64048 9.55719 6.89052C9.30714 7.14057 9.16667 7.47971 9.16667 7.83333V9.83333C9.16667 10.187 9.30714 10.5261 9.55719 10.7761C9.80724 11.0262 10.1464 11.1667 10.5 11.1667H11.1667C11.5203 11.1667 11.8594 11.0262 12.1095 10.7761C12.3595 10.5261 12.5 10.187 12.5 9.83333M12.5 9.83333V11.1667C12.5 11.8739 12.219 12.5522 11.719 13.0523C11.2189 13.5524 10.5406 13.8333 9.83333 13.8333H6.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const KnowledgeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.66699 0.5C10.0726 0.500176 12.833 3.26135 12.833 6.66699C12.8329 8.33788 12.1682 9.85442 11.0889 10.9648C9.96863 12.1172 8.40118 12.8329 6.66699 12.833C4.93262 12.833 3.36444 12.1173 2.24414 10.9648C1.16488 9.85444 0.500087 8.33782 0.5 6.66699C0.5 3.26124 3.26124 0.5 6.66699 0.5ZM6.66699 8.83301C5.19228 8.83301 3.86215 9.4523 2.9209 10.4434L2.55078 10.833L2.96582 11.1738C3.97282 12.0017 5.2616 12.5 6.66699 12.5C8.07222 12.4999 9.36041 12.0015 10.3672 11.1738L10.7822 10.833L10.4121 10.4434C9.47101 9.4525 8.14154 8.8331 6.66699 8.83301ZM6.66699 0.833008C3.44533 0.833008 0.833008 3.44533 0.833008 6.66699C0.833078 7.95682 1.25249 9.14913 1.96191 10.1152L2.31152 10.5918L2.72363 10.168C3.72329 9.13969 5.12002 8.5 6.66699 8.5C8.21365 8.50009 9.60976 9.13979 10.6094 10.168L11.0205 10.5918L11.3701 10.1152C12.0797 9.14914 12.4999 7.95726 12.5 6.66699C12.5 3.44544 9.88852 0.833184 6.66699 0.833008ZM6.6875 2.81152C7.02353 3.62263 7.65163 4.27439 8.44629 4.62793H8.44727L8.62012 4.7041L8.41895 4.79492C7.74081 5.09654 7.18303 5.61492 6.8252 6.26562L6.68457 6.55176L6.66602 6.5918L6.64941 6.55273V6.55176C6.30739 5.76719 5.68948 5.13949 4.91504 4.79492L4.71289 4.70508L4.88672 4.62793C5.68149 4.27443 6.31048 3.62279 6.64648 2.81152L6.66602 2.76172L6.6875 2.81152Z" stroke="currentColor"/>
  </svg>
)

const AnalysisIcon = () => (
  <svg width="12" height="15" viewBox="0 0 12 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.16667 0.5V3.16667C7.16667 3.52029 7.30714 3.85943 7.55719 4.10948C7.80724 4.35952 8.14638 4.5 8.5 4.5H11.1667M3.16667 11.1667V10.5M5.83333 11.1667V7.16667M8.5 11.1667V9.16667M7.83333 0.5H1.83333C1.47971 0.5 1.14057 0.640476 0.890524 0.890524C0.640476 1.14057 0.5 1.47971 0.5 1.83333V12.5C0.5 12.8536 0.640476 13.1928 0.890524 13.4428C1.14057 13.6929 1.47971 13.8333 1.83333 13.8333H9.83333C10.187 13.8333 10.5261 13.6929 10.7761 13.4428C11.0262 13.1928 11.1667 12.8536 11.1667 12.5V3.83333L7.83333 0.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const ChatIcon = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.5 3.16667V7.16667M4.5 5.16667H8.5M12.5 8.5C12.5 8.85362 12.3595 9.19276 12.1095 9.44281C11.8594 9.69286 11.5203 9.83333 11.1667 9.83333H3.16667L0.5 12.5V1.83333C0.5 1.47971 0.640476 1.14057 0.890524 0.890524C1.14057 0.640476 1.47971 0.5 1.83333 0.5H11.1667C11.5203 0.5 11.8594 0.640476 12.1095 0.890524C12.3595 1.14057 12.5 1.47971 12.5 1.83333V8.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export default function Sidebar({
  page,
  setPage,
  user,
  onLogout,
  setChatSession,
  chatSession,
  refreshKey = 0,
}) {
  const [history, setHistory] = useState([]);
  const [histOpen, setHistOpen] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!user || user.role === "admin") return;
    apiFetch("/chat/sessions")
      .then((r) => r.json())
      .then((sessions) => {
        const arr = Array.isArray(sessions) ? sessions : [];
        const getTime = (s) => {
          const v = s?.updated_at || s?.created_at || s?.last_activity_at || s?.timestamp;
          const d = v ? new Date(v) : null;
          return d && !Number.isNaN(d.getTime()) ? d.getTime() : 0;
        };
        arr.sort((a, b) => getTime(b) - getTime(a));
        setHistory(arr.map((s) => ({ id: s.session_id, title: s.title })));
      })
      .catch(() => {});
  }, [user, refreshKey]);

  const adminPages = [
    { id: "dashboard", icon: <DashboardIcon />, label: "Dashboard Tiket" },
    { id: "kb", icon: <KnowledgeIcon />, label: "Knowledge Base" },
    { id: "report", icon: <AnalysisIcon />, label: "Analysis Report" },
  ];

  const isAdmin = user?.role?.toLowerCase() === "admin";

  const handleDeleteSession = async (sessionId) => {
    try {
      const res = await apiFetch(`/chat/sessions/${sessionId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus sesi");
      setHistory((prev) => prev.filter((h) => h.id !== sessionId));
      if (chatSession?.session_id === sessionId) {
        setChatSession(null);
        setPage("chat");
      }
      setOpenMenuId(null);
    } catch (err) {
      console.error("Error deleting session:", err);
    }
  };

  const handleMenuClick = (e, id) => {
    e.stopPropagation();
    if (openMenuId === id) { setOpenMenuId(null); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    setDropdownPos({ top: rect.top, left: rect.right + 6 });
    setOpenMenuId(id);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".nav-history-dropdown") && !e.target.closest(".nav-history-menu-btn")) {
        setOpenMenuId(null);
      }
    };
    if (openMenuId) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

  return (
    <aside className={`sidebar${collapsed ? " collapsed" : ""}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon"><MenuIcon /></div>
          <div>
            <div className="logo-title">Menu</div>
            <div className="logo-sub">Epsolve Smart Helpdesk</div>
          </div>
        </div>
        <button
          className="logo-chevron"
          onClick={() => setCollapsed((v) => !v)}
          title={collapsed ? "Perluas sidebar" : "Sembunyikan sidebar"}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {isAdmin ? (
          <>
            {adminPages.map((p) => (
              <button
                key={p.id}
                className={`nav-item ${page === p.id ? "active" : ""}`}
                onClick={() => setPage(p.id)}
              >
                {p.icon} <span>{p.label}</span>
              </button>
            ))}
          </>
        ) : (
          <>
            <button
              className={`nav-item ${page === "chat" && !chatSession ? "active" : ""}`}
              onClick={() => { setChatSession(null); setPage("chat"); }}
            >
              <ChatIcon /> <span>Obrolan Baru</span>
            </button>

            <button
              className="nav-group-btn"
              onClick={() => {
                if (collapsed) { setCollapsed(false); setHistOpen(true); }
                else setHistOpen((v) => !v);
              }}
            >
              <span className="nav-group-left">
                <History size={15} /> <span className="label">Riwayat</span>
              </span>
              {histOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>

            <div className={`nav-history ${histOpen ? "open" : ""}`}>
              {history.map((h) => (
                <div key={h.id} className="nav-history-item-wrapper">
                  <button
                    className={`nav-history-item ${page === "chat" && chatSession?.session_id === h.id ? "active" : ""}`}
                    onClick={() => { setPage("chat"); setChatSession({ session_id: h.id, title: h.title }); setOpenMenuId(null); }}
                  >
                    {h.title}
                  </button>
                  <button
                    className={`nav-history-menu-btn ${openMenuId === h.id ? "open" : ""}`}
                    onClick={(e) => handleMenuClick(e, h.id)}
                    title="Opsi"
                  >
                    <MoreHorizontal size={14} />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </nav>

      {/* Dropdown fixed — keluar dari sidebar */}
      {openMenuId && (
        <div
          className="nav-history-dropdown"
          style={{ top: dropdownPos.top, left: dropdownPos.left }}
        >
          <button
            className="dropdown-item dropdown-delete"
            onClick={(e) => { e.stopPropagation(); handleDeleteSession(openMenuId); }}
          >
            Hapus
          </button>
        </div>
      )}

      <div className="sidebar-footer">
        <div className="user-avatar">{user?.name?.[0]?.toUpperCase() || "U"}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="user-name">{user?.name || "User"}</div>
          <div className="user-email">{user?.email || ""}</div>
        </div>
        <button className="theme-btn" onClick={toggleTheme} title={theme === "dark" ? "Light mode" : "Dark mode"}>
          {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
        </button>
        <button className="logout-btn" onClick={onLogout} title="Keluar">
          <LogOut size={14} />
        </button>
      </div>
    </aside>
  );
}