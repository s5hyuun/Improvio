import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

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
          <div className="placeholder">관리자 페이지</div>
        </section>
      </main>
    </div>
  );
}