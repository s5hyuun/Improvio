import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import styles from "../../styles/Login.module.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: username, password }),
      });

      const data = await response.json();
      if (data.success) {
        alert("로그인 성공!");
        navigate("/dashboard");
      } else {
        alert(data.message || "로그인 실패");
      }
    } catch (error) {
      console.error("로그인 에러:", error);
      alert("서버 오류 발생");
    }
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        <Header />
        <section className={styles.loginContainers}>
          <div className={styles.loginCard}>
            <div>
              <h2 className={styles.loginTitle}>로그인</h2>
            </div>
            <form onSubmit={handleLogin} className={styles.loginForm}>
              <div className={styles.loginName}>
                <div>아이디 입력</div>
                <div>비밀번호 입력</div>
              </div>
              <div className={styles.loginInputs}>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="아이디 입력"
                  className={styles.input}
                  required
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호 입력"
                  className={styles.input}
                  required
                />
              </div>
              <div className={styles.loginButtons}>
                <button type="submit" className={styles.button}>
                  로그인
                </button>
                <div className={styles.signup}>
                  <button onClick={handleSignup}>회원가입</button>
                </div>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
