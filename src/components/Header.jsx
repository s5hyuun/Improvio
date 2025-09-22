import { useEffect, useRef, useState } from "react";

export default function Header() {
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
        <div className="search">
          <span className="ico search-ico">
            <svg viewBox="0 0 24 24">
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
          <input type="text" placeholder="검색" />
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

        <button className="btn btn-ghost" type="button">
          로그아웃
        </button>

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
