import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import styles from "../../styles/Login.module.css";
import SignupAll from "../signupall/signupall";

export default function Login() {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState("signin");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:4000/api/login", {
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
          <form className={styles.form} data-tab={tab} onSubmit={handleLogin}>
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
                {tab === "signin" && (
                  <>
                    <input
                      className={styles.input}
                      type="text"
                      placeholder={t("loginPage.usernamePlaceholder")}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      autoComplete="username"
                    />
                    <input
                      className={styles.input}
                      type="password"
                      placeholder={t("loginPage.passwordPlaceholder")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                    <div className={styles.actions}>
                      <button
                        type="submit"
                        className={`${styles.button} ${styles.signinBtn}`}
                      >
                        {t("loginPage.signinBtn")}
                      </button>
                    </div>
                  </>
                )}
                {tab === "signup" && <SignupAll onBack={() => setTab("signin")} />}
              </div>
            </div>

            <p className={styles.hint}>Click on the tabs</p>
          </form>
        </section>
      </main>
    </div>
  );
}
