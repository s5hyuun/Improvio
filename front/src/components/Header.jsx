// Header.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const NOTIFS_STORAGE_KEY = "header_notifs_v1";
const AUTH_KEY = "auth_user";
const NOTICE_STORAGE_KEY = "notices_v1";

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
  1: "rd", 2: "globalSales", 3: "basicDesign", 4: "futureBiz", 5: "shipDesign",
  6: "marineDesign", 7: "pm", 8: "purchase", 9: "ops", 10: "safety",
};

const NOTICE_SEED = [
  { id: 1, title: "긴급: 생산라인 자동화 제안 검토 필요", body: "높은 우선순위를 가진 생산라인 자동화 제안이 제출되었습니다. 관련 부서의 빠른 검토가 필요합니다.", urgent: true, active: true, created_at: "2024-01-15", read: false },
  { id: 2, title: "월간 안전교육 일정 안내", body: "이번 달 안전교육 일정을 안내드립니다. 모든 직원은 반드시 참석해주시기 바랍니다.", urgent: false, active: true, created_at: "2024-01-10", read: false },
];

/** ─── 공통 유틸 ───────────────────────────────────────────── */
function isAuthenticated() {
  try { return !!localStorage.getItem(AUTH_KEY); } catch { return false; }
}

/** ─── 시간 유틸 ────────────────────────────────────────────── */
function normalizeNotice(n) {
  const ts =
    typeof n.created_at_ts === "number" && Number.isFinite(n.created_at_ts)
      ? n.created_at_ts
      : Number.isFinite(+n.created_at)
      ? Number(n.created_at)
      : new Date(n.created_at || Date.now()).getTime();
  return { ...n, read: !!n.read, created_at_ts: ts };
}
function timeAgo(ts) {
  const diff = Date.now() - ts;
  if (diff < 5000) return "방금 전";
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}초 전`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  return `${d}일 전`;
}

/** ─── Notice helpers ─────────────────────────────────────────── */
function readNoticesFromStorage() {
  try { const raw = localStorage.getItem(NOTICE_STORAGE_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
function writeNoticesToStorage(list) {
  try { localStorage.setItem(NOTICE_STORAGE_KEY, JSON.stringify(list ?? [])); } catch {}
}
function broadcastNotices(list) {
  writeNoticesToStorage(list);
  const activeCount = (list || []).filter(n => n.active).length;
  window.dispatchEvent(new CustomEvent("notice:changed", { detail: { list, activeCount } }));
}
function ensureNoticesSeeded() {
  const current = readNoticesFromStorage();
  if (current === null) {
    const seeded = NOTICE_SEED.map(normalizeNotice);
    broadcastNotices(seeded);
    return seeded;
  }
  return (current || []).map(normalizeNotice);
}

/** ─── Dept helpers ───────────────────────────────────────────── */
function deptById(id){return DEPARTMENTS.find(d=>d.id===id)||null;}
function deptByLabel(label){return DEPARTMENTS.find(d=>d.label===label)||null;}
function resolveDeptIdFromServer(deptRaw){
  if(!deptRaw&&deptRaw!==0) return null;
  if(typeof deptRaw==="number") return DEPT_NUM_TO_ID[deptRaw]||null;
  if(typeof deptRaw==="string" && /^\d+$/.test(deptRaw)) return DEPT_NUM_TO_ID[parseInt(deptRaw,10)]||null;
  if(typeof deptRaw==="string"){ if(deptById(deptRaw)) return deptRaw; const by=deptByLabel(deptRaw); return by?by.id:null; }
  if(typeof deptRaw==="object"){
    const numId = Number(deptRaw.department_id ?? deptRaw.id ?? deptRaw.departmentId);
    if(!Number.isNaN(numId) && numId){ const by=DEPT_NUM_TO_ID[numId]; if(by) return by; }
    const label = deptRaw.department_name ?? deptRaw.name ?? deptRaw.label ?? null;
    if(label){ const by=deptByLabel(String(label)); if(by) return by.id; }
  }
  return null;
}

function loadUserOnce(){
  // 로그인 안 된 경우
  if (!isAuthenticated()) return { role: "", username: "", deptId: null, isAuthenticated: false };

  // 로그인 된 경우에만 AUTH_KEY 기반으로 정보 구성
  let base = { role: localStorage.getItem("user_role")||"", username: localStorage.getItem("username")||"", deptId: localStorage.getItem("user_dept")||null };
  try{ const raw = localStorage.getItem(AUTH_KEY); if(raw) base={...base, ...JSON.parse(raw)}; }catch{}
  const role = String(base.role ?? base.user_role ?? base.position ?? "").toLowerCase();
  const deptRaw = base.deptId ?? base.user_dept ?? base.department ?? base.department_id ?? base.department_name ?? base.departmentId ?? null;
  const deptId = resolveDeptIdFromServer(deptRaw);
  return { role, username: base.username || base.name || "", deptId, isAuthenticated: true };
}

/** ─── Component ──────────────────────────────────────────────── */
export default function Header({ onSearch }) {
  const [user, setUser] = useState(loadUserOnce());
  const [authed, setAuthed] = useState(isAuthenticated());

  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = /\/(login|signup)/i.test(location.pathname);

  const role = String(user.role || "").toLowerCase();
  const isAdmin = role === "admin" || role === "manager";

  // 로그인 상태 변화 감지
  useEffect(() => {
    const onAuthChanged = () => {
      setAuthed(isAuthenticated());
      setUser(loadUserOnce());
      ensureNoticesSeeded();
    };
    const onStorage = (e) => {
      if (e.key === AUTH_KEY) {
        setAuthed(isAuthenticated());
        setUser(loadUserOnce());
      }
    };
    window.addEventListener("auth:changed", onAuthChanged);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("auth:changed", onAuthChanged);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // 미인증 시 로그인 페이지로 강제 이동
  useEffect(() => {
    if (!authed && !isAuthPage) {
      navigate("/login", { replace: true });
    }
  }, [authed, isAuthPage, navigate]);

  // 언어
  const [langOpen, setLangOpen] = useState(false);
  const [lang, setLang] = useState("한국어");
  const langMenuRef = useRef(null);
  useEffect(() => {
    const handleClick = (e) => { if (langMenuRef.current && !langMenuRef.current.contains(e.target)) setLangOpen(false); };
    const handleEsc = (e) => { if (e.key === "Escape") setLangOpen(false); };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => { document.removeEventListener("mousedown", handleClick); document.removeEventListener("keydown", handleEsc); };
  }, []);

  // 일반 알림
  const [notifs, setNotifs] = useState(() => {
    try { const raw = localStorage.getItem(NOTIFS_STORAGE_KEY); return raw ? JSON.parse(raw) : []; } catch { return []; }
  });
  useEffect(() => { try { localStorage.setItem(NOTIFS_STORAGE_KEY, JSON.stringify(notifs)); } catch {} }, [notifs]);
  useEffect(() => {
    const onAdd = (e) => {
      const { id, title, meta, kind, postTitle, actor } = e.detail || {};
      setNotifs((prev) => [{ id: id ?? Date.now(), kind: kind || "generic", title: postTitle || title || "", meta: actor || meta || "", read: false }, ...prev]);
    };
    window.addEventListener("header:notif:add", onAdd);
    return () => window.removeEventListener("header:notif:add", onAdd);
  }, []);
  const unreadNotifs = notifs.filter((n) => !n.read).length;

  // 공지(저장/동기)
  const [noticeList, setNoticeList] = useState([]);
  useEffect(() => {
    const initial = ensureNoticesSeeded();
    applyNoticeState(initial);

    const onNoticeChanged = (e) => { const { list=[] } = e.detail || {}; applyNoticeState(list); };
    window.addEventListener("notice:changed", onNoticeChanged);

    const onStorage = (e) => {
      if (e.key === NOTICE_STORAGE_KEY) {
        try { const list = e.newValue ? JSON.parse(e.newValue) : []; applyNoticeState(list); } catch {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => { window.removeEventListener("notice:changed", onNoticeChanged); window.removeEventListener("storage", onStorage); };
  }, []);

  function applyNoticeState(listRaw = []) {
    const normalized = (listRaw || []).map(normalizeNotice);
    const activeSorted = normalized
      .filter((n) => n.active)
      .sort((a,b)=> (a.urgent===b.urgent?0:(a.urgent?-1:1)))
      .sort((a,b)=> b.created_at_ts - a.created_at_ts);
    setNoticeList(activeSorted);
  }

  // 공지 읽음/삭제 조작
  const setNoticeRead = (id, read=true) => {
    const all = readNoticesFromStorage() || [];
    const updated = all.map(n => n.id === id ? { ...n, read } : n);
    broadcastNotices(updated);
  };
  const markAllNoticesRead = () => {
    const all = readNoticesFromStorage() || [];
    const updated = all.map(n => n.active ? { ...n, read: true } : n);
    broadcastNotices(updated);
  };
  const deactivateNotice = (id) => {
    const all = readNoticesFromStorage() || [];
    const updated = all.map(n => n.id === id ? { ...n, active: false } : n);
    broadcastNotices(updated);
  };
  const deactivateAllNotices = () => {
    const all = readNoticesFromStorage() || [];
    const updated = all.map(n => ({ ...n, active: false }));
    broadcastNotices(updated);
  };

  // 드롭다운 닫힘 제어
  const [notifOpen, setNotifOpen] = useState(false);
  const notifMenuRef = useRef(null);
  useEffect(() => {
    const onDocClick = (e) => {
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target)) setNotifOpen(false);
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) setLangOpen(false);
    };
    const onEsc = (e) => { if (e.key === "Escape") { setNotifOpen(false); setLangOpen(false); } };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => { document.removeEventListener("mousedown", onDocClick); document.removeEventListener("keydown", onEsc); };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    window.dispatchEvent(new CustomEvent("auth:changed"));
    navigate("/login", { replace: true });
  };

  // 좌측 표시
  const dept = deptById(user.deptId);
  const topLeft = isAdmin
    ? { label: "관리자 페이지", iconName: "shield", color: "#ea580c" }
    : { label: dept?.label || "사용자", iconName: dept?.icon || "user", color: "#2563eb" };

  // 배지: 미읽음만 집계
  const unreadNotices = noticeList.filter(n => !n.read).length;
  const totalBadge = unreadNotifs + unreadNotices;
  const bellColor = totalBadge > 0 ? (unreadNotifs > 0 ? "#EA580C" : "#2563EB") : undefined;

  /** ─── 하단 컨트롤 ───────────────────────────────────────── */
  const handleMarkAllRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    markAllNoticesRead();
  };
  const handleClearAll = () => {
    setNotifs([]);
    deactivateAllNotices();
  };

  const nothingToRead =
    unreadNotifs === 0 && unreadNotices === 0;
  const nothingToDelete =
    notifs.length === 0 && noticeList.length === 0;

  return (
    <header className="topbar" style={{ display: "flex", alignItems: "center" }}>
      {!isAuthPage && (
        <div className="topbar-left">
          <span className="ico" style={{ background: topLeft.color, color: "#fff", display: "grid", placeItems: "center", borderRadius: 8, width: 32, height: 32 }} aria-hidden="true">
            {icon(topLeft.iconName)}
          </span>
          <strong className="topbar-title">{topLeft.label}</strong>
        </div>
      )}

      <div className="topbar-actions" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
        {!isAuthPage && <SuggestionSearch onSearch={onSearch} />}

        {!isAuthPage && (
          <div className="dropdown" ref={notifMenuRef}>
            <button className="icon-btn" aria-label="알림" onClick={() => setNotifOpen(v => !v)} style={{ position: "relative" }}>
              <svg viewBox="0 0 24 24" style={{ color: bellColor, width: 24, height: 24 }}>
                <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
              {totalBadge > 0 && (
                <span className="badge-dot" style={{ position: "absolute", top: -2, right: -6, minWidth: 18, height: 18, padding: "0 4px", background: bellColor || "#EA580C", color: "#fff", borderRadius: 9, fontSize: 11, display: "grid", placeItems: "center", lineHeight: 1 }}>
                  {totalBadge}
                </span>
              )}
            </button>

            {notifOpen && (
              <ul className="menu notif-menu" role="menu">
                <li className="menu-header">공지</li>

                {noticeList.length === 0 ? (
                  <li className="menu-empty">공지가 없습니다.</li>
                ) : (
                  noticeList.map((n) => (
                    <li
                      key={n.id}
                      className={`menu-item-clickable ${n.read ? "is-read" : ""}`}
                      onClick={() => setNoticeRead(n.id, true)}
                    >
                      <div className="notice-row">
                        <span className="notice-title">{n.urgent ? "🔥 " : ""}{n.title}</span>
                        <div className="notice-right">
                          <span className="notice-time">{timeAgo(n.created_at_ts)}</span>
                          <button
                            type="button"
                            className="btn-x"
                            onClick={(e) => { e.stopPropagation(); deactivateNotice(n.id); }}
                            title="공지 삭제"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                      {n.body && <div className="notice-body">{n.body}</div>}
                    </li>
                  ))
                )}

                {notifs.length > 0 && notifs.map((n) => (
                  <li
                    key={n.id}
                    className={`menu-item-clickable ${n.read ? "is-read" : ""}`}
                    onClick={() => setNotifs(prev => prev.map(x => (x.id === n.id ? { ...x, read: true } : x)))}
                  >
                    <div className="notif-row">
                      <span className="notif-title">{n.title}</span>
                      <button
                        type="button"
                        className="btn-x"
                        onClick={(e) => { e.stopPropagation(); setNotifs(prev => prev.filter(x => x.id !== n.id)); }}
                        title="알림 삭제"
                      >
                        ×
                      </button>
                    </div>
                    <div className="notif-meta">{n.meta}</div>
                  </li>
                ))}

                <li className="menu-footer">
                  <button
                    type="button"
                    className="btn-sm btn-light"
                    onClick={handleMarkAllRead}
                    disabled={nothingToRead}
                    title="알림/공지를 모두 읽음 처리"
                  >
                    모두 읽기
                  </button>
                  <button
                    type="button"
                    className="btn-sm btn-primary"
                    onClick={handleClearAll}
                    disabled={nothingToDelete}
                    title="알림 모두 삭제 + 공지 전역 비활성화"
                  >
                    모두 삭제
                  </button>
                </li>
              </ul>
            )}
          </div>
        )}

        <div className="dropdown" ref={langMenuRef}>
          <button className="btn" type="button" onClick={() => setLangOpen(v => !v)} aria-expanded={langOpen} aria-haspopup="menu">
            <span className="ico">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
            </span>
            {lang}
            <svg className="caret" viewBox="0 0 24 24" width="16" height="16"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
          </button>

          {langOpen && (
            <ul className="menu" role="menu">
              {["한국어", "English", "日本語", "中文"].map((l) => (
                <li key={l} role="menuitem" onClick={() => { setLang(l); setLangOpen(false); }}>{l}</li>
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

/** ─── Search box ─────────────────────────────────────────────── */
function SuggestionSearch({ onSearch }) {
  const [query, setQuery] = useState(""); const [message, setMessage] = useState("");
  const handleSearch = async () => {
    if (!query.trim()) { setMessage("검색어를 입력해주세요."); onSearch([], false); return; }
    try {
      const res = await fetch(`http://localhost:5000/api/suggestions/search?query=${encodeURIComponent(query)}`);
      const data = await res.json(); setMessage(""); onSearch(data, true);
    } catch (err) { console.error("검색에 실패했습니다.", err); setMessage("검색에 실패했습니다."); onSearch([], false); }
  };
  const handleKeyDown = (e) => { if (e.key === "Enter") handleSearch(); };
  return (
    <div className="search" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <span className="ico search-ico">
        <svg viewBox="0 0 24 24" width="20" height="20"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M21 21l-4.3-4.3" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
      </span>
      <input type="text" placeholder="검색" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleKeyDown} style={{ border: "none", outline: "none", padding: "0.4rem 0.6rem", fontSize: "14px", backgroundColor: "transparent" }} />
      {message && <span style={{ color: "red" }}>{message}</span>}
    </div>
  );
}

/** ─── Icons ─────────────────────────────────────────────────── */
function icon(name) {
  switch (name) {
    case "bars": return (<svg viewBox="0 0 24 24" width="20" height="20"><path d="M3 21h18M7 10v8M12 5v13M17 13v5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>);
    case "doc": return (<svg viewBox="0 0 24 24" width="20" height="20"><path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M14 3v6h6" fill="none" stroke="currentColor" strokeWidth="2" /></svg>);
    case "chat": return (<svg viewBox="0 0 24 24" width="20" height="20"><path d="M21 12a8 8 0 0 1-8 8H7l-4 3 1-5A8 8 0 1 1 21 12z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>);
    case "shield": return (<svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 3l7 3v6c0 5-3.5 9-7 9s-7-4-7-9V6l7-3z" fill="none" stroke="currentColor" strokeWidth="2" /></svg>);
    case "bulb": return (<svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>);
    case "globe": return (<svg viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="2" /></svg>);
    case "flag": return (<svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 2v6l5 3-5 3v8" fill="none" stroke="currentColor" strokeWidth="2" /></svg>);
    case "triangle": return (<svg viewBox="0 0 24 24" width="20" height="20"><path d="M3 18l9-12 9 12H3z" fill="none" stroke="currentColor" strokeWidth="2" /></svg>);
    case "sea": return (<svg viewBox="0 0 24 24" width="20" height="20"><path d="M2 18s4-6 10-6 10 6 10 6-4 4-10 4-10-4-10-4zm10-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" fill="none" stroke="currentColor" strokeWidth="2" /></svg>);
    case "user": return (<svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM3 22c0-5 4-8 9-8s9 3 9 8" fill="none" stroke="currentColor" strokeWidth="2" /></svg>);
    case "list": return (<svg viewBox="0 0 24 24" width="20" height="20"><path d="M3 6h18M3 12h18M3 18h18" fill="none" stroke="currentColor" strokeWidth="2" /></svg>);
    case "monitor": return (<svg viewBox="0 0 24 24" width="20" height="20"><path d="M4 4h16v12H4z" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M8 20h8" stroke="currentColor" strokeWidth="2" /></svg>);
    default: return null;
  }
}

export { SuggestionSearch };
