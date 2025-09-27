// Manager.jsx
import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import styles from "../../styles/manager.module.css";
import { SuggestionList, adaptFromDB } from "./Proposal";
import Notice from "./Notice";
import Member from "./Members";

const API = "http://localhost:5000";
const STORAGE_KEY = "proposal_items_cache_v1";
const NOTICE_STORAGE_KEY = "notices_v1";

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// 공지 목록에서 '긴급 + 활성'만 추출
function pickUrgentNotices(list) {
  return (Array.isArray(list) ? list : []).filter((n) => n?.urgent && n?.active);
}

export default function Manager() {
  const [active, setActive] = useState(
    localStorage.getItem("active_view") || "dashboard"
  );
  const [currentDeptId, setCurrentDeptId] = useState("all");

  const [items, setItems] = useState([]);
  const [urgentItems, setUrgentItems] = useState([]); // 제안(피드백) 긴급
  const [loading, setLoading] = useState(true);

  // 공지 집계/목록
  const [activeNoticeCount, setActiveNoticeCount] = useState(0);
  const [urgentNotices, setUrgentNotices] = useState([]); // 공지 중 '긴급'만

  // 공지 초기 로드
  useEffect(() => {
    try {
      const raw = localStorage.getItem(NOTICE_STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      setActiveNoticeCount(list.filter((n) => n.active).length);
      setUrgentNotices(pickUrgentNotices(list));
    } catch {}
  }, []);

  // 공지 변경 이벤트 수신 → 집계/긴급목록 동기화
  useEffect(() => {
    function onNoticeChanged(e) {
      const { activeCount, list } = e.detail || {};
      if (Array.isArray(list)) {
        setActiveNoticeCount(list.filter((n) => n.active).length);
        setUrgentNotices(pickUrgentNotices(list));
      } else if (typeof activeCount === "number") {
        setActiveNoticeCount(activeCount);
        try {
          const raw = localStorage.getItem(NOTICE_STORAGE_KEY);
          const cur = raw ? JSON.parse(raw) : [];
          setUrgentNotices(pickUrgentNotices(cur));
        } catch {}
      }
    }
    window.addEventListener("notice:changed", onNoticeChanged);
    return () => window.removeEventListener("notice:changed", onNoticeChanged);
  }, []);

  // 부서 변경 수신
  useEffect(() => {
    const handler = (e) => {
      const next = e?.detail?.id ?? "all";
      setCurrentDeptId(next);
    };
    window.addEventListener("dept:changed", handler);
    return () => window.removeEventListener("dept:changed", handler);
  }, []);

  // 제안(피드백) 목록 로드
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
            {
              id: 1,
              title: "제목",
              body: "내용",
              dept: "R&D",
              author: "익명 직원",
              created_at: "2024-01-15",
              priority: 85,
              status: "pending",
              urgent: true,
            },
            {
              id: 2,
              title: "제목",
              body: "내용",
              dept: "경영지원",
              author: "익명 직원",
              created_at: "2024-01-10",
              priority: 62,
              status: "approved",
              urgent: false,
            },
            {
              id: 3,
              title: "제목",
              body: "내용",
              dept: "안전",
              author: "익명 직원",
              created_at: "2023-12-20",
              priority: 92,
              status: "completed",
              urgent: false,
            },
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

  // 제안 긴급 토글 이벤트 수신
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
        return urgent ? [...others, item ?? { id, urgent: true }] : others;
      });
    }
    window.addEventListener("suggestion:urgent", onUrgentChanged);
    return () =>
      window.removeEventListener("suggestion:urgent", onUrgentChanged);
  }, []);

  // 헤더 알림 발행용 헬퍼
  const pushHeaderNotif = (label, title) => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    window.dispatchEvent(
      new CustomEvent("header:notif:add", {
        detail: { title: label, meta: `${title || "제목 없음"} · ${hh}:${mm}` },
      })
    );
  };

  // 공지 '긴급 해제'
  const unmarkNoticeUrgent = (notice) => {
    try {
      const raw = localStorage.getItem(NOTICE_STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      const next = list.map((n) =>
        n.id === notice.id ? { ...n, urgent: false } : n
      );
      localStorage.setItem(NOTICE_STORAGE_KEY, JSON.stringify(next));

      // 상태 즉시 반영
      setUrgentNotices(pickUrgentNotices(next));
      setActiveNoticeCount(next.filter((n) => n.active).length);

      // 다른 컴포넌트 동기화
      window.dispatchEvent(
        new CustomEvent("notice:changed", { detail: { list: next } })
      );

      // 헤더 알림 (선택)
      pushHeaderNotif("공지 긴급 해제", notice.title);
    } catch {}
  };

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

  const stats = useMemo(() => {
    const totalEmployees = 5;
    const totalSuggestions = items.length;
    const urgentCount = urgentItems.length;
    const activeNotices = activeNoticeCount;

    return [
      { label: "총 직원 수", value: totalEmployees },
      { label: "총 제안 수", value: totalSuggestions },
      { label: "활성 공지", value: activeNotices },
      { label: "긴급 제안", value: urgentCount },
    ];
  }, [items, urgentItems, activeNoticeCount]);

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
  const valueStyle = {
    fontSize: "28px",
    fontWeight: 700,
    color: "#1e3a8a",
    marginBottom: "8px",
    lineHeight: 1.1,
  };
  const labelStyle = { fontSize: "14px", color: "#4b5563" };

  const handleClick = (view) => {
    localStorage.setItem("active_view", view);
    setActive(view);
    setTimeout(() => window.location.reload(), 0);
  };

  // 공지 날짜/부서 안전 추출
  const noticeMeta = (n) => {
    const dept = n?.dept || n?.deptLabel || "공지";
    const dt =
      (n?.updated_at || n?.created_at || n?.date || "").toString().slice(0, 10);
    return `${dept} · ${dt}`;
  };

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
              onClick={() => handleClick("dashboard")}
            >
              관리자 대시보드
            </button>
            <button
              type="button"
              className={`${styles.button} ${active === "employee" ? styles.active : ""}`}
              onClick={() => handleClick("employee")}
            >
              직원 관리
            </button>
            <button
              type="button"
              className={`${styles.button} ${active === "suggestion" ? styles.active : ""}`}
              onClick={() => handleClick("suggestion")}
            >
              제안 관리
            </button>
            <button
              type="button"
              className={`${styles.button} ${active === "notice" ? styles.active : ""}`}
              onClick={() => handleClick("notice")}
            >
              공지 관리
            </button>
          </div>

          {active === "dashboard" && (
            <>
              {/* 상단 통계 */}
              <div style={gridStyle}>
                {stats.map((s, i) => (
                  <div key={i} style={cardStyle}>
                    <div style={valueStyle}>{s.value}</div>
                    <div style={labelStyle}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* 긴급 제안 */}
              <div className={styles.urgentPanel}>
                <div className={styles.urgentPanelHeader}>⚠ 긴급 제안</div>

                {loading ? (
                  <div className={styles.urgentCards}>
                    <div className={`${styles.urgentCard} ${styles.empty}`}>
                      현재 긴급 제안이 없습니다.
                    </div>
                  </div>
                ) : (
                  <div className={styles.urgentCards}>
                    {urgentItems
                      .slice()
                      .sort((a, b) =>
                        String(b.title || "").localeCompare(
                          String(a.title || ""),
                          "ko",
                          { sensitivity: "base", numeric: true }
                        )
                      )
                      .map((u) => (
                        <div key={u.id} className={styles.urgentCard}>
                          <div className={styles.urgentCardText}>
                            <div className={styles.rowTitle}>{u.title || "제목"}</div>
                            <div className={styles.rowMeta}>
                              {u.dept ?? "부서 미상"} · {String(u.created_at).slice(0, 10)}
                            </div>
                          </div>
                          <button
                            type="button"
                            className={styles.urgentRowBtn}
                            onClick={() => unmarkUrgent(u)}
                          >
                            긴급 해제
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* 긴급 공지 */}
              <div className={styles.urgentPanel}>
                <div className={styles.urgentPanelHeader}>⚠ 긴급 공지</div>

                {urgentNotices.length === 0 ? (
                  <div className={styles.urgentCards}>
                    <div className={styles.urgentEmptyText}>
                      현재 긴급 공지가 없습니다.
                    </div>
                  </div>
                ) : (
                  <div className={styles.urgentCards}>
                    {urgentNotices
                      .slice()
                      .sort((a, b) =>
                        String(b.title || "").localeCompare(
                          String(a.title || ""),
                          "ko",
                          { sensitivity: "base", numeric: true }
                        )
                      )
                      .map((n) => (
                        <div key={n.id} className={styles.urgentCard}>
                          <div className={styles.urgentCardText}>
                            <div className={styles.rowTitle}>{n.title || "제목"}</div>
                            <div className={styles.rowMeta}>{noticeMeta(n)}</div>
                          </div>
                          <button
                            type="button"
                            className={styles.urgentRowBtn}
                            onClick={() => unmarkNoticeUrgent(n)}
                          >
                            긴급 해제
                          </button>
                        </div>
                      ))}
                  </div>
                )}
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
