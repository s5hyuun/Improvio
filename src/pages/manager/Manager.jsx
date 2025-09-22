import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import styles from "../../styles/Manager.module.css";

export default function Manager() {
  const [langOpen, setLangOpen] = useState(false);
  const [dept, setDept] = useState("R&D");
  const [lang, setLang] = useState("한국어");

  return (
    <div className="app">
      <Sidebar />

      <main className="main">
        <Header />
        <section className="content">
          <div className="placeholder" style={{ color: "#1E3A8A" }}>관리자 페이지</div>
          <div className={styles.btn}>
            <button className="btn" style={{ color: "#2563EB" }} >관리자 대시보드</button>
            <button className="btn" style={{ color: "#2563EB" }}>직원 관리</button>
            <button className="btn" style={{ color: "#2563EB" }}>제안 관리</button>
            <button className="btn" style={{ color: "#2563EB" }}>공지 관리</button>
          </div>
        </section>
      </main>
    </div>
  );
}