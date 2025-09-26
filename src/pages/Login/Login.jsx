import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import styles from "../../styles/Login.module.css";
import SignupAll from "../signupall/signupall";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState("signin"); // signin | signup
  const [view, setView] = useState("form"); // form | signupall
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

  // Sign up 라벨/버튼 클릭 시 wrapper 내부로 전환
  const handleSignupInline = () => {
    setTab("signup");
    setView("signupall");
  };

  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        <Header />

        <section className={styles.shell}>
          {/* data-tab & data-view로 CSS 제어 */}
          <form
            className={styles.form}
            data-tab={tab}
            data-view={view}
            onSubmit={handleLogin}
          >
            {/* 탭 라디오 (Reset 제거) */}
            <input
              id="signin"
              className={styles.radio}
              type="radio"
              name="action"
              value="signin"
              checked={tab === "signin"}
              onChange={() => {
                setTab("signin");
                setView("form");
              }}
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
              onChange={() => {
                setTab("signup");
                // ✅ 라벨 클릭만으로도 즉시 signupall 표시
                setView("signupall");
              }}
            />
            <label
              className={styles.tab}
              htmlFor="signup"
              // 혹시 브라우저/스크린리더 딜레이 방지용
              onClick={(e) => {
                setTab("signup");
                setView("signupall");
              }}
            >
              SIGN UP
            </label>

            {/* 화살표 + 카드 */}
            <div className={styles.cardArea} data-card-area>
              <div className={styles.arrow} />
              <div className={styles.wrapper} data-wrapper>
                {view === "form" ? (
                  <>
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
                    {/* 디자인용(회원가입 탭일 때만 노출하도록 CSS에서 처리 가능) */}
                    <input
                      className={`${styles.input} ${styles.optional}`}
                      type="password"
                      placeholder="비밀번호 확인 (Sign up 탭)"
                    />
                  </>
                ) : (
                  <SignupAll onBack={() => setView("form")} />
                )}
              </div>
            </div>

            {/* 버튼 영역: signupall 뷰일 땐 숨김 */}
            {view === "form" ? (
              <div className={styles.actions} data-actions>
                <button
                  type="submit"
                  className={`${styles.button} ${styles.signinBtn}`}
                >
                  <span>Sign in</span>
                </button>

                <button
                  type="button"
                  className={`${styles.button} ${styles.ghost} ${styles.signupBtn}`}
                  onClick={handleSignupInline}
                >
                  회원가입
                </button>
              </div>
            ) : null}

            <p className={styles.hint}>Click on the tabs</p>
          </form>
        </section>
      </main>
    </div>
  );
}
