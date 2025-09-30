import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Header({ isLoggedIn, setIsLoggedIn, onSearch }) {
  const [badge, setBadge] = useState(1);
  const [langOpen, setLangOpen] = useState(false);
  const [lang, setLang] = useState("한국어");
  const menuRef = useRef(null);
  const navigate = useNavigate();

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

  // 안전한 로그아웃 처리
  const handleLogout = () => {
    // 로그인 상태 초기화
    setIsLoggedIn(false);

    // 로컬 스토리지/세션 토큰 삭제
    localStorage.removeItem("token"); // 만약 토큰을 로컬스토리지에 저장했다면
    sessionStorage.removeItem("token");

    // 필요한 경우 쿠키도 삭제 가능 (js-cookie 등 사용)
    // Cookies.remove("token");

    // 로그인 페이지로 이동
    navigate("/login");
  };

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

        {/* 알림 버튼 */}
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

        {/* 언어 선택 */}
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

        {/* 로그인/로그아웃 */}
        {isLoggedIn ? (
          <button
            className="btn btn-ghost"
            type="button"
            onClick={handleLogout}
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

    setMessage("");
    onResults(data, true);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div
      className="search"
      style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
    >
      <span className="ico search-ico">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <circle
            cx="11"
            cy="11"
            r="7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M21 21l-4.3-4.3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </span>
      <input
        type="text"
        placeholder="검색어 입력"
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
      {message && (
        <p style={{ color: "red", marginLeft: "0.5rem" }}>{message}</p>
      )}
    </div>
  );
}

export { SuggestionSearch };
