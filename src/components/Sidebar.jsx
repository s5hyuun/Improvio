import { useState } from "react";

export default function Sidebar() {
  const departments = [
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

  const [selected, setSelected] = useState("rd");

  return (
    <aside className="sidebar">
      <div className="sidebar-inner">
        <div className="logo-wrap">
          <img src="src/assets/logo.png" alt="Company Logo" className="logo-img" />
        </div>

        <section className="profile">
          <div className="profile-name">username</div>
          <button className="link-btn" type="button">
            edit
          </button>
          <div className="chip-row">
            <span className="chip chip-primary">R&amp;D</span>
            <span className="chip chip-warn">관리자</span>
          </div>
        </section>

        <nav className="nav">
          <a className="nav-item" href="#">
            <span className="ico">{icon("bars")}</span>
            <span>Main Chart</span>
          </a>
          <a className="nav-item" href="#">
            <span className="ico">{icon("doc")}</span>
            <span>Requirements</span>
          </a>
          <a className="nav-item" href="#">
            <span className="ico">{icon("chat")}</span>
            <span>Community</span>
          </a>
        </nav>

        <div className="section-title">부서 선택</div>

        <div className="dept-wrap">
          <ul className="dept-list">
            {departments.map((d) => (
              <li
                key={d.id}
                className={`dept-item ${selected === d.id ? "selected" : ""}`}
                onClick={() => setSelected(d.id)}
              >
                <span className="ico">{icon(d.icon)}</span>
                <span>{d.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}

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
          <path d="M14 3v6h6" fill="none" stroke="currentColor" strokeWidth="2" />
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
