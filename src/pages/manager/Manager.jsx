// Manager.jsx
import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import styles from "../../styles/Manager.module.css";

export default function Manager() {
  const [langOpen, setLangOpen] = useState(false);
  const [dept, setDept] = useState("R&D");
  const [lang, setLang] = useState("한국어");
  const [active, setActive] = useState("dashboard");

  const stats = [
    { label: "총 직원 수", value: 5 },
    { label: "총 제안 수", value: 3 },
    { label: "활성 공지", value: 2 },
    { label: "긴급 제안", value: 1 },
  ];

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

  return (
    <div className="app">
      <Sidebar />

      <main className="main">
        <Header />
        <section className="content">
          <div className={styles.placeholder} style={{ color: "#1E3A8A" }}>
            관리자 페이지
          </div>

          <div className={styles.btn}>
            <button
              type="button"
              className={`${styles.button} ${active === "dashboard" ? styles.active : ""}`}
              onClick={() => setActive("dashboard")}
              aria-pressed={active === "dashboard"}
            >
              <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              관리자 대시보드
            </button>

            <button
              type="button"
              className={`${styles.button} ${active === "employee" ? styles.active : ""}`}
              onClick={() => setActive("employee")}
              aria-pressed={active === "employee"}
            >
              <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
              </svg>
              직원 관리
            </button>

            <button
              type="button"
              className={`${styles.button} ${active === "suggestion" ? styles.active : ""}`}
              onClick={() => setActive("suggestion")}
              aria-pressed={active === "suggestion"}
            >
              <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293L16.707 6.707a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              제안 관리
            </button>

            <button
              type="button"
              className={`${styles.button} ${active === "notice" ? styles.active : ""}`}
              onClick={() => setActive("notice")}
              aria-pressed={active === "notice"}
            >
              <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              공지 관리
            </button>
          </div>

          {active === "dashboard" && (
            <div style={gridStyle} aria-label="대시보드 통계">
              {stats.map((s, i) => (
                <div key={i} style={cardStyle} role="status" aria-live="polite">
                  <div style={valueStyle}>{s.value}</div>
                  <div style={labelStyle}>{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {active === "suggestion" && <SuggestionList />}
        </section>
      </main>
    </div>
  );
}
