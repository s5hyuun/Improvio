// Proposal.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import styles from "../../styles/Proposal.module.css";

const API = import.meta.env.VITE_API_BASE ?? "http://localhost:5174";

/** DB 상태값 그대로 사용 */
const DB_STATUS = ["pending", "approved", "completed"];
/** 화면 표기 라벨 */
const statusLabel = {
  pending: "Proposal",
  approved: "In Progress",
  completed: "Complete",
};

export default function Manager() {
  const [langOpen, setLangOpen] = useState(false);
  const [dept, setDept] = useState("R&D");
  const [lang, setLang] = useState("한국어");

  const [active, setActive] = useState("dashboard");

  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        <Header />

        <section className="content">
          <div className={styles.placeholder}>관리자 페이지</div>

          <div className={styles.btn}>
            <button
              type="button"
              className={`${styles.button} ${active === "dashboard" ? styles.active : ""}`}
              onClick={() => setActive("dashboard")}
              aria-pressed={active === "dashboard"}
            >
              <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              관리자 대시보드
            </button>

            <button
              type="button"
              className={`${styles.button} ${active === "employee" ? styles.active : ""}`}
              onClick={() => setActive("employee")}
              aria-pressed={active === "employee"}
            >
              <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
              직원 관리
            </button>

            <button
              type="button"
              className={`${styles.button} ${active === "suggestion" ? styles.active : ""}`}
              onClick={() => setActive("suggestion")}
              aria-pressed={active === "suggestion"}
            >
              <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293L16.707 6.707a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              제안 관리
            </button>

            <button
              type="button"
              className={`${styles.button} ${active === "notice" ? styles.active : ""}`}
              onClick={() => setActive("notice")}
              aria-pressed={active === "notice"}
            >
              <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              공지 관리
            </button>
          </div>

          {/* 탭 콘텐츠 */}
          {active === "suggestion" && <SuggestionList />}
          {active === "dashboard" && <div style={{ marginTop: 16 }}>대시보드 준비중 ,,</div>}
          {active === "employee" && <div style={{ marginTop: 16 }}>직원 관리 준비중 ,,</div>}
          {active === "notice" && <div style={{ marginTop: 16 }}>공지 관리 준비중 ,,</div>}
        </section>
      </main>
    </div>
  );
}

/** DB 원본 레코드 → UI 레코드로 안전 변환 */
function adaptFromDB(row) {
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

  const urgent = typeof row.urgent === "boolean" ? row.urgent : !!row.is_urgent || false;

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

function SuggestionList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/api/requirements`);
        const data = await res.json();
        const next = Array.isArray(data) ? data.map(adaptFromDB) : [];
        setItems(next.length ? next : []);
      } catch (e) {
        console.error(e);
        // API 미연결 시 목데이터 (DB 상태값 사용)
        setItems([
          { id: 1, title: "제목", body: "내용", dept: "R&D", author: "익명 직원", created_at: "2024-01-15", priority: 85, status: "pending", urgent: true },
          { id: 2, title: "제목", body: "내용", dept: "경영지원", author: "익명 직원", created_at: "2024-01-10", priority: 62, status: "approved", urgent: false },
          { id: 3, title: "제목", body: "내용", dept: "안전", author: "익명 직원", created_at: "2023-12-20", priority: 92, status: "completed", urgent: false },
        ]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 상태 변경(낙관적)
  const updateStatus = async (id, next) => {
    setItems(prev => prev.map(x => (x.id === id ? { ...x, status: next } : x)));
    try {
      await fetch(`${API}/api/requirements/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }), // 'pending' | 'approved' | 'completed'
      });
    } catch (e) {
      console.error("[status update failed]", e);
    }
  };

  // 긴급 토글(낙관적)
  const toggleUrgent = async (id, next) => {
    setItems(prev => prev.map(x => (x.id === id ? { ...x, urgent: next } : x)));
    try {
      await fetch(`${API}/api/requirements/${id}/urgent`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urgent: next }),
      });
    } catch (e) {
      console.warn("[urgent toggle failed] 백엔드 urgent 컬럼/엔드포인트 확인 필요", e);
    }
  };

  if (loading) return <div className={styles.loading}>불러오는 중…</div>;

  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>제안 관리</h2>

      <div className={styles.list}>
        {items.map(item => (
          <SuggestionCard
            key={item.id}
            item={item}
            onChangeStatus={st => updateStatus(item.id, st)}
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
          <span>우선순위: {item.priority ?? "-"}</span>
        </div>
      </div>

      <div className={styles.right}>
        <select
          className={styles.statusSelect}
          value={item.status} // DB 상태값
          onChange={e => onChangeStatus(e.target.value)}
        >
          {DB_STATUS.map(st => (
            <option key={st} value={st}>
              {statusLabel[st]} {/* 화면 표기 */}
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