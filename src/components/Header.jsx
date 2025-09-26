import { useEffect, useMemo, useRef, useState } from "react";

const NOTIFS_STORAGE_KEY = "header_notifs_v1";
const STORAGE_DEPT_KEY = "selected_dept";
const AUTH_KEY = "auth_user";

// Sidebar와 동일한 부서/아이콘 매핑
const DEPARTMENTS = [
  { id: "rd",           label: "R&D",         icon: "bulb" },
  { id: "globalSales",  label: "해외영업",      icon: "globe" },
  { id: "basicDesign",  label: "기본설계",      icon: "doc" },
  { id: "futureBiz",    label: "미래사업개발",   icon: "flag" },
  { id: "shipDesign",   label: "조선설계",      icon: "triangle" },
  { id: "marineDesign", label: "해양설계",      icon: "sea" },
  { id: "pm",           label: "PM",          icon: "user" },
  { id: "purchase",     label: "구매",         icon: "list" },
  { id: "ops",          label: "경영지원",      icon: "monitor" },
  { id: "safety",       label: "안전",         icon: "shield" },
];
function deptById(id) {
  return DEPARTMENTS.find((d) => d.id === id) || null;
}
function loadUser() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    role: localStorage.getItem("user_role") || "admin",
    username: localStorage.getItem("username") || "username",
    deptId: localStorage.getItem("user_dept") || null,
  };
}

export default function Header() {
  const user = useMemo(loadUser, []);
  const isEmployee = String(user.role).toLowerCase() === "employee";

  // --- 알림 상태 (기존) ---
  const [notifs, setNotifs] = useState(() => {
    try {
      const raw = localStorage.getItem(NOTIFS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(NOTIFS_STORAGE_KEY, JSON.stringify(notifs));
    } catch {}
  }, [notifs]);
  useEffect(() => {
    const onAdd = (e) => {
      const { id, title, meta } = e.detail || {};
      if (!title) return;
      setNotifs((prev) => [
        { id: id ?? Date.now(), title, meta: meta ?? "", read: false },
        ...prev,
      ]);
    };
    window.addEventListener("header:notif:add", onAdd);
    return () => window.removeEventListener("header:notif:add", onAdd);
  }, []);
  const unread = notifs.filter((n) => !n.read).length;
  const [notifOpen, setNotifOpen] = useState(false);

  // --- 언어 (기존) ---
  const [langOpen, setLangOpen] = useState(false);
  const [lang, setLang] = useState("한국어");

  const langMenuRef = useRef(null);
  const notifMenuRef = useRef(null);
  useEffect(() => {
    function handleClick(e) {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) {
        setLangOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    function handleEsc(e) {
      if (e.key === "Escape") {
        setLangOpen(false);
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const hasBadge = unread > 0;
  const bellColor = hasBadge ? "#EA580C" : undefined;
  const bellBtnStyle = hasBadge ? { borderColor: "#EA580C" } : undefined;

  const markAsRead = (id) =>
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const markAllRead = () =>
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  const removeNotif = (id) =>
    setNotifs((prev) => prev.filter((n) => n.id !== id));
  const clearAll = () => setNotifs([]);

  // --- 부서 칩: 직원에게만 표시 ---
  const [deptId, setDeptId] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_DEPT_KEY);
      if (saved && deptById(saved)) return saved;
      if (isEmployee && user.deptId && deptById(user.deptId)) return user.deptId;
      return null;
    } catch {
      return isEmployee ? user.deptId || null : null;
    }
  });
  // Sidebar에서 발생시키는 dept:changed 이벤트를 수신
  useEffect(() => {
    function onDeptChanged(e) {
      const id = e?.detail?.id;
      if (!id || id === "all") {
        setDeptId(null);
      } else if (deptById(id)) {
        setDeptId(id);
      }
    }
    window.addEventListener("dept:changed", onDeptChanged);
    return () => window.removeEventListener("dept:changed", onDeptChanged);
  }, []);

  const dept = deptById(deptId || (isEmployee ? user.deptId : null));

  const [hoverAct, setHoverAct] = useState(null);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <span className="ico shield">
          <svg viewBox="0 0 24 24">
            <path d="M12 3l7 3v6c0 5-3.5 9-7 9s-7-4-7-9V6l7-3z" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </span>
        <strong className="topbar-title">관리자 페이지</strong>
      </div>

      <div className="topbar-actions">
        <div className="search">
          <span className="ico search-ico">
            <svg viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M21 21l-4.3-4.3" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          </span>
          <input type="text" placeholder="검색" />
        </div>

        {/* 직원일 때만: 선택된 부서 아이콘+텍스트 칩 (#2563EB) */}
        {isEmployee && dept && (
          <div
            aria-label="현재 부서"
            title={dept.label}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              borderRadius: 12,
              border: "1px solid #2563EB",
              color: "#2563EB",
              background: "rgba(37,99,235,0.06)",
              fontWeight: 800,
              whiteSpace: "nowrap",
            }}
          >
            <span className="ico" style={{ color: "#2563EB" }}>
              {icon(dept.icon)}
            </span>
            <span>{dept.label}</span>
          </div>
        )}

        <div className="dropdown" ref={notifMenuRef}>
          <button
            className="icon-btn"
            aria-label="알림"
            data-dot={hasBadge ? "" : undefined}
            style={bellBtnStyle}
            onClick={() => setNotifOpen((v) => !v)}
          >
            <svg viewBox="0 0 24 24" style={{ color: bellColor }}>
              <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>

          {notifOpen && (
            <ul className="menu" role="menu" style={{ minWidth: 320, paddingTop: 8, paddingBottom: 8 }}>
              <li role="presentation" style={{ fontWeight: 700, padding: "8px 12px", pointerEvents: "none", opacity: 0.9 }}>
                알림
              </li>

              {notifs.length === 0 ? (
                <li role="menuitem" style={{ padding: "12px" }}>새 알림이 없습니다.</li>
              ) : (
                notifs.map((n) => (
                  <li
                    key={n.id}
                    role="menuitem"
                    onClick={() => markAsRead(n.id)}
                    style={{ display: "grid", gap: 6, padding: "10px 12px", opacity: n.read ? 0.6 : 1 }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <span style={{ fontWeight: 700 }}>{n.title}</span>
                      <button
                        type="button"
                        aria-label="알림 삭제"
                        title="삭제"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotif(n.id);
                        }}
                        style={{
                          border: "none",
                          background: "transparent",
                          color: "#9ca3af",
                          fontSize: 18,
                          lineHeight: 1,
                          cursor: "pointer",
                          padding: 0,
                        }}
                      >
                        ×
                      </button>
                    </div>
                    <span style={{ fontSize: 12, opacity: 0.8 }}>{n.meta}</span>
                  </li>
                ))
              )}

              {notifs.length > 0 && (
                <li role="presentation" style={{ padding: "8px 12px", background: "transparent" }}>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <div
                      role="group"
                      aria-label="알림 일괄 액션"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        border: "1px solid #e5e7eb",
                        borderRadius: 10,
                        overflow: "hidden",
                      }}
                    >
                      <button
                        type="button"
                        onClick={markAllRead}
                        onMouseEnter={() => setHoverAct("read")}
                        onMouseLeave={() => setHoverAct(null)}
                        className="link-btn"
                        style={{
                          border: "none",
                          background: hoverAct === "read" ? "rgba(37,99,235,.08)" : "transparent",
                          color: "#2563eb",
                          padding: "8px 12px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        모두 읽음
                      </button>

                      <span aria-hidden="true" style={{ width: 1, height: 18, background: "#e5e7eb" }} />

                      <button
                        type="button"
                        onClick={clearAll}
                        onMouseEnter={() => setHoverAct("delete")}
                        onMouseLeave={() => setHoverAct(null)}
                        className="link-btn"
                        style={{
                          border: "none",
                          background: hoverAct === "delete" ? "rgba(239,68,68,.08)" : "transparent",
                          color: "#ef4444",
                          padding: "8px 12px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        모두 삭제
                      </button>
                    </div>
                  </div>
                </li>
              )}
            </ul>
          )}
        </div>

        <div className="dropdown" ref={langMenuRef}>
          <button
            className="btn"
            type="button"
            onClick={() => setLangOpen((v) => !v)}
            aria-expanded={langOpen}
            aria-haspopup="menu"
          >
            <span className="ico">
              <svg viewBox="0 0 24 24">
                <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </span>
            {lang}
            <svg className="caret" viewBox="0 0 24 24" width="16" height="16">
              <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>

          {langOpen && (
            <ul className="menu" role="menu">
              {["한국어", "English", "日本語", "中文"].map((l) => (
                <li
                  key={l}
                  role="menuitem"
                  onClick={() => {
                    setLang(l);
                    setLangOpen(false);
                  }}
                >
                  {l}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button className="btn btn-ghost" type="button">로그아웃</button>
      </div>
    </header>
  );
}

// 아이콘 셋 (Sidebar와 동일)
function icon(name) {
  switch (name) {
    case "bulb":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    case "globe":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18">
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2"/>
          <path d="M2 12h20M12 2a15 15 0 0 1 0 20" fill="none" stroke="currentColor" strokeWidth="2"/>
        </svg>
      );
    case "doc":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" fill="none" stroke="currentColor" strokeWidth="2"/>
          <path d="M14 3v6h6" fill="none" stroke="currentColor" strokeWidth="2"/>
        </svg>
      );
    case "flag":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path d="M12 2v6l5 3-5 3v8" fill="none" stroke="currentColor" strokeWidth="2"/>
        </svg>
      );
    case "triangle":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path d="M3 18l9-12 9 12H3z" fill="none" stroke="currentColor" strokeWidth="2"/>
        </svg>
      );
    case "sea":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path d="M2 18s4-6 10-6 10 6 10 6-4 4-10 4-10-4-10-4zm10-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" fill="none" stroke="currentColor" strokeWidth="2"/>
        </svg>
      );
    case "user":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM3 22c0-5 4-8 9-8s9 3 9 8" fill="none" stroke="currentColor" strokeWidth="2"/>
        </svg>
      );
    case "list":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path d="M3 6h18M3 12h18M3 18h18" fill="none" stroke="currentColor" strokeWidth="2"/>
        </svg>
      );
    case "monitor":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path d="M4 4h16v12H4z" fill="none" stroke="currentColor" strokeWidth="2"/>
          <path d="M8 20h8" stroke="currentColor" strokeWidth="2"/>
        </svg>
      );
    case "shield":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path d="M12 3l7 3v6c0 5-3.5 9-7 9s-7-4-7-9V6l7-3z" fill="none" stroke="currentColor" strokeWidth="2"/>
        </svg>
      );
    default:
      return null;
  }
}
