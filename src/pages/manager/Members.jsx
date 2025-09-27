import React, { useEffect, useMemo, useState } from "react";
import styles from "../../styles/Members.module.css";

const DEPT_MAP = {
  rd: "R&D",
  globalSales: "해외영업",
  basicDesign: "기본설계",
  futureBiz: "미래사업개발",
  shipDesign: "조선설계",
  marineDesign: "해양설계",
  pm: "PM",
  purchase: "구매",
  ops: "경영지원",
  safety: "안전",
};

export default function Members() {
  const [members, setMembers] = useState([]);
  const [selectedDept, setSelectedDept] = useState("all");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const handler = (e) => setSelectedDept(e.detail.id || "all");
    window.addEventListener("dept:changed", handler);
    return () => window.removeEventListener("dept:changed", handler);
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:5000/api/members");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (alive) setMembers(Array.isArray(data) ? data : []);
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

  const toggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === "활성" ? "비활성" : "활성";
    try {
      const res = await fetch(
        `http://localhost:5000/api/members/${userId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setMembers((prev) =>
        prev.map((m) =>
          m.user_id === userId ? { ...m, status: newStatus } : m
        )
      );
    } catch (e) {
      console.error("상태 업데이트 실패:", e);
      alert("상태 변경 중 오류가 발생했습니다.");
    }
  };

  const filtered = useMemo(() => {
    if (selectedDept === "all") return members;
    const targetDept = DEPT_MAP[selectedDept];
    return members.filter((m) => m.department_name === targetDept);
  }, [members, selectedDept]);

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
              <div
                className={styles.statusCell}
                onClick={() => toggleStatus(m.user_id, m.status)}
                style={{ cursor: "pointer" }}
                title="클릭하여 상태 변경"
              >
                <span
                  className={
                    m.status === "활성"
                      ? styles.badgeActive
                      : styles.badgeInactive
                  }
                >
                  {m.status}
                </span>
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
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;
  } catch {
    return s;
  }
}