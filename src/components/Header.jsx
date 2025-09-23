import { useEffect, useRef, useState } from "react";

export default function Header() {
  // 알림 목록 데이터 > 확인용
  const [notifs, setNotifs] = useState([
    { id: 1, title: "새 제안이 등록되었습니다.", meta: "R&D · 방금 전", read: false },
    { id: 2, title: "공지: 시스템 점검 안내", meta: "관리팀 · 1시간 전", read: false },
  ]);

  const unread = notifs.filter((n) => !n.read).length; 
  const [notifOpen, setNotifOpen] = useState(false); 

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
              <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M21 21l-4.3-4.3" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          </span>
          <input type="text" placeholder="검색" />
        </div>

        <div className="dropdown" ref={notifMenuRef}>
          <button
            className="icon-btn"
            aria-label="알림"
            data-dot={hasBadge ? "" : undefined} 
            style={bellBtnStyle}   
            onClick={() => setNotifOpen((v) => !v)}
          >
            <svg viewBox="0 0 24 24" style={{ color: bellColor }}>
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

          {notifOpen && (
            <ul
              className="menu"
              role="menu"
              style={{ minWidth: 320, paddingTop: 8, paddingBottom: 8 }}
            >
              <li
                role="presentation"
                style={{
                  fontWeight: 700,
                  padding: "8px 12px",
                  pointerEvents: "none",
                  opacity: 0.9,
                }}
              >
                알림
              </li>

              {notifs.length === 0 ? (
                <li role="menuitem" style={{ padding: "12px" }}>
                  새 알림이 없습니다.
                </li>
              ) : (
                notifs.map((n) => (
                  <li
                    key={n.id}
                    role="menuitem"
                    onClick={() => markAsRead(n.id)}
                    style={{
                      display: "grid",
                      gap: 6,
                      padding: "10px 12px",
                      opacity: n.read ? 0.6 : 1,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 8,
                      }}
                    >
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
                <li
                  role="presentation"
                  style={{
                    padding: "8px 12px",
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 12,
                  }}
                >
                  <button className="link-btn" type="button" onClick={markAllRead}>
                    모두 읽음
                  </button>
                  <button
                    className="link-btn"
                    type="button"
                    onClick={clearAll}
                    style={{ color: "#ef4444" }}
                  >
                    모두 삭제
                  </button>
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
