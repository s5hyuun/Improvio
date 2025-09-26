import React from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";

export default function SignupAll() {
  const navigate = useNavigate();

  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        <Header />

        <div style={{ padding: "2rem", textAlign: "center" }}>
          <h1>회원가입 선택</h1>
          <p>아래 버튼 중 하나를 선택해주세요.</p>

          <div style={{ marginTop: "2rem" }}>
            <button
              style={{
                padding: "1rem 2rem",
                margin: "1rem",
                fontSize: "1.2rem",
                cursor: "pointer",
              }}
              onClick={() => navigate("/signup4")}
            >
              관리자용 회원가입
            </button>

            <button
              style={{
                padding: "1rem 2rem",
                margin: "1rem",
                fontSize: "1.2rem",
                cursor: "pointer",
              }}
              onClick={() => navigate("/signup")}
            >
              직원용 회원가입
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
