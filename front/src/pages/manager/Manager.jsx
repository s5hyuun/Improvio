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

// ----- 유틸 -----
const isTrue = (v) => v === true || v === "true" || v === 1 || v === "1";
const getNoticeId = (n) =>
  n?.id ?? n?.notice_id ?? n?._id ?? n?.noticeId ?? n?.uuid ?? n?.key;
const sameId = (a, b) => String(a) === String(b);
const isActiveUrgent = (n) => !!n && isTrue(n.active) && isTrue(n.urgent);

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function Manager() {
  const [active, setActive] = useState("dashboard");
  const [currentDeptId, setCurrentDeptId] = useState("all");

  const [items, setItems] = useState([]);
  const [urgentItems, setUrgentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // 공지
  const [activeNoticeCount, setActiveNoticeCount] = useState(0);
  const [urgentNotices, setUrgentNotices] = useState([]); // active && urgent
  const [totalEmployees, setTotalEmployees] = useState(0);
  // 초기 공지 로드
  useEffect(() => {
    try {
      const raw = localStorage.getItem(NOTICE_STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      setActiveNoticeCount(list.filter((n) => isTrue(n.active)).length);
      setUrgentNotices(list.filter(isActiveUrgent));
    } catch {}
  }, []);

  // 공지 변경 이벤트 수신
  useEffect(() => {
    function onNoticeChanged(e) {
      const { activeCount, list } = e.detail || {};
      if (Array.isArray(list)) {
        setActiveNoticeCount(list.filter((n) => isTrue(n.active)).length);
        setUrgentNotices(list.filter(isActiveUrgent));
      } else if (typeof activeCount === "number") {
        try {
          const raw = localStorage.getItem(NOTICE_STORAGE_KEY);
          const all = raw ? JSON.parse(raw) : [];
          setActiveNoticeCount(activeCount);
          setUrgentNotices(all.filter(isActiveUrgent));
        } catch {
          setActiveNoticeCount(activeCount);
        }
      }
    }
    function onNoticeUrgent(e) {
      const { id, urgent } = e.detail || {};
      if (id == null) return;
      if (isTrue(urgent) === false) {
        setUrgentNotices((prev) =>
          prev.filter((x) => !sameId(getNoticeId(x), id))
        );
      }
    }
    window.addEventListener("notice:changed", onNoticeChanged);
    window.addEventListener("notice:urgent", onNoticeUrgent);
    return () => {
      window.removeEventListener("notice:changed", onNoticeChanged);
      window.removeEventListener("notice:urgent", onNoticeUrgent);
    };
  }, []);

  // 부서 변경 이벤트
  useEffect(() => {
    const handler = (e) => {
      const next = e?.detail?.id ?? "all";
      setCurrentDeptId(next);
    };
    window.addEventListener("dept:changed", handler);
    return () => window.removeEventListener("dept:changed", handler);
  }, []);

  // 제안 로드
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/suggestions`);
        const data = await res.json();
        const list = Array.isArray(data.suggestions)
          ? data.suggestions.map(adaptFromDB)
          : [];
        if (!mounted) return;
        setItems(list);
        setUrgentItems(list.filter((x) => x.urgent));
        setTotalEmployees(data.totalEmployees ?? 0);
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

  // 제안 긴급 브로드캐스트 수신
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

  // 제안 긴급 해제
  const unmarkUrgent = async (u) => {
    const id = u.id;
    setUrgentItems((prev) => prev.filter((x) => x.id !== id));
    setItems((prev) => {
      const next = prev.map((x) => (x.id === id ? { ...x, urgent: false } : x));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
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

  // 공지 '긴급 해제' = urgent:false (active 유지), 패널에서 즉시 제거
  const unmarkNotice = async (n) => {
    const id = getNoticeId(n);
    if (id == null) return;

    // 1) 즉시 제거
    setUrgentNotices((prev) => prev.filter((x) => !sameId(getNoticeId(x), id)));

    try {
      // 2) 로컬스토리지 업데이트(다양한 스키마 대응)
      const raw = localStorage.getItem(NOTICE_STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      const next = list.map((x) =>
        sameId(getNoticeId(x), id)
          ? { ...x, urgent: false, is_urgent: false, urgentFlag: false }
          : x
      );
      localStorage.setItem(NOTICE_STORAGE_KEY, JSON.stringify(next));

      // 3) 파생 상태 재계산
      setUrgentNotices(next.filter(isActiveUrgent));
      setActiveNoticeCount(next.filter((x) => isTrue(x.active)).length);

      // 4) 브로드캐스트(다른 화면/탭 동기화)
      window.dispatchEvent(
        new CustomEvent("notice:changed", {
          detail: {
            activeCount: next.filter((x) => isTrue(x.active)).length,
            list: next,
          },
        })
      );
      window.dispatchEvent(
        new CustomEvent("notice:urgent", { detail: { id, urgent: false } })
      );
    } catch {}

    // 5) 서버 동기화
    try {
      await fetch(`${API}/api/notices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          urgent: false,
          is_urgent: false,
          urgentFlag: false,
        }),
      });
    } catch {}
  };

  // 통계 카드
  const stats = useMemo(() => {
    const totalSuggestions = items.length;
    const urgentCount = urgentItems.length;
    const activeNotices = activeNoticeCount;
    return [
      { label: "총 직원 수", value: totalEmployees },
      { label: "총 제안 수", value: totalSuggestions },
      { label: "활성 공지", value: activeNotices },
      { label: "긴급 제안", value: urgentCount },
    ];
  }, [items, urgentItems, activeNoticeCount, totalEmployees]);

  // 카드/레이아웃 인라인 백업 스타일
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

  const sortByTitle = (a, b) =>
    String(a.title || "").localeCompare(String(b.title || ""), "ko", {
      sensitivity: "base",
      numeric: true,
    });

  const urgentSplitFallback = {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", // 자식이 넘치지 않도록
    gap: "16px",
    marginTop: 24,
    alignItems: "stretch",
    height: "100%", // 부모(content)의 남는 높이를 그대로 받음
    minHeight: 0,
  };
  const columnFallback = {
    background: "#fff",
    borderRadius: 16,
    border: "1px solid #e5e7eb",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    minHeight: 0, // 🔑 자식 스크롤 허용
    height: "100%", // 🔑 urgentSplit의 높이를 꽉 채움
  };

  const headerRowFallback = {
    padding: "16px 20px",
    fontWeight: 700,
    borderBottom: "1px solid #f1f5f9",
    flex: "0 0 auto", // 헤더는 고정
  };

  const scrollAreaFallback = {
    overflowY: "auto",
    padding: 16,
    flex: "1 1 auto", // 🔑 남는 공간을 스크롤 영역이 차지
    minHeight: 0, // 🔑 flex 스크롤 이슈 방지
  };

  return (
    <div className="app">
      <Sidebar
        selected={currentDeptId}
        onSelectDept={(id) => setCurrentDeptId(id || "all")}
      />

      <main
        className="main"
        style={{ display: "flex", flexDirection: "column", height: "100vh" }}
      >
        <Header />
        <section
          className="content"
          style={{ flex: 1, minHeight: 0, overflow: "hidden" }}
        >
          <div className={styles.btn}>
            <button
              type="button"
              className={`${styles.button} ${
                active === "dashboard" ? styles.active : ""
              }`}
              onClick={() => setActive("dashboard")}
              aria-pressed={active === "dashboard"}
            >
              관리자 대시보드
            </button>
            <button
              type="button"
              className={`${styles.button} ${
                active === "employee" ? styles.active : ""
              }`}
              onClick={() => setActive("employee")}
              aria-pressed={active === "employee"}
            >
              직원 관리
            </button>
            <button
              type="button"
              className={`${styles.button} ${
                active === "suggestion" ? styles.active : ""
              }`}
              onClick={() => setActive("suggestion")}
              aria-pressed={active === "suggestion"}
            >
              제안 관리
            </button>
            <button
              type="button"
              className={`${styles.button} ${
                active === "notice" ? styles.active : ""
              }`}
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
                  <div
                    key={i}
                    style={cardStyle}
                    role="status"
                    aria-live="polite"
                  >
                    <div style={valueStyle}>{s.value}</div>
                    <div style={labelStyle}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* 긴급 공지 / 긴급 제안 1:1 가로 배치 */}
              <div
                className={styles.urgentSplit || ""}
                style={styles.urgentSplit ? undefined : urgentSplitFallback}
              >
                {/* 긴급 공지 */}
                <section
                  className={styles.urgentColumn || ""}
                  role="region"
                  aria-label="긴급 공지"
                  style={styles.urgentColumn ? undefined : columnFallback}
                >
                  <div
                    className={styles.urgentColumnHeader || ""}
                    style={
                      styles.urgentColumnHeader ? undefined : headerRowFallback
                    }
                  >
                    🚨 긴급 공지
                  </div>

                  <div
                    className={styles.urgentScroll || ""}
                    style={styles.urgentScroll ? undefined : scrollAreaFallback}
                  >
                    <div style={{ display: "grid", gap: 16 }}>
                      {urgentNotices.length === 0 ? (
                        <div
                          className={styles.urgentCard}
                          style={{ color: "#c2410c" }}
                        >
                          현재 긴급 공지가 없습니다.
                        </div>
                      ) : (
                        urgentNotices
                          .slice()
                          .sort(sortByTitle)
                          .map((n) => {
                            const nid = getNoticeId(n);
                            return (
                              <div key={nid} className={styles.urgentCard}>
                                <div className={styles.urgentCardText}>
                                  <div className={styles.rowTitle}>
                                    {n.title || "제목"}
                                  </div>
                                  <div className={styles.rowMeta}>
                                    {(n.dept ?? "부서 미상") + " · "}
                                    {String(
                                      n.created_at || n.createdAt || ""
                                    ).slice(0, 10)}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className={styles.urgentRowBtn}
                                  onClick={() => unmarkNotice(n)}
                                >
                                  긴급 해제
                                </button>
                              </div>
                            );
                          })
                      )}
                    </div>
                  </div>
                </section>

                {/* 긴급 제안 */}
                <section
                  className={styles.urgentColumn || ""}
                  role="region"
                  aria-label="긴급 제안"
                  style={styles.urgentColumn ? undefined : columnFallback}
                >
                  <div
                    className={styles.urgentColumnHeader || ""}
                    style={
                      styles.urgentColumnHeader ? undefined : headerRowFallback
                    }
                  >
                    🚨 긴급 제안
                  </div>

                  <div
                    className={styles.urgentScroll || ""}
                    style={styles.urgentScroll ? undefined : scrollAreaFallback}
                  >
                    {loading || urgentItems.length === 0 ? (
                      <div
                        className={styles.urgentCard}
                        style={{ color: "#c2410c" }}
                      >
                        현재 긴급 제안이 없습니다.
                      </div>
                    ) : (
                      urgentItems
                        .slice()
                        .sort(sortByTitle)
                        .map((u) => (
                          <div key={u.id} className={styles.urgentCard}>
                            <div className={styles.urgentCardText}>
                              <div className={styles.rowTitle}>
                                {u.title || "제목"}
                              </div>
                              <div className={styles.rowMeta}>
                                {u.dept ?? "부서 미상"} ·{" "}
                                {String(u.created_at).slice(0, 10)}
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
                        ))
                    )}
                  </div>
                </section>
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
