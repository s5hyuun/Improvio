import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logo from "../assets/logo.png";

const STORAGE_DEPT_KEY = "selected_dept";
const AUTH_KEY = "auth_user";

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

export default function Sidebar() {
  const { t } = useTranslation();

  const departments = [
    { id: "rd", label: t("sidebar.departments.rd"), icon: "bulb" },
    {
      id: "globalSales",
      label: t("sidebar.departments.globalSales"),
      icon: "globe",
    },
    {
      id: "basicDesign",
      label: t("sidebar.departments.basicDesign"),
      icon: "doc",
    },
    {
      id: "futureBiz",
      label: t("sidebar.departments.futureBiz"),
      icon: "flag",
    },
    {
      id: "shipDesign",
      label: t("sidebar.departments.shipDesign"),
      icon: "triangle",
    },
    {
      id: "marineDesign",
      label: t("sidebar.departments.marineDesign"),
      icon: "sea",
    },
    { id: "pm", label: t("sidebar.departments.pm"), icon: "user" },
    { id: "purchase", label: t("sidebar.departments.purchase"), icon: "list" },
    { id: "ops", label: t("sidebar.departments.ops"), icon: "monitor" },
    { id: "safety", label: t("sidebar.departments.safety"), icon: "shield" },
  ];

  const location = useLocation();
  const isCommunity = location.pathname.startsWith("/community");
  const isAuthPage = /\/login|\/signup/i.test(location.pathname);

  const readAuth = () => {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const [auth, setAuth] = useState(readAuth);
  useEffect(() => {
    const onAuthChanged = () => setAuth(readAuth());
    window.addEventListener("auth:changed", onAuthChanged);
    window.addEventListener("storage", onAuthChanged);
    return () => {
      window.removeEventListener("auth:changed", onAuthChanged);
      window.removeEventListener("storage", onAuthChanged);
    };
  }, []);

  const role = String(auth?.role || "").toLowerCase();
  const isAdmin = role === "admin" || role === "manager";

  const isLoggedIn = !!auth;
  const showAnonProfile = !isLoggedIn || isAuthPage;

  const displayName = showAnonProfile
    ? t("sidebar.loginPrompt")
    : auth?.username || t("sidebar.username");
  const deptLabelFromAuth =
    auth?.department_name ??
    (Number.isInteger(auth?.department_id)
      ? DEPT_LABEL_BY_NUM[auth.department_id]
      : null);
  const deptLabelFromLocal = localStorage.getItem(STORAGE_DEPT_KEY) || null;
  const profileDeptLabel =
    deptLabelFromAuth || deptLabelFromLocal || t("sidebar.noDept");

  const [selected, setSelected] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_DEPT_KEY);
      const found = departments.find((d) => d.label === saved);
      return found ? found.id : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (isAuthPage) return;
    try {
      if (selected) {
        const current = departments.find((d) => d.id === selected);
        const label = current?.label ?? "";
        localStorage.setItem(STORAGE_DEPT_KEY, label);
        window.dispatchEvent(
          new CustomEvent("dept:changed", { detail: { dept: label } })
        );
      } else {
        localStorage.removeItem(STORAGE_DEPT_KEY);
        window.dispatchEvent(
          new CustomEvent("dept:changed", { detail: { dept: "" } })
        );
      }
    } catch {}
  }, [selected, isAuthPage, departments]);

  // Requirements 클릭 시 부서 초기화
  const onClickRequirements = () => {
    try {
      localStorage.removeItem(STORAGE_DEPT_KEY);
    } catch {}
    setSelected(null);
    window.dispatchEvent(
      new CustomEvent("dept:changed", { detail: { dept: "" } })
    );
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-inner">
        <div className="logo-wrap">
          <img src={logo} alt="Company Logo" className="logo-img" />
        </div>

        <section className="profile">
          <div className="profile-name">{displayName}</div>

          {!showAnonProfile && (
            <>
              <button className="link-btn" type="button">
                {t("sidebar.edit")}
              </button>
              <div className="chip-row">
                <span className="chip chip-primary">{profileDeptLabel}</span>
                {isAdmin && (
                  <span className="chip chip-warn">{t("sidebar.admin")}</span>
                )}
              </div>
            </>
          )}
        </section>

        {!isAuthPage && (
          <nav className="nav">
            <NavLink
              to="/main"
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <span className="ico">{icon("bars")}</span>
              <span>{t("sidebar.mainChart")}</span>
            </NavLink>

            <NavLink
              to="/board"
              onClick={onClickRequirements}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <span className="ico">{icon("doc")}</span>
              <span>{t("sidebar.requirements")}</span>
            </NavLink>

            <NavLink
              to="/community"
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <span className="ico">{icon("chat")}</span>
              <span>{t("sidebar.community")}</span>
            </NavLink>

            {isAdmin && (
              <NavLink
                to="/manager"
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active" : ""}`
                }
              >
                <span className="ico">{icon("shield")}</span>
                <span>{t("sidebar.manager")}</span>
              </NavLink>
            )}
          </nav>
        )}

        {!isAuthPage && !isCommunity && (
          <>
            <div className="section-title">{t("sidebar.deptTitle")}</div>
            <div className="dept-wrap">
              <ul className="dept-list">
                {/* 전체 보기 옵션 */}
                <li
                  className={`dept-item ${selected === null ? "selected" : ""}`}
                  onClick={() => setSelected(null)}
                  title={t("sidebar.viewAll")}
                >
                  <span className="ico">{icon("globe")}</span>
                  <span>{t("sidebar.all")}</span>
                </li>

                {departments.map((d) => (
                  <li
                    key={d.id}
                    className={`dept-item ${
                      selected === d.id ? "selected" : ""
                    }`}
                    onClick={() => setSelected(d.id)}
                  >
                    <span className="ico">{icon(d.icon)}</span>
                    <span>{d.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

// 아이콘 함수는 동일하게 유지
function icon(name) {
  switch (name) {
    case "bars":
      return (
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path
            d="M3 21h18M7 10v8M12 5v13M17 13v5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "doc":
      return (
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path
            d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M14 3v6h6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      );
    case "chat":
      return (
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path
            d="M21 12a8 8 0 0 1-8 8H7l-4 3 1-5A8 8 0 1 1 21 12z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "shield":
      return (
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path
            d="M12 3l7 3v6c0 5-3.5 9-7 9s-7-4-7-9V6l7-3z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      );
    case "bulb":
      return (
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path
            d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "globe":
      return (
        <svg viewBox="0 0 24 24" width="20" height="20">
          <circle
            cx="12"
            cy="12"
            r="9"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M2 12h20M12 2a15 15 0 0 1 0 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      );
    case "flag":
      return (
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path
            d="M12 2v6l5 3-5 3v8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      );
    case "triangle":
      return (
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path
            d="M3 18l9-12 9 12H3z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      );
    case "sea":
      return (
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path
            d="M2 18s4-6 10-6 10 6 10 6-4 4-10 4-10-4-10-4zm10-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      );
    case "user":
      return (
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path
            d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM3 22c0-5 4-8 9-8s9 3 9 8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      );
    case "list":
      return (
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path
            d="M3 6h18M3 12h18M3 18h18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      );
    case "monitor":
      return (
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path
            d="M4 4h16v12H4z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path d="M8 20h8" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    default:
      return null;
  }
}
