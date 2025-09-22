import React, { useState, useRef } from "react";

export default function Manager() {
  const [langOpen, setLangOpen] = useState(false);
  const [dept, setDept] = useState("R&D");
  const [lang, setLang] = useState("한국어");

  return (
    <div className="app">
      {/* 사이드바 */}
      <aside className="sidebar">
        <div className="sidebar-inner">
          <div className="brand-card">
            <span className="brand-pill">SAMSUNG</span>
          </div>

          <section className="profile">
            <div className="profile-name">username</div>
            <button className="link-btn" type="button">
              edit
            </button>
            <div className="chip-row">
              <span className="chip chip-primary">R&amp;D</span>
              <span className="chip chip-warn">관리자</span>
            </div>
          </section>

          <nav className="nav">
            <a className="nav-item" href="#">
              <span className="ico">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M3 21h18M7 10v8M12 5v13M17 13v5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span>Main Chart</span>
            </a>

            <a className="nav-item" href="#">
              <span className="ico">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M14 3v6h6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </span>
              <span>Requirements</span>
            </a>

            <a className="nav-item" href="#">
              <span className="ico">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M21 12a8 8 0 0 1-8 8H7l-4 3 1-5A8 8 0 1 1 21 12z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span>Community</span>
            </a>
          </nav>

          <div className="section-title">부서 선택</div>

          <div className="dept-wrap">
            <ul className="dept-list">
              {[
                "R&D",
                "해외영업",
                "기본설계",
                "미래사업개발",
                "조선설계",
                "해양설계",
                "PM",
                "구매",
                "경영지원",
                "안전",
              ].map((d) => (
                <li
                  key={d}
                  className={`dept-item ${dept === d ? "selected" : ""}`}
                  onClick={() => setDept(d)}
                >
                  <span className="ico">
                    {/* 샘플 아이콘 하나만 재사용 */}
                    <svg viewBox="0 0 24 24">
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  </span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>

      {/* 메인 */}
      <main className="main">
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
              data-badge="1"
              aria-label="알림"
              type="button"
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

            <div className="dropdown">
              <button
                className="btn"
                type="button"
                onClick={() => setLangOpen((v) => !v)}
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
                <svg
                  className="caret"
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                >
                  <path
                    d="M6 9l6 6 6-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </button>
              {!langOpen ? null : (
                <ul className="menu">
                  {["한국어", "English", "日本語"].map((l) => (
                    <li
                      key={l}
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
            <button className="btn btn-accent" type="button">
              사용자 모드
            </button>

            <button className="icon-btn" aria-label="새로고침" type="button">
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

        <section className="content">
          <div className="placeholder">관리자 대시보드 — 현재 부서: {dept}</div>
        </section>
      </main>
    </div>
  );
}
