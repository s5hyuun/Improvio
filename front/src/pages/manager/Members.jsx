// Members.jsx
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

  const toggleStatus = async (userId) => {
    // 낙관적 업데이트
    let nextStatus = null;
    setMembers((prev) =>
      prev.map((m) => {
        if (m.user_id !== userId) return m;
        const toggled = m.status === "활성" ? "비활성" : "활성";
        nextStatus = toggled;
        return { ...m, status: toggled };
      })
    );

    try {
      await fetch(`http://localhost:5000/api/members/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
    } catch (e) {
      console.error("상태 업데이트 실패:", e);
    }
  };

  return (
    // 페이지 루트: 부모가 flex여도 내부 스크롤이 가능하도록 보장
    <div
      className={styles.wrap}
      style={{
        display: "flex",
        flexDirection: "column",
        flex: "1 1 auto",
        minHeight: 0, // ★ 중요: 자식 스크롤 영역이 높이를 계산할 수 있도록
      }}
    >
      {/* 스크롤 영역 */}
      <div
        role="region"
        aria-label="직원 목록"
        tabIndex={0}
        className={styles.card}
        style={{
          display: "flex",
          flexDirection: "column",
          flex: "1 1 auto",
          minHeight: 0,             // ★ 중요
          overflowY: "auto",        // ★ 중요
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div className={styles.tableHead}>
          <div>직원명</div>
          <div>부서</div>
          <div>입사일</div>
          <div className={styles.colStatus}>상태</div>
        </div>

        {loading && <div className={styles.empty}>불러오는 중…</div>}

        {!loading && err && (
          <div className={styles.empty}>{err}</div>
        )}

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

function formatDate(s) {
  if (!s) return "-";
  try {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return s;
    const yyyy = d.getFullYear();
    const mm = `${d.getMonth() + 1}`.padStart(2, "0");
    const dd = `${d.getDate()}`.padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  } catch {
    return s;
  }
}
