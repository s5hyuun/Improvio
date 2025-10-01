import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import styles from "../../styles/Login.module.css";
import SignupAll from "../signupall/signupall";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); 
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
        // 🔹 서버가 반환하는 데이터에 맞게 auth_user 저장
        // data.user 또는 data.data 등에 유저 정보가 들어있다면 여기에 맞춰 넣어야 함
        const userData = {
          user_id: data.user?.user_id,
          username: data.user?.username || username,
          department_id: data.user?.department_id,
          department_name: data.user?.department_name,
          role: data.user?.role || "user",
        };

        // localStorage에 저장 (Sidebar가 읽을 수 있도록)
        localStorage.setItem("auth_user", JSON.stringify(userData));

        // 로그인 상태 변화를 Sidebar에 알림
        window.dispatchEvent(new CustomEvent("auth:changed"));

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
          <form className={styles.form} data-tab={tab} onSubmit={handleLogin}>
            {/* 탭 선택 */}
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

            <div className={styles.cardArea} data-card-area>
              <div className={styles.arrow} />
              <div className={styles.wrapper} data-wrapper>
                {tab === "signin" ? (
                  <>
                    {/* 아이디 입력 */}
                    <input
                      className={styles.input}
                      type="text"
                      placeholder="아이디 입력"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      autoComplete="username"
                    />

                    <div className={styles.passwordWrap}>
                      <input
                        className={styles.input}
                        type={showPassword ? "text" : "password"}
                        placeholder="비밀번호 입력"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className={styles.eyeBtn}
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={
                          showPassword ? "비밀번호 숨기기" : "비밀번호 보기"
                        }
                      >
                        {showPassword ? (
                          <i className="fa-solid fa-eye-slash"></i>
                        ) : (
                          <i className="fa-solid fa-eye"></i>
                        )}
                      </button>
                    </div>

                    {/* 로그인 버튼 */}
                    <div className={styles.actions}>
                      <button
                        type="submit"
                        className={`${styles.button} ${styles.signinBtn}`}
                      >
                        <span>로그인</span>
                      </button>
                    </div>
                  </>
                ) : (
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
