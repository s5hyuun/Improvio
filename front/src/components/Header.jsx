// Header.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const NOTIFS_STORAGE_KEY = "header_notifs_v1";
const AUTH_KEY = "auth_user";

const DEPARTMENTS = [
  { id: "rd", label: "R&D", icon: "bulb" },
  { id: "globalSales", label: "해외영업", icon: "globe" },
  { id: "basicDesign", label: "기본설계", icon: "doc" },
  { id: "futureBiz", label: "미래사업개발", icon: "flag" },
  { id: "shipDesign", label: "조선설계", icon: "triangle" },
  { id: "marineDesign", label: "해양설계", icon: "sea" },
  { id: "pm", label: "PM", icon: "user" },
  { id: "purchase", label: "구매", icon: "list" },
  { id: "ops", label: "경영지원", icon: "monitor" },
  { id: "safety", label: "안전", icon: "shield" },
];

const DEPT_NUM_TO_ID = {
  1: "rd",
  2: "globalSales",
  3: "basicDesign",
  4: "futureBiz",
  5: "shipDesign",
  6: "marineDesign",
  7: "pm",
  8: "purchase",
  9: "ops",
  10: "safety",
};

function deptById(id) {
  return DEPARTMENTS.find((d) => d.id === id) || null;
}
function deptByLabel(label) {
  return DEPARTMENTS.find((d) => d.label === label) || null;
}

function resolveDeptIdFromServer(deptRaw) {
  if (!deptRaw && deptRaw !== 0) return null;

  if (typeof deptRaw === "number") return DEPT_NUM_TO_ID[deptRaw] || null;

  if (typeof deptRaw === "string" && /^\d+$/.test(deptRaw)) {
    const num = parseInt(deptRaw, 10);
    return DEPT_NUM_TO_ID[num] || null;
  }

  if (typeof deptRaw === "string") {
    if (deptById(deptRaw)) return deptRaw;
    const byLabel = deptByLabel(deptRaw);
    return byLabel ? byLabel.id : null;
  }

  if (typeof deptRaw === "object") {
    const numId = Number(deptRaw.department_id ?? deptRaw.id ?? deptRaw.departmentId);
    if (!Number.isNaN(numId) && numId) {
      const byNum = DEPT_NUM_TO_ID[numId];
      if (byNum) return byNum;
    }
    const label = deptRaw.department_name ?? deptRaw.name ?? deptRaw.label ?? null;
    if (label) {
      const byLabel = deptByLabel(String(label));
      if (byLabel) return byLabel.id;
    }
  }
  return null;
}

function loadUserOnce() {
  let base = {
    role: localStorage.getItem("user_role") || "admin",
    username: localStorage.getItem("username") || "username",
    deptId: localStorage.getItem("user_dept") || null,
  };
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (raw) base = { ...base, ...JSON.parse(raw) };
  } catch {}

  const role = String(base.role ?? base.user_role ?? base.position ?? "").toLowerCase();
  const deptRaw =
    base.deptId ??
    base.user_dept ??
    base.department ??
    base.department_id ??
    base.department_name ??
    base.departmentId ??
    null;

  const deptId = resolveDeptIdFromServer(deptRaw);

  return { role, username: base.username || base.name || "username", deptId };
}

export default function Header({ onSearch }) {
  const [user, setUser] = useState(loadUserOnce());
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = /\/(login|signup)/i.test(location.pathname);

  const role = String(user.role || "").toLowerCase();
  const isAdmin = role === "admin" || role === "manager";

  // 로그인/로그아웃 등 auth 상태 변경 시 user 갱신
  useEffect(() => {
    const onAuthChanged = () => setUser(loadUserOnce());
    window.addEventListener("auth:changed", onAuthChanged);
    return () => window.removeEventListener("auth:changed", onAuthChanged);
  }, []);

  // 언어 드롭다운
  const [langOpen, setLangOpen] = useState(false);
  const [lang, setLang] = useState("한국어");
  const langMenuRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) setLangOpen(false);
    }
    function handleEsc(e) {
      if (e.key === "Escape") setLangOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  // ✅ 일반 알림(벨)
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
      const { id, title, meta, kind, postTitle, actor } = e.detail || {};
      setNotifs((prev) => [
        { id: id ?? Date.now(), kind: kind || "generic", title: postTitle || title || "", meta: actor || meta || "", read: false },
        ...prev,
      ]);
    };
    window.addEventListener("header:notif:add", onAdd);
    return () => window.removeEventListener("header:notif:add", onAdd);
  }, []);

  const unread = notifs.filter((n) => !n.read).length;

  // ✅ 공지(Notice) - 벨 드롭다운에 함께 표시
  const [noticeList, setNoticeList] = useState([]);
  const [noticeActiveCount, setNoticeActiveCount] = useState(0);

  useEffect(() => {
    const onNoticeChanged = (e) => {
      const { list = [], activeCount = 0 } = e.detail || {};
      const activeSorted = (list || [])
        .filter((n) => n.active)
        .sort((a, b) => (a.urgent === b.urgent ? 0 : a.urgent ? -1 : 1))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setNoticeList(activeSorted);
      setNoticeActiveCount(activeCount);
    };

    window.addEventListener("notice:changed", onNoticeChanged);

    // 초기 로드
    try {
      const raw = localStorage.getItem("notices_v1");
      const cached = raw ? JSON.parse(raw) : [];
      const activeSorted = (cached || [])
        .filter((n) => n.active)
        .sort((a, b) => (a.urgent === b.urgent ? 0 : a.urgent ? -1 : 1))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setNoticeList(activeSorted);
      setNoticeActiveCount(activeSorted.length);
    } catch {}

    return () => window.removeEventListener("notice:changed", onNoticeChanged);
  }, []);

  // 드롭다운(벨)
  const [notifOpen, setNotifOpen] = useState(false);
  const notifMenuRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target)) setNotifOpen(false);
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) setLangOpen(false);
    }
    function onEsc(e) {
      if (e.key === "Escape") {
        setNotifOpen(false);
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new CustomEvent("auth:changed"));
    navigate("/login", { replace: true });
  };

  // ⬇️ 관리자: 항상 쉴드+“관리자 페이지”, 사용자: 부서 아이콘/라벨
  const dept = deptById(user.deptId);
  const topLeft = isAdmin
    ? {
        label: "관리자 페이지",
        iconName: "shield",
        color: "#ea580c",
      }
    : {
        label: dept?.label || "사용자",
        iconName: dept?.icon || "user",
        color: "#2563eb",
      };

  // 배지/색 결정
  const totalBadge = unread + noticeActiveCount;
  const bellColor = unread > 0 ? "#EA580C" : noticeActiveCount > 0 ? "#2563EB" : undefined;

  return (
    <header className="topbar" style={{ display: "flex", alignItems: "center" }}>
      {!isAuthPage && (
        <div className="topbar-left">
          <span
            className="ico"
            style={{
              background: topLeft.color,
              color: "#fff",
              display: "grid",
              placeItems: "center",
              borderRadius: 8,
              width: 32,
              height: 32,
            }}
            aria-hidden="true"
          >
            {icon(topLeft.iconName)}
          </span>
          <strong className="topbar-title">{topLeft.label}</strong>
        </div>
      )}

      <div className="topbar-actions" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
        {!isAuthPage && <SuggestionSearch onSearch={onSearch} />}

        {/* 종(벨) - 공지 + 일반 알림 통합 */}
        {!isAuthPage && (
          <div className="dropdown" ref={notifMenuRef}>
            <button
              className="icon-btn"
              aria-label="알림"
              onClick={() => setNotifOpen((v) => !v)}
              style={{ position: "relative" }}
            >
              <svg viewBox="0 0 24 24" style={{ color: bellColor, width: 24, height: 24 }}>
                <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
              {totalBadge > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -2,
                    right: -6,
                    minWidth: 18,
                    height: 18,
                    padding: "0 4px",
                    background: bellColor || "#EA580C",
                    color: "#fff",
                    borderRadius: 9,
                    fontSize: 11,
                    display: "grid",
                    placeItems: "center",
                    lineHeight: 1,
                  }}
                >
                  {totalBadge}
                </span>
              )}
            </button>

            {notifOpen && (
              <ul className="menu" role="menu" style={{ minWidth: 320, padding: 8 }}>
                {/* 공지 */}
                <li style={{ fontWeight: 700, padding: "6px 8px" }}>공지</li>
                {noticeList.length === 0 ? (
                  <li style={{ padding: 8, opacity: 0.8 }}>활성 공지가 없습니다.</li>
                ) : (
                  noticeList.map((n) => (
                    <li key={n.id} style={{ padding: "8px 6px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 600 }}>{n.urgent ? "🔥 " : ""}{n.title}</span>
                        <span style={{ fontSize: 12, opacity: 0.7 }}>{n.created_at}</span>
                      </div>
                      {n.body && (
                        <div style={{ marginTop: 4, fontSize: 13, opacity: 0.9, whiteSpace: "pre-wrap" }}>
                          {n.body}
                        </div>
                      )}
                    </li>
                  ))
                )}

                {/* 일반 알림 바로 이어서 */}
                {notifs.length > 0 &&
                  notifs.map((n) => (
                    <li
                      key={n.id}
                      onClick={() => setNotifs((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))}
                      style={{ padding: "8px 6px", opacity: n.read ? 0.6 : 1, cursor: "pointer" }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>{n.title}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setNotifs((prev) => prev.filter((x) => x.id !== n.id));
                          }}
                          style={{ border: "none", background: "transparent", cursor: "pointer" }}
                        >
                          ×
                        </button>
                      </div>
                      <div style={{ fontSize: 12, opacity: 0.8 }}>{n.meta}</div>
                    </li>
                  ))}

                {notifs.length > 0 && (
                  <li style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: 4 }}>
                    <button onClick={() => setNotifs((prev) => prev.map((n) => ({ ...n, read: true })))}>모두 읽음</button>
                    <button onClick={() => setNotifs([])}>모두 삭제</button>
                  </li>
                )}
              </ul>
            )}
          </div>
        )}

        <div className="dropdown" ref={langMenuRef}>
          <button className="btn" type="button" onClick={() => setLangOpen((v) => !v)} aria-expanded={langOpen} aria-haspopup="menu">
            <span className="ico">
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
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
                <li key={l} role="menuitem" onClick={() => { setLang(l); setLangOpen(false); }}>
                  {l}
                </li>
              ))}
            </ul>
          )}
        </div>

        {!isAuthPage && (
          <button className="btn btn-ghost" type="button" onClick={handleLogout}>
            로그아웃
          </button>
        )}
      </div>
    </header>
  );
}

function SuggestionSearch({ onSearch }) {
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) {
      setMessage("검색어를 입력해주세요.");
      onSearch([], false);
      return;
    }
    try {
      const res = await fetch(
        `http://localhost:5000/api/suggestions/search?query=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setMessage("");
      onSearch(data, true);
    } catch (err) {
      console.error("검색 실패:", err);
      setMessage("검색에 실패했습니다.");
      onSearch([], false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="search" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <span className="ico search-ico">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M21 21l-4.3-4.3" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </span>
      <input
        type="text"
        placeholder="검색"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{
          border: "none",
          outline: "none",
          padding: "0.4rem 0.6rem",
          fontSize: "14px",
          backgroundColor: "transparent",
        }}
      />
      {message && <span style={{ color: "red" }}>{message}</span>}
    </div>
  );
}

// Sidebar의 아이콘 이름들과 동일하게 제공
function icon(name) {
  switch (name) {
    case "bars":
      return (
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M3 21h18M7 10v8M12 5v13M17 13v5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "doc":
      return (
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M14 3v6h6" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "chat":
      return (
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M21 12a8 8 0 0 1-8 8H7l-4 3 1-5A8 8 0 1 1 21 12z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      );
    case "shield":
      return (
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M12 3l7 3v6c0 5-3.5 9-7 9s-7-4-7-9V6l7-3z" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "bulb":
      return (
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "globe":
      return (
        <svg viewBox="0 0 24 24" width="20" height="20">
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M2 12h20M12 2a15 15 0 0 1 0 20" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "flag":
      return (
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M12 2v6l5 3-5 3v8" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "triangle":
      return (
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M3 18l9-12 9 12H3z" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "sea":
      return (
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M2 18s4-6 10-6 10 6 10 6-4 4-10 4-10-4-10-4zm10-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "user":
      return (
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM3 22c0-5 4-8 9-8s9 3 9 8" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "list":
      return (
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M3 6h18M3 12h18M3 18h18" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "monitor":
      return (
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M4 4h16v12H4z" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M8 20h8" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    default:
      return null;
  }
}

export { SuggestionSearch };
