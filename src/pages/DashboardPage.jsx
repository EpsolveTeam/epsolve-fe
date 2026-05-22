import { useState, useRef, useEffect } from "react";
import { ChevronDown, ArrowUpRight, Check, RotateCcw } from "lucide-react";
import TicketDetailModal from "../components/TicketDetailModal";
import TicketFormModal from "../components/TicketFormModal";
import "./DashboardPage.css";
import { apiFetch } from "../api";

const DIVISIONS = [
  "Operations",
  "R&D",
  "Marketing",
  "Finance",
  "Customer Service",
];
const QUESTION_TYPES = [
  "General",
  "Sistem & IT Support",
  "Troubleshooting Perangkat",
  "Service Repair",
  "Maintenance & Setup",
  "Produksi & Operasi",
  "Kebijakan Internal",
  "Penggunaan Tools",
];

function FilterDropdown({
  label,
  options,
  selected,
  onChange,
  type = "checkbox",
}) {
  const [open, setOpen] = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const dropRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target) &&
        dropRef.current &&
        !dropRef.current.contains(e.target)
      )
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropPos({ top: rect.bottom + 6, left: rect.left });
    }
    setOpen((o) => !o);
  };

  const toggle = (val) => {
    if (type === "radio") {
      onChange([val]);
    } else {
      onChange(
        selected.includes(val)
          ? selected.filter((s) => s !== val)
          : [...selected, val],
      );
    }
  };

  return (
    <div className="th-filter-wrap">
      <span
        ref={triggerRef}
        className={`th-filter-trigger ${open || selected.length ? "active" : ""}`}
        onClick={handleOpen}
      >
        {label} <ChevronDown size={12} className={open ? "rotated" : ""} />
        {selected.length > 0 && <span className="filter-dot" />}
      </span>
      {open && (
        <div
          ref={dropRef}
          className="filter-dropdown"
          style={{ position: "fixed", top: dropPos.top, left: dropPos.left }}
        >
          <div className="filter-reset" onClick={() => onChange([])}>
            <RotateCcw size={11} /> Reset
          </div>
          {options.map((opt) => (
            <label key={opt} className="filter-option">
              {type === "radio" ? (
                <input
                  type="radio"
                  checked={selected.includes(opt)}
                  onChange={() => toggle(opt)}
                />
              ) : (
                <input
                  type="checkbox"
                  checked={selected.includes(opt)}
                  onChange={() => toggle(opt)}
                />
              )}
              {opt}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage({ user }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const [filterDivisi, setFilterDivisi] = useState([]);
  const [filterStatus, setFilterStatus] = useState([]);
  const [filterTiket, setFilterTiket] = useState([]);
  const [chatCategoryCounts, setChatCategoryCounts] = useState({});
  const rowsPerPage = 10;

  const fetchTickets = () => {
    setLoading(true);
    apiFetch("/tickets/")
      .then((r) => r.json())
      .then((data) => setTickets(Array.isArray(data) ? data : []))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  };

  const fetchChatCategoryStats = () => {
    apiFetch("/chat/category-stats")
      .then((r) => r.json())
      .then((data) => setChatCategoryCounts(data && typeof data === "object" ? data : {}))
      .catch(() => setChatCategoryCounts({}));
  };

  useEffect(() => {
    fetchTickets();
    fetchChatCategoryStats();
  }, []);

  const filteredTickets = tickets.filter((t) => {
    if (filterDivisi.length && !filterDivisi.includes(t.division)) return false;
    if (filterStatus.length) {
      const isAnswered = t.status !== "open";
      const isTerjawab = filterStatus.includes("Terjawab") && isAnswered;
      const isBelum = filterStatus.includes("Belum Terjawab") && !isAnswered;
      if (!isTerjawab && !isBelum) return false;
    }
    if (filterTiket.length && !filterTiket.includes(t.category)) return false;
    return true;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTickets.length / rowsPerPage),
  );
  const pagedTickets = filteredTickets.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage,
  );
  const changeFilter = (setter) => (val) => {
    setter(val);
    setPage(1);
  };

  return (
    <div className="page-content">
      <h1 className="page-title">Dashboard Tiket</h1>

      <div className="total-card">
        <span>Total Pertanyaan</span>
        <span className="total-num">{tickets.length}</span>
      </div>

      <div className="categories-grid">
        <div className="categories-grid-header">Frekuensi Chatbot per Kategori</div>
        {QUESTION_TYPES.map((label) => (
          <div key={label} className="category-row">
            <span>{label}</span>
            <span className="category-count">{chatCategoryCounts[label] || 0}</span>
          </div>
        ))}
      </div>

      <div className="dash-table-wrap">
        <div className="dash-custom-table">
          <div className="dash-header">
            <div className="dash-h-tiket">
              <FilterDropdown
                label="Tiket"
                options={QUESTION_TYPES}
                selected={filterTiket}
                onChange={changeFilter(setFilterTiket)}
              />
            </div>
            <div className="dash-h-divisi">
              <FilterDropdown
                label="Divisi"
                options={DIVISIONS}
                selected={filterDivisi}
                onChange={changeFilter(setFilterDivisi)}
              />
            </div>
            <div className="dash-h-email">Email</div>
            <div className="dash-h-nama">Nama</div>
            <div className="dash-h-status">
              <FilterDropdown
                label="Status"
                options={["Terjawab", "Belum Terjawab"]}
                selected={filterStatus}
                onChange={changeFilter(setFilterStatus)}
              />
            </div>
          </div>

          <div className="dash-body">
            {loading ? (
              <div className="dash-state">Memuat tiket...</div>
            ) : pagedTickets.length === 0 ? (
              <div className="dash-state">Tidak ada tiket.</div>
            ) : (
              pagedTickets.map((t) => (
                <div key={t.id} className="dash-row">
                  <div className="dash-tiket">
                    <span className="ticket-type">{t.category}</span>
                    <span className="ticket-q">{t.description}</span>
                  </div>
                  <div className="dash-divisi">
                    <span className="division-badge">{t.division}</span>
                  </div>
                  <div className="dash-email muted">{t.user_email}</div>
                  <div className="dash-nama muted">{t.name}</div>
                  <div className="dash-status">
                    {t.status !== "open" ? (
                      <button
                        className="status-badge answered"
                        onClick={() => setSelectedTicket(t)}
                        title="Lihat jawaban"
                      >
                        <Check size={12} /> Terjawab
                      </button>
                    ) : (
                      <button
                        className="status-badge respon"
                        onClick={() => setSelectedTicket(t)}
                      >
                        Respon <ArrowUpRight size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="table-footer">
          <span className="muted">
            {filteredTickets.length} tiket ditemukan.
          </span>
          <div className="pagination">
            <span className="muted">Rows per page</span>
            <select className="rows-select">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            <span className="muted">
              Page {page} of {totalPages}
            </span>
            <div className="page-btns">
              <button onClick={() => setPage(1)}>«</button>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))}>
                ‹
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                ›
              </button>
              <button onClick={() => setPage(totalPages)}>»</button>
            </div>
          </div>
        </div>
      </div>

      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onRespond={() => {
            setSelectedTicket(null);
            fetchTickets();
          }}
        />
      )}
      {showForm && (
        <TicketFormModal onClose={() => setShowForm(false)} user={user} />
      )}
    </div>
  );
}
