import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import styles from "../../styles/Proposal.module.css";

const API = "http://localhost:5000";

const DB_STATUS = ["pending", "approved", "completed"];
const statusLabel = {
  pending: "Proposal",
  approved: "In Progress",
  completed: "Complete",
};

const STORAGE_KEY = "proposal_items_cache_v1";
const STORAGE_DEPT_KEY = "selected_dept"; 

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function saveToStorage(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items ?? []));
  } catch {}
}

export function SuggestionList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState("");

  const [deptFilter, setDeptFilter] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_DEPT_KEY) || "";
    } catch {
      return "";
    }
  });

  useEffect(() => {
    let mounted = true;

    const cached = loadFromStorage();
    if (cached && Array.isArray(cached) && cached.length) {
      setItems(cached);
      setLoading(false);
    }

    (async () => {
      try {
        const res = await fetch(`${API}/api/suggestions`);
        const data = await res.json();
        const next = Array.isArray(data) ? data.map(adaptFromDB) : [];
        if (!mounted) return;

        if (next.length) {
          setItems(next);
          saveToStorage(next);
        } else if (!cached) {
          const fallback = getFallback();
          setItems(fallback);
          saveToStorage(fallback);
        }
      } catch {
        if (!cached) {
          const fallback = getFallback();
          setItems(fallback);
          saveToStorage(fallback);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    function onDept(e) {
      const next = (e.detail && e.detail.dept) || "";
      setDeptFilter(next);
    }
    window.addEventListener("dept:changed", onDept);
    return () => window.removeEventListener("dept:changed", onDept);
  }, []);

  useEffect(() => {
    function onUrgentChanged(e) {
      const { id, urgent } = e.detail || {};
      if (!id) return;
      setItems((prev) => {
        const next = prev.map((x) => (x.id === id ? { ...x, urgent } : x));
        saveToStorage(next);
        return next;
      });
    }
    window.addEventListener("suggestion:urgent", onUrgentChanged);
    return () => window.removeEventListener("suggestion:urgent", onUrgentChanged);
  }, []);

  const updateStatus = async (id, next) => {
    setItems((prev) => {
      const updated = prev.map((x) => (x.id === id ? { ...x, status: next } : x));
      saveToStorage(updated);
      return updated;
    });
    try {
      await fetch(`${API}/api/suggestions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
    } catch {}
  };

  const toggleUrgent = async (id, next) => {
    setItems((prev) => {
      const updated = prev.map((x) => (x.id === id ? { ...x, urgent: next } : x));
      const changed = updated.find((x) => x.id === id);
      saveToStorage(updated);

      window.dispatchEvent(
        new CustomEvent("suggestion:urgent", {
          detail: { id, urgent: next, item: changed },
        })
      );
      return updated;
    });

    try {
      const r = await fetch(`${API}/api/suggestions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_urgent: next }),
      });
      if (!r.ok) {
        await fetch(`${API}/api/suggestions/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ urgent: next }),
        });
      }
    } catch {}
  };
  const viewItems = useMemo(() => {
    let arr = items;

    if (deptFilter) {
      arr = arr.filter((x) => String(x.dept || "") === deptFilter);
    }

    if (filter) {
      arr = arr.filter((x) => x.status === filter);
    }

    return arr
      .slice()
      .sort((a, b) => {
        if (a.urgent !== b.urgent) return a.urgent ? -1 : 1;
        const da = new Date(a.created_at);
        const db = new Date(b.created_at);
        return db - da; 
      });
  }, [items, filter, deptFilter]);

  if (loading) return <div className={styles.loading}>불러오는 중…</div>;

  return (
    <div className={styles.wrap}>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 8,
          marginBottom: 10,
        }}
      >
        <label htmlFor="statusFilter" style={{ fontSize: 14, color: "#475569" }}>
          필터:
        </label>
        <select
          id="statusFilter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            appearance: "none",
            WebkitAppearance: "none",
            MozAppearance: "none",
            padding: "8px 12px",
            borderRadius: 10,
            border: "1px solid #cbd5e1",
            background: "#fff",
            color: "#0f172a",
            fontSize: 14,
            cursor: "pointer",
          }}
          aria-label="제안 상태 필터"
          title="제안 상태 필터"
        >
          <option value="">전체 보기</option>
          <option value="pending">{statusLabel.pending}</option>
          <option value="approved">{statusLabel.approved}</option>
          <option value="completed">{statusLabel.completed}</option>
        </select>
      </div>

      <div className={styles.list}>
        {viewItems.map((item) => (
          <SuggestionCard
            key={item.id}
            item={item}
            onChangeStatus={(st) => updateStatus(item.id, st)}
            onToggleUrgent={() => toggleUrgent(item.id, !item.urgent)}
          />
        ))}
      </div>
    </div>
  );
}

function SuggestionCard({ item, onChangeStatus, onToggleUrgent }) {
  return (
    <article className={styles.card}>
      <div className={styles.left}>
        <div className={styles.header}>
          <span className={styles.cardTitle}>{item.title}</span>
          {item.urgent && <span className={styles.chipWarn}>긴급</span>}
        </div>

        <div className={styles.body}>{item.body}</div>

        <div className={styles.meta}>
          <span>{item.dept ?? "부서 미상"}</span>
          <span>{item.author ?? "작성자 미상"}</span>
          <span>{formatDate(item.created_at)}</span>
        </div>
      </div>

      <div className={styles.right}>
        <select
          className={styles.statusSelect}
          value={item.status}
          onChange={(e) => onChangeStatus(e.target.value)}
        >
          {DB_STATUS.map((st) => (
            <option key={st} value={st}>
              {statusLabel[st]}
            </option>
          ))}
        </select>

        <button
          type="button"
          className={`${styles.urgentBtn} ${item.urgent ? styles.on : ""}`}
          onClick={onToggleUrgent}
        >
          {item.urgent ? "⚠ 긴급 해제" : "⚠ 긴급 표시"}
        </button>
      </div>
    </article>
  );
}

function getFallback() {
  return [
    { id: 1, title: "제목", body: "내용", dept: "R&D",   author: "익명 직원", created_at: "2024-01-15", priority: 85, status: "pending",   urgent: true  },
    { id: 2, title: "제목", body: "내용", dept: "경영지원", author: "익명 직원", created_at: "2024-01-10", priority: 62, status: "approved",  urgent: false },
    { id: 3, title: "제목", body: "내용", dept: "안전",   author: "익명 직원", created_at: "2023-12-20", priority: 92, status: "completed", urgent: false },
  ];
}

export function adaptFromDB(row) {
  const id = row.id ?? row.suggestion_id ?? row.suggestionId;
  const body = row.body ?? row.description ?? "";
  const dept = row.dept ?? row.department_name ?? null;
  const author = row.author ?? row.name ?? null;
  const created_at = row.created_at ?? row.createdAt ?? new Date().toISOString();

  const priority =
    typeof row.priority === "number"
      ? row.priority
      : typeof row.avg_score === "number"
      ? row.avg_score
      : null;

  let status = row.status;
  if (!DB_STATUS.includes(status)) {
    const lower = String(row.status ?? "").toLowerCase();
    if (lower.includes("progress")) status = "approved";
    else if (lower.includes("complete")) status = "completed";
    else status = "pending";
  }

  const urgent =
    typeof row.urgent === "boolean" ? row.urgent : !!row.is_urgent || false;

  return {
    id,
    title: row.title ?? "(제목 없음)",
    body,
    dept,
    author,
    created_at,
    priority,
    status,
    urgent,
  };
}

function formatDate(dt) {
  try {
    const d = new Date(dt);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  } catch {
    return dt;
  }
}
