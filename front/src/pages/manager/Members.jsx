import React, { useEffect, useMemo, useState } from "react";
import styles from "../../styles/Members.module.css";

export default function Member({ selectedDeptId = "all" }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await fetch("http://localhost:5000/api/members");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (alive) {
          // 초기값: 모든 직원 상태를 '활성'으로 설정
          const membersWithStatus = data.map((m) => ({
            ...m,
            status: m.status ?? "활성",
          }));
          setMembers(Array.isArray(membersWithStatus) ? membersWithStatus : []);
        }
      } catch (e) {
        if (alive) setErr("직원 데이터를 불러오는 중 문제가 발생했습니다.");
        console.error(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!selectedDeptId || selectedDeptId === "all") return members;
    return members.filter((m) => m.department_id === selectedDeptId);
  }, [members, selectedDeptId]);

  // 상태 토글 함수
  const toggleStatus = async (userId) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.user_id === userId
          ? { ...m, status: m.status === "활성" ? "비활성" : "활성" }
          : m
      )
    );

    // 서버에도 상태 업데이트
    try {
      const member = members.find((m) => m.user_id === userId);
      const newStatus = member.status === "활성" ? "비활성" : "활성";
      await fetch(`http://localhost:5000/api/members/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (e) {
      console.error("상태 업데이트 실패:", e);
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.tableHead}>
          <div>직원명</div>
          <div>부서</div>
          <div>입사일</div>
          <div className={styles.colStatus}>상태</div>
        </div>

        {loading && <div className={styles.empty}>불러오는 중…</div>}

        {!loading && !err && filtered.length === 0 && (
          <div className={styles.empty}>
            선택된 조건에 해당하는 직원이 없습니다.
          </div>
        )}

        {!loading &&
          !err &&
          filtered.map((m) => (
            <div key={m.user_id} className={styles.tableRow}>
              <div className={styles.nameCell}>{m.user_name}</div>
              <div className={styles.deptCell}>
                {m.department_name ?? m.department_id}
              </div>
              <div className={styles.dateCell}>{formatDate(m.join_date)}</div>
              <div className={styles.statusCell}>
                <button
                  onClick={() => toggleStatus(m.user_id)}
                  style={{
                    cursor: "pointer",
                    border: "none",
                    background:
                      m.status === "활성" ? "rgba(45,108,255,.12)" : "#FFF1F1",
                    color: m.status === "활성" ? "#2d6cff" : "#db3b18",
                    padding: "6px 10px",
                    borderRadius: "999px",
                    fontWeight: 700,
                    fontSize: "12px",
                    
                  }}
                >
                  {m.status}
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

/** 공용 컴포넌트 -------------------------------------------------------------- */
const Chip = ({ label = "활성", tone = "on" }) => (
  <span
    style={{
      display: "inline-block",
      padding: "6px 12px",
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 700,
      background: tone === "on" ? "rgba(0,0,0,.08)" : "rgba(0,0,0,.05)",
      color: tone === "on" ? "#111" : "#6b7280",
    }}
  >
    {label}
  </span>
);

const IconButton = ({ title, onClick, children }) => (
  <button
    title={title}
    onClick={onClick}
    style={{
      width: 36,
      height: 36,
      display: "grid",
      placeItems: "center",
      borderRadius: 10,
      border: "1px solid var(--border, #e5e7eb)",
      background: "white",
      cursor: "pointer",
    }}
  >
    {children}
  </button>
);

/** 더미 데이터 (백엔드 연동 전까지 사용) --------------------------------------- */
const DEPTS = ["모든 부서", "R&D", "해외영업", "안전", "PM", "공정관리"];

const INITIAL_MEMBERS = [
  { id: 1, name: "김현우", dept: "R&D", joined: "2023-01-15", active: true },
  { id: 2, name: "이영희", dept: "해외영업", joined: "2023-02-20", active: true },
  { id: 3, name: "박민수", dept: "안전", joined: "2023-03-10", active: true },
  { id: 4, name: "최정은", dept: "PM", joined: "2023-04-05", active: false },
  { id: 5, name: "장호진", dept: "공정관리", joined: "2023-05-12", active: true },
];

/** 직원 관리 메인 -------------------------------------------------------------- */
export default function Member() {
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("모든 부서");
  const [rows, setRows] = useState(INITIAL_MEMBERS);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const byDept = dept === "모든 부서" ? true : r.dept === dept;
      const byQuery =
        q.trim() === "" ? true : [r.name, r.dept].some((v) => v.includes(q.trim()));
      return byDept && byQuery;
    });
  }, [rows, dept, q]);

  function handleAdd() {
    // 실제로는 모달/폼을 여는 로직으로 대체하십시오.
    const nextId = Math.max(...rows.map((r) => r.id)) + 1;
    const sample = {
      id: nextId,
      name: `새 직원 ${nextId}`,
      dept: "R&D",
      joined: new Date().toISOString().slice(0, 10),
      active: true,
    };
    setRows((p) => [...p, sample]);
  }

  function handleEdit(row) {
    // 편집 모달/페이지로 연결하는 자리입니다.
    alert(`[편집] ${row.name} (부서: ${row.dept})`);
  }

  function handleDelete(row) {
    if (confirm(`정말로 ${row.name} 직원을 삭제하시겠습니까?`)) {
      setRows((p) => p.filter((x) => x.id !== row.id));
    }
  }

  return (
    <div
      style={{
        padding: 24,
        display: "grid",
        gap: 16,
        color: "var(--text, #0b1221)",
      }}
    >
      {/* 상단: 제목 & 탭 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>관리자 페이지</h2>
        <Tabs active="members" />
      </div>

      {/* 검색/필터/추가 */}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <div style={{ fontWeight: 700, color: "var(--text, #0b1221)" }}>직원 목록</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              borderRadius: 12,
              border: "1px solid var(--border, #e5e7eb)",
              background: "white",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="검색"
              style={{
                border: "none",
                outline: "none",
                fontSize: 14,
                width: 200,
                background: "transparent",
              }}
            />
          </div>

          <select
            value={dept}
            onChange={(e) => setDept(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid var(--border, #e5e7eb)",
              background: "white",
              fontWeight: 600,
            }}
          >
            {DEPTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <button
            onClick={handleAdd}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid var(--primary, #2d6cff)",
              background: "var(--primary, #2d6cff)",
              color: "white",
              fontWeight: 700,
            }}
          >
            + 직원 추가
          </button>
        </div>
      </div>

      {/* 표 컨테이너 */}
      <div
        style={{
          borderRadius: 16,
          border: "1px solid var(--border, #e5e7eb)",
          overflow: "hidden",
          background: "white",
        }}
      >
        {/* 헤더 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1.2fr 1.2fr 1fr 1fr",
            padding: "14px 16px",
            fontWeight: 800,
            fontSize: 14,
            background: "var(--panel, #f8fafc)",
            borderBottom: "1px solid var(--border, #e5e7eb)",
          }}
        >
          <div>직원명</div>
          <div>부서</div>
          <div>입사일</div>
          <div>상태</div>
          <div>편집</div>
        </div>

        {/* 로우 */}
        {filtered.map((r, idx) => (
          <div
            key={r.id}
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1.2fr 1.2fr 1fr 1fr",
              padding: "18px 16px",
              alignItems: "center",
              borderBottom:
                idx === filtered.length - 1 ? "none" : "1px solid var(--border, #e5e7eb)",
            }}
          >
            <div style={{ fontWeight: 700 }}>{r.name}</div>
            <div style={{ color: "#4b5563", fontWeight: 600 }}>{r.dept}</div>
            <div style={{ color: "var(--primary, #2d6cff)", fontWeight: 700 }}>{r.joined}</div>
            <div>
              <Chip label={r.active ? "활성" : "비활성"} tone={r.active ? "on" : "off"} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <IconButton title="수정" onClick={() => handleEdit(r)}>
                {/* 연필 아이콘 */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <path d="M14.06 6.19l3.75 3.75" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </IconButton>
              <IconButton title="삭제" onClick={() => handleDelete(r)}>
                {/* 휴지통 아이콘 */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M4 7h16" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M9 7V5h6v2" stroke="currentColor" strokeWidth="1.8" />
                  <path
                    d="M6 7l1 13h10l1-13"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    fill="none"
                  />
                </svg>
              </IconButton>
            </div>
          </div>
        ))}

        {/* 빈 상태 */}
        {filtered.length === 0 && (
          <div style={{ padding: "32px 16px", textAlign: "center", color: "#6b7280" }}>
            조건에 맞는 직원이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
