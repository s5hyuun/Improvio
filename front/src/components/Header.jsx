//Header.jsx 입니ㅣ다.

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export default function Header({ isLoggedIn, setIsLoggedIn, onSearch }) {
  const [badge, setBadge] = useState(1);
  const [langOpen, setLangOpen] = useState(false);
  const [lang, setLang] = useState("한국어");
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setLangOpen(false);
      }
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

  return (
    <header className="topbar">
      <div className="topbar-left">
        <span className="ico shield">
          <svg viewBox="0 0 24 24">
            <path
              d="M12 3l7 3v6c0 5-3.5 9-7 9s-7-4-7-9V6l7-3z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </span>
        <strong className="topbar-title">관리자 페이지</strong>
      </div>

      <div className="topbar-actions">
        {/* 검색창 */}
        <div style={{ paddingRight: "1rem" }}>
          <SuggestionSearch onResults={onSearch} />
        </div>

        <button
          className="icon-btn"
          aria-label="알림"
          data-badge={badge > 0 ? String(badge) : null}
          onClick={() => setBadge((n) => Math.max(0, n - 1))}
        >
          <svg viewBox="0 0 24 24">
            <path
              d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M13.73 21a2 2 0 0 1-3.46 0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </button>

        <div className="dropdown" ref={menuRef}>
          <button
            className="btn"
            type="button"
            onClick={() => setLangOpen((v) => !v)}
            aria-expanded={langOpen}
            aria-haspopup="menu"
          >
            <span className="ico">
              <svg viewBox="0 0 24 24">
                <path
                  d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </span>
            {lang}
            <svg className="caret" viewBox="0 0 24 24" width="16" height="16">
              <path
                d="M6 9l6 6 6-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </button>

          {langOpen && (
            <ul className="menu" role="menu">
              {["한국어", "English", "日本語"].map((l) => (
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

        {isLoggedIn ? (
          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => setIsLoggedIn(false)}
          >
            로그아웃
          </button>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost">
              로그인
            </Link>
            <Link to="/signupall" className="btn btn-ghost">
              회원가입
            </Link>
          </>
        )}

        <button
          className="icon-btn"
          aria-label="새로고침"
          type="button"
          onClick={(e) => {
            e.currentTarget.style.transform = "rotate(180deg)";
            setTimeout(() => (e.currentTarget.style.transform = ""), 300);
          }}
        >
          <svg viewBox="0 0 24 24">
            <path
              d="M21 12a9 9 0 1 1-3-6.7M21 3v6h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}

// ========================
// SuggestionSearch 컴포넌트
// ========================
function SuggestionSearch({ onResults }) {
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) {
      setMessage("검색어를 입력해주세요.");
      onResults([], false);
      return;
    }

    const res = await fetch(
      `http://localhost:5000/api/suggestions/search?query=${encodeURIComponent(
        query
      )}`
    );
    const data = await res.json();

    if (data.length === 0) {
      setMessage("");
    } else {
      setMessage("");
    }

    onResults(data, true);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="검색어 입력"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={handleSearch}>검색</button>
      {message && <p style={{ color: "red" }}>{message}</p>}
    </div>
  );
}

export { SuggestionSearch };
