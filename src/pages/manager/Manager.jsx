import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import styles from "../../styles/Manager.module.css";

export default function Manager() {
  const [langOpen, setLangOpen] = useState(false);
  const [dept, setDept] = useState("R&D");
  const [lang, setLang] = useState("한국어");

  const [active, setActive] = useState("dashboard");

  return (
    <div className="app">
      <Sidebar />

      <main className="main">
        <Header />
        <section className="content">
          <div className={styles.placeholder} style={{ color: "#1E3A8A" }}>관리자 페이지</div>
          <div className={styles.btn}>
            <button
              type="button"
              className={`${styles.button} ${active === "dashboard" ? styles.active : ""}`}
              onClick={() => setActive("dashboard")}
              aria-pressed={active === "dashboard"}
            >관리자 대시보드</button>
            <button
              type="button"
              className={`${styles.button} ${active === "employee" ? styles.active : ""}`}
              onClick={() => setActive("employee")}
              aria-pressed={active === "employee"}
            >직원 관리</button>
            <button
              type="button"
              className={`${styles.button} ${active === "suggestion" ? styles.active : ""}`}
              onClick={() => setActive("suggestion")}
              aria-pressed={active === "suggestion"}
            > <svg class={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293L16.707 6.707a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                </svg>
              제안 관리</button>
            <button
              type="button"
              className={`${styles.button} ${active === "notice" ? styles.active : ""}`}
              onClick={() => setActive("notice")}
              aria-pressed={active === "notice"}
            >공지 관리</button>
          </div>
        </section>
      </main>
    </div>
  );
}