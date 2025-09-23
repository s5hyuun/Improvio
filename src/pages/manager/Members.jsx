import React, { useEffect, useMemo, useState } from "react";
import styles from "../../styles/Members.module.css";

const API = import.meta.env.VITE_API_BASE ?? "http://localhost:5174";

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
        const res = await fetch(`${API}/members`, { credentials: "include" });
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

  const filtered = useMemo(() => {
    if (!selectedDeptId || selectedDeptId === "all") return members;
    return members.filter((m) => m.deptId === selectedDeptId);
  }, [members, selectedDeptId]);

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
            <div key={m.id} className={styles.tableRow}>
              <div className={styles.nameCell}>{m.name}</div>
              <div className={styles.deptCell}>{m.deptName ?? m.deptId}</div>
              <div className={styles.dateCell}>
                {formatDate(m.hiredAt)}
              </div>
              <div className={styles.statusCell}>
                <span
                  className={
                    m.active ? styles.badgeActive : styles.badgeInactive
                  }
                >
                  {m.active ? "활성" : "비활성"}
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
    if (Number.isNaN(d.getTime())) return s;
    const yyyy = d.getFullYear();
    const mm = `${d.getMonth() + 1}`.padStart(2, "0");
    const dd = `${d.getDate()}`.padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  } catch {
    return s;
  }
}
