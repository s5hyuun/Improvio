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

  const DEPT_LABEL_BY_NUM = {
    1: "R&D",
    2: "해외영업",
    3: "기본설계",
    4: "미래사업개발",
    5: "조선설계",
    6: "해양설계",
    7: "PM",
    8: "구매",
    9: "경영지원",
    10: "안전",
  };

  const persistAuth = (userFromServer) => {
    const u = userFromServer || {};

    const role = String(u.role || "").toLowerCase(); // "employee" | "admin" | "manager"
    const deptId =
      typeof u.department_id === "number"
        ? u.department_id
        : typeof u.department === "number"
        ? u.department
        : null;

    const deptName =
      u.department_name ||
      (Number.isInteger(deptId) ? DEPT_LABEL_BY_NUM[deptId] : null) ||
      null;

    const authPayload = {
      role: u.role, 
      username: u.username ?? u.employeeId ?? username, 
      department: deptId ?? u.department ?? null, 
      department_id: deptId ?? null,
      department_name: deptName,
    };

    localStorage.setItem("auth_user", JSON.stringify(authPayload));

    if (role === "employee") {
      if (deptName) localStorage.setItem("selected_dept", deptName);
    } else {
      localStorage.removeItem("selected_dept");
    }

    window.dispatchEvent(new CustomEvent("auth:changed"));
  };

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
        persistAuth(data.user);

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
                {tab === "signin" ? (
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
