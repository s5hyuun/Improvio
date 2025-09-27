import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

const STORAGE_DEPT_KEY = "selected_dept";
const AUTH_KEY = "auth_user";

const DEPARTMENTS = [
  { id: "rd", label: "R&D", icon: "bulb" },
  { id: "globalSales", label: "해외영업", icon: "globe" },
  { id: "basicDesign", label: "기본설계", icon: "doc" },
  { id: "futureBiz", label: "미래사업개발", icon: "flag" },
  { id: "shipDesign", label: "조선설계", icon: "triangle" },
  { id: "marineDesign", label: "해양설계", icon: "sea" },
  { id: "pm", label: "PM", icon: "user" },
  { id: "purchase", label: "구매", icon: "list" },
  { id: "ops", label: "경영지원", icon: "monitor" },
  { id: "safety", label: "안전", icon: "shield" },
];

function loadUser() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    role: localStorage.getItem("user_role") || "admin",
    username: localStorage.getItem("username") || "username",
    deptId: localStorage.getItem("user_dept") || null,
  };
}

function deptById(id) {
  return DEPARTMENTS.find((d) => d.id === id) || null;
}

export default function Sidebar({ selected, onSelectDept }) {
  const location = useLocation();
  const isCommunity = location.pathname.startsWith("/community");

  const user = useMemo(loadUser, []);
  const isEmployee = String(user.role).toLowerCase() === "employee";

  const [internalSelected, setInternalSelected] = useState(() => {
    try {
      if (typeof selected !== "undefined")
        return selected === "all" ? null : selected;
      const saved = localStorage.getItem(STORAGE_DEPT_KEY);
      if (saved && deptById(saved)) return saved;
      if (isEmployee && user.deptId && deptById(user.deptId))
        return user.deptId;
      return null;
    } catch {
      return isEmployee && user.deptId ? user.deptId : null;
    }
  });

  const isControlled = typeof selected !== "undefined";
  const currentSelected = isControlled
    ? selected === "all"
      ? null
      : selected
    : internalSelected;

  useEffect(() => {
    const curLabel = deptById(currentSelected)?.label ?? "";
    try {
      if (currentSelected)
        localStorage.setItem(STORAGE_DEPT_KEY, currentSelected);
      else localStorage.removeItem(STORAGE_DEPT_KEY);

      window.dispatchEvent(
        new CustomEvent("dept:changed", {
          detail: { id: currentSelected ?? "all", dept: curLabel },
        })
      );
    } catch {}
  }, [currentSelected]);

  const handleSelect = (id) => {
    if (isControlled && onSelectDept) onSelectDept(id);
    else setInternalSelected(id);
  };

  const myDept = deptById(
    isEmployee ? user.deptId || currentSelected : currentSelected
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-inner">
        <div
          className="logo-wrap"
          onClick={() => window.location.reload()}
          style={{ cursor: "pointer" }}
        >
          <img
            src="src/assets/logo.png"
            alt="Company Logo"
            className="logo-img"
          />
        </div>

        <section className="profile">
          <div className="profile-name">{user.username}</div>

          {!isEmployee && (
            <button
              className="profile-edit-btn"
              onClick={() => (window.location.href = "/profile/edit")}
              style={{
                marginTop: "4px",
                padding: "4px 8px",
                fontSize: "12px",
                borderRadius: "6px",
                border: "none",
                background: "#eff6ff",
                color: "#1d4ed8",
                cursor: "pointer",
              }}
            >
              Edit
            </button>
          )}

          <div className="chip-row">
            <span className="chip chip-primary">
              {myDept ? myDept.label : "부서 미지정"}
            </span>
            {!isEmployee && <span className="chip chip-warn">관리자</span>}
          </div>
        </section>

        <nav className="nav">
          <NavLink className="nav-item" to="/" end>
            Main Chart
          </NavLink>
          <NavLink className="nav-item" to="/requirements">
            Requirements
          </NavLink>
          <NavLink className="nav-item" to="/community">
            Community
          </NavLink>
        </nav>

        {!isCommunity && (
          <>
            <div className="section-title">부서 선택</div>
            <ul className="dept-list">
              {DEPARTMENTS.map((d) => (
                <li
                  key={d.id}
                  className={`dept-item ${
                    currentSelected === d.id ? "selected" : ""
                  }`}
                  onClick={() => handleSelect(d.id)}
                >
                  {d.label}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </aside>
  );
}