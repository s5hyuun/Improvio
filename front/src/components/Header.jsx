// Header.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const NOTIFS_STORAGE_KEY = "header_notifs_v1";
const STORAGE_DEPT_KEY = "selected_dept";
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
  1: "rd", 2: "globalSales", 3: "basicDesign", 4: "futureBiz", 5: "shipDesign",
  6: "marineDesign", 7: "pm", 8: "purchase", 9: "ops", 10: "safety",
};

function deptById(id) { return DEPARTMENTS.find((d) => d.id === id) || null; }
function deptByLabel(label) { return DEPARTMENTS.find((d) => d.label === label) || null; }

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

  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new CustomEvent("auth:changed"));
    navigate("/login", { replace: true });
  };

  const topLeft = isAdmin
    ? { label: "관리자 페이지", iconName: "shield", color: "#ea580c" }
    : { label: "사용자", iconName: "user", color: "#2563eb" };

  return (
    <header className="topbar" style={{ display: "flex", alignItems: "center" }}>
      {!isAuthPage && (
        <div className="topbar-left">
          <span
            className="ico"
            style={{ background: topLeft.color, color: "#fff", display: "grid", placeItems: "center", borderRadius: 8, width: 32, height: 32 }}
            aria-hidden="true"
          >
            {icon(topLeft.iconName)}
          </span>
          <strong className="topbar-title">{topLeft.label}</strong>
        </div>
      )}

      <div className="topbar-actions" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
        {!isAuthPage && <SuggestionSearch onSearch={onSearch}/>}

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
      // 검색어 없을 때 BoardPage에 빈 값 전달
      onSearch([], false);
      return;
    }
    try {
      const res = await fetch(
        `http://localhost:5000/api/suggestions/search?query=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      console.log("검색 결과:", data);
      setMessage("");
      // ✅ BoardPage에 검색결과 전달
      onSearch(data, true);
    } catch (err) {
      console.error("검색 실패:", err);
      setMessage("검색에 실패했습니다.");
      // ✅ 실패 시 빈 배열 전달
      onSearch([], false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
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

function icon(name) {
  switch (name) {
    case "shield":
      return (<svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 3l7 3v6c0 5-3.5 9-7 9s-7-4-7-9V6l7-3z" fill="none" stroke="currentColor" strokeWidth="2" /></svg>);
    case "user":
      return (<svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM3 22c0-5 4-8 9-8s9 3 9 8" fill="none" stroke="currentColor" strokeWidth="2" /></svg>);
    default:
      return null;
  }
}
export { SuggestionSearch };