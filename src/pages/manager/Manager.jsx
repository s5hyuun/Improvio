import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import styles from "../../styles/manager.module.css";
import { SuggestionList, adaptFromDB } from "./Proposal";
import Notice from "./Notice";
import Member from "./Members";

const API = "http://localhost:3000";
const STORAGE_KEY = "proposal_items_cache_v1";
const NOTICE_STORAGE_KEY = "notices_v1";

const MEMBERS_STORAGE_KEY = "members_v1";

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getEmployeeCountFromStorage() {
  try {
    const raw = localStorage.getItem(MEMBERS_STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.length : 0;
  } catch {
    return 0;
  }
}

export default function Manager() {
  const [active, setActive] = useState("dashboard");
  const [currentDeptId, setCurrentDeptId] = useState("all");

  const [employeeCount, setEmployeeCount] = useState(0);

  const [items, setItems] = useState([]);
  const [urgentItems, setUrgentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeNoticeCount, setActiveNoticeCount] = useState(0);
  const [urgentNotices, setUrgentNotices] = useState([]);

  useEffect(() => {
    setEmployeeCount(getEmployeeCountFromStorage());
  }, []);

  useEffect(() => {
    const onMembersChanged = (e) => {
      const { list, count } = e.detail || {};
      if (typeof count === "number") {
        setEmployeeCount(count);
      } else if (Array.isArray(list)) {
        setEmployeeCount(list.length);
      } else {
        setEmployeeCount(getEmployeeCountFromStorage());
      }
    };

    window.addEventListener("members:changed", onMembersChanged);
    window.addEventListener("member:changed", onMembersChanged);
    window.addEventListener("employees:changed", onMembersChanged);

    const onStorage = (ev) => {
      if (ev.key === MEMBERS_STORAGE_KEY) {
        setEmployeeCount(getEmployeeCountFromStorage());
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("members:changed", onMembersChanged);
      window.removeEventListener("member:changed", onMembersChanged);
      window.removeEventListener("employees:changed", onMembersChanged);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(NOTICE_STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      setActiveNoticeCount(list.filter((n) => n.active).length);
      setUrgentNotices(list.filter((n) => n.active && n.urgent));
    } catch {}
  }, []);

  useEffect(() => {
    function onNoticeChanged(e) {
      const { activeCount, list } = e.detail || {};
      if (Array.isArray(list)) {
        setActiveNoticeCount(list.filter((n) => n.active).length);
        setUrgentNotices(list.filter((n) => n.active && n.urgent));
      } else if (typeof activeCount === "number") {
        setActiveNoticeCount(activeCount);
        try {
          const raw = localStorage.getItem(NOTICE_STORAGE_KEY);
          const l = raw ? JSON.parse(raw) : [];
          setUrgentNotices(l.filter((n) => n.active && n.urgent));
        } catch {}
      }
    }
    window.addEventListener("notice:changed", onNoticeChanged);
    return () => window.removeEventListener("notice:changed", onNoticeChanged);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const next = e?.detail?.id ?? "all";
      setCurrentDeptId(next);
    };
    window.addEventListener("dept:changed", handler);
    return () => window.removeEventListener("dept:changed", handler);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/suggestions`);
        const data = await res.json();
        const list = Array.isArray(data) ? data.map(adaptFromDB) : [];
        if (!mounted) return;
        setItems(list);
        setUrgentItems(list.filter((x) => x.urgent));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      } catch {
        if (!mounted) return;
        const cached = loadFromStorage();
        if (cached && cached.length) {
          setItems(cached);
          setUrgentItems(cached.filter((x) => x.urgent));
        } else {
          const fallback = [
            { id: 1, title: "제목", body: "내용", dept: "R&D", author: "익명 직원", created_at: "2024-01-15", priority: 85, status: "pending", urgent: true },
            { id: 2, title: "제목", body: "내용", dept: "경영지원", author: "익명 직원", created_at: "2024-01-10", priority: 62, status: "approved", urgent: false },
            { id: 3, title: "제목", body: "내용", dept: "안전",   author: "익명 직원", created_at: "2023-12-20", priority: 92, status: "completed", urgent: false },
          ];
          setItems(fallback);
          setUrgentItems(fallback.filter((x) => x.urgent));
          localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
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
    function onUrgentChanged(e) {
      const { id, urgent, item } = e.detail || {};
      if (!id) return;

      setItems((prev) => {
        const next = prev.map((x) => (x.id === id ? { ...x, urgent } : x));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });

      setUrgentItems((prev) => {
        const others = prev.filter((x) => x.id !== id);
        return urgent ? [...others, (item ?? { id, urgent: true })] : others;
      });
    }
    window.addEventListener("suggestion:urgent", onUrgentChanged);
    return () => window.removeEventListener("suggestion:urgent", onUrgentChanged);
  }, []);

  const unmarkUrgent = async (u) => {
    const id = u.id;

    setItems((prev) => {
      const next = prev.map((x) => (x.id === id ? { ...x, urgent: false } : x));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    setUrgentItems((prev) => prev.filter((x) => x.id !== id));

    window.dispatchEvent(
      new CustomEvent("suggestion:urgent", {
        detail: { id, urgent: false, item: { ...u, urgent: false } },
      })
    );

    try {
      await fetch(`${API}/api/suggestions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_urgent: false }),
      });
    } catch {}
  };

  const unmarkNoticeUrgent = (n) => {
    try {
      const raw = localStorage.getItem(NOTICE_STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      const next = list.map((x) => (x.id === n.id ? { ...x, urgent: false } : x));
      localStorage.setItem(NOTICE_STORAGE_KEY, JSON.stringify(next));
      setUrgentNotices((prev) => prev.filter((x) => x.id !== n.id));
      setActiveNoticeCount(next.filter((x) => x.active).length);
      window.dispatchEvent(
        new CustomEvent("notice:changed", {
          detail: { list: next, activeCount: next.filter((x) => x.active).length },
        })
      );
    } catch {}
  };

  const stats = useMemo(() => {
    const totalEmployees = employeeCount;
    const totalSuggestions = items.length;
    const urgentCount = urgentItems.length;
    const activeNotices = activeNoticeCount;

    return [
      { label: "총 직원 수", value: totalEmployees },
      { label: "총 제안 수", value: totalSuggestions },
      { label: "활성 공지", value: activeNotices },
      { label: "긴급 제안", value: urgentCount },
    ];
  }, [employeeCount, items, urgentItems, activeNoticeCount]);

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(160px, 1fr))",
    gap: "16px",
    marginTop: "20px",
  };
  const cardStyle = {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "20px",
    textAlign: "center",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
  };
  const valueStyle = { fontSize: "28px", fontWeight: 700, color: "#1e3a8a", marginBottom: "8px", lineHeight: 1.1 };
  const labelStyle = { fontSize: "14px", color: "#4b5563" };

  return (
    <div className="app">
      <Sidebar
        selected={currentDeptId}
        onSelectDept={(id) => setCurrentDeptId(id || "all")}
      />

      <main className="main">
        <Header />
        <section className="content">
          <div className={styles.btn}>
            <button
              type="button"
              className={`${styles.button} ${active === "dashboard" ? styles.active : ""}`}
              onClick={() => setActive("dashboard")}
              aria-pressed={active === "dashboard"}
            >
              관리자 대시보드
            </button>
            <button
              type="button"
              className={`${styles.button} ${active === "employee" ? styles.active : ""}`}
              onClick={() => setActive("employee")}
              aria-pressed={active === "employee"}
            >
              직원 관리
            </button>
            <button
              type="button"
              className={`${styles.button} ${active === "suggestion" ? styles.active : ""}`}
              onClick={() => setActive("suggestion")}
              aria-pressed={active === "suggestion"}
            >
              제안 관리
            </button>
            <button
              type="button"
              className={`${styles.button} ${active === "notice" ? styles.active : ""}`}
              onClick={() => setActive("notice")}
              aria-pressed={active === "notice"}
            >
              공지 관리
            </button>
          </div>

          {active === "dashboard" && (
            <>
              <div style={gridStyle} aria-label="대시보드 통계">
                {stats.map((s, i) => (
                  <div key={i} style={cardStyle} role="status" aria-live="polite">
                    <div style={valueStyle}>{s.value}</div>
                    <div style={labelStyle}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div className={styles.urgentPanel} role="region" aria-label="긴급 제안">
                <div className={styles.urgentPanelHeader}>⚠ 긴급 제안</div>

                {loading ? (
                  <div className={styles.urgentCards}>
                    <div className={styles.emptyText}>현재 긴급 제안이 없습니다.</div>
                  </div>
                ) : (
                  <div
                    className={`${styles.urgentCards} ${
                      urgentItems.length > 2 ? styles.urgentCardsScroll : ""
                    }`}
                  >
                    {urgentItems
                      .slice()
                      .sort((a, b) =>
                        String(a.title || "").localeCompare(
                          String(b.title || ""),
                          "ko",
                          { sensitivity: "base", numeric: true }
                        )
                      )
                      .map((u) => (
                        <div key={u.id} className={styles.urgentCard}>
                          <div className={styles.urgentCardText}>
                            <div className={styles.rowTitle}>{u.title || "제목"}</div>
                            <div className={styles.rowMeta}>
                              {(u.dept ?? "부서 미상")} · {String(u.created_at).slice(0, 10)}
                            </div>
                          </div>
                          <button type="button" className={styles.urgentRowBtn} onClick={() => unmarkUrgent(u)}>
                            긴급 해제
                          </button>
                        </div>
                      ))}
                    {urgentItems.length === 0 && (
                      <div className={styles.emptyText}>표시할 긴급 제안이 없습니다.</div>
                    )}
                  </div>
                )}
              </div>

              <div className={styles.urgentPanel} role="region" aria-label="긴급 공지" style={{ marginTop: 16 }}>
                <div className={styles.urgentPanelHeader}>⚠ 긴급 공지</div>

                <div
                  className={`${styles.urgentCards} ${
                    urgentNotices.length > 2 ? styles.urgentCardsScroll : ""
                  }`}
                >
                  {urgentNotices
                    .slice()
                    .sort((a, b) =>
                      String(a.title || "").localeCompare(
                        String(b.title || ""),
                        "ko",
                        { sensitivity: "base", numeric: true }
                      )
                    )
                    .map((n) => (
                      <div key={n.id} className={styles.urgentCard}>
                        <div className={styles.urgentCardText}>
                          <div className={styles.rowTitle}>{n.title || "제목"}</div>
                          <div className={styles.rowMeta}>
                            {(n.dept ?? "관리팀")} · {String(n.created_at).slice(0, 10)}
                          </div>
                        </div>
                        <button
                          type="button"
                          className={styles.urgentRowBtn}
                          onClick={() => unmarkNoticeUrgent(n)}
                          title="공지의 긴급 표시 해제"
                        >
                          긴급 해제
                        </button>
                      </div>
                    ))}
                  {urgentNotices.length === 0 && (
                    <div className={styles.emptyText}>표시할 긴급 공지가 없습니다.</div>
                  )}
                </div>
              </div>
            </>
          )}

          {active === "suggestion" && <SuggestionList />}

          {active === "employee" && <Member selectedDeptId={currentDeptId} />}

          {active === "notice" && <Notice />}
        </section>
      </main>
    </div>
  );
}
