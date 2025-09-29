import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import styles from "../../styles/Login.module.css";
import SignupAll from "../signupall/signupall";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState("signin"); // "signin" | "signup"
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
        navigate("/main");
      } else {
        alert(data.message || "로그인 실패");
      }
    } catch (error) {
      console.error("로그인 에러:", error);
      alert("서버 오류 발생");
    }
  };

  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        <Header />

        <section className={styles.shell}>
          {/* data-tab 로 스타일 제어 */}
          <form className={styles.form} data-tab={tab} onSubmit={handleLogin}>
            {/* 탭 라디오 (Reset 제거) */}
            <input
              id="signin"
              className={styles.radio}
              type="radio"
              name="action"
              value="signin"
              checked={tab === "signin"}
              onChange={() => setTab("signin")}
            />
            <label className={styles.tab} htmlFor="signin">
              SIGN IN
            </label>

            <input
              id="signup"
              className={styles.radio}
              type="radio"
              name="action"
              value="signup"
              checked={tab === "signup"}
              onChange={() => setTab("signup")}
            />
            <label
              className={styles.tab}
              htmlFor="signup"
              onClick={() => setTab("signup")}
            >
              SIGN UP
            </label>

            {/* 화살표 + 카드 */}
            <div className={styles.cardArea} data-card-area>
              <div className={styles.arrow} />
              <div className={styles.wrapper} data-wrapper>
                {tab === "signin" ? (
                  <>
                    {/* <h2 style={{ margin: "4px 0 8px 0" }}>로그인</h2> */}
                    <input
                      className={styles.input}
                      type="text"
                      placeholder="아이디 입력"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      autoComplete="username"
                    />
                    <input
                      className={styles.input}
                      type="password"
                      placeholder="비밀번호 입력"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                    />

                    {/* 버튼 (signin에서만 노출) */}
                    <div className={styles.actions}>
                      <button
                        type="submit"
                        className={`${styles.button} ${styles.signinBtn}`}
                      >
                        <span>로그인</span>
                      </button>
                      {/* <button
                        type="button"
                        className={`${styles.button} ${styles.ghost} ${styles.signupBtn}`}
                        onClick={() => setTab("signup")}
                      >
                        회원가입
                      </button> */}
                    </div>
                  </>
                ) : (
                  // ✅ SIGN UP 탭: 바로 signupall 렌더 (흰 화면 없이 즉시 전환)
                  <SignupAll onBack={() => setTab("signin")} />
                )}
              </div>
            </div>

            <p className={styles.hint}>Click on the tabs</p>
          </form>
        </section>
      </main>
    </div>
  );
}
