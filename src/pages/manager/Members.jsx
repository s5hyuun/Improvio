import React, { useEffect, useMemo, useState } from "react";
import styles from "../../styles/Members.module.css";

<<<<<<< HEAD
export default function Member({ selectedDeptId: initialDept = "all" }) {
  const [members, setMembers] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState(initialDept);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(new Set());

  const API_BASE = "http://localhost:5000";

  const deptMap = {
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
=======
export default function Member({ selectedDeptId = "all" }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
>>>>>>> bae11b3d28ac03bbdabe76c6f3f4f44369b0e781

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
<<<<<<< HEAD
        const res = await fetch(`${API_BASE}/api/members`);
=======
        const res = await fetch("http://localhost:5000/api/members", {});
>>>>>>> bae11b3d28ac03bbdabe76c6f3f4f44369b0e781
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

<<<<<<< HEAD
  useEffect(() => {
    const handler = (e) => {
      setSelectedDeptId(e.detail.id);
    };
    window.addEventListener("dept:changed", handler);
    return () => window.removeEventListener("dept:changed", handler);
  }, []);

  const filtered = useMemo(() => {
    let result = members;
    if (selectedDeptId && selectedDeptId !== "all") {
      const label = deptMap[selectedDeptId];
      result = members.filter((m) => m.department_name === label);
    }
    return result.sort((a, b) => a.user_name.localeCompare(b.user_name, "ko"));
  }, [members, selectedDeptId]);

  const toggleStatus = async (m) => {
    const id = m.user_id;
    const prev = m.status;
    const next = prev === "활성" ? "비활성" : "활성";

    setMembers((prevList) =>
      prevList.map((x) => (x.user_id === id ? { ...x, status: next } : x))
    );
    setSaving((s) => new Set(s).add(id));

    try {
      const res = await fetch(`${API_BASE}/api/members/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (e) {
      setMembers((prevList) =>
        prevList.map((x) => (x.user_id === id ? { ...x, status: prev } : x))
      );
      console.error(e);
      setErr("상태 변경에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSaving((s) => {
        const ns = new Set(s);
        ns.delete(id);
        return ns;
      });
    }
  };

=======
  const filtered = useMemo(() => {
    if (!selectedDeptId || selectedDeptId === "all") return members;
    return members.filter((m) => m.department_id === selectedDeptId);
  }, [members, selectedDeptId]);

>>>>>>> bae11b3d28ac03bbdabe76c6f3f4f44369b0e781
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
<<<<<<< HEAD
        {!!err && !loading && <div className={styles.empty}>{err}</div>}
=======
>>>>>>> bae11b3d28ac03bbdabe76c6f3f4f44369b0e781

        {!loading && !err && filtered.length === 0 && (
          <div className={styles.empty}>
            선택된 조건에 해당하는 직원이 없습니다.
          </div>
        )}

        {!loading &&
          !err &&
<<<<<<< HEAD
          filtered.map((m) => {
            const isActive = m.status === "활성";
            const isSaving = saving.has(m.user_id);
            return (
              <div key={m.user_id} className={styles.tableRow}>
                <div className={styles.nameCell}>{m.user_name}</div>
                <div className={styles.deptCell}>
                  {m.department_name ?? m.department_id}
                </div>
                <div className={styles.dateCell}>{formatDate(m.join_date)}</div>
                <div className={styles.statusCell}>
                  <button
                    type="button"
                    className={`${styles.statusBtn} ${
                      isActive ? styles.badgeActive : styles.badgeInactive
                    } ${isSaving ? styles.badgeLoading : ""}`}
                    onClick={() => toggleStatus(m)}
                    disabled={isSaving}
                    aria-pressed={isActive}
                    aria-label={`${m.user_name} 상태를 ${
                      isActive ? "비활성" : "활성"
                    }으로 변경`}
                    title={isSaving ? "저장 중…" : "클릭하여 상태 변경"}
                  >
                    {isSaving ? "저장 중…" : m.status}
                  </button>
                </div>
              </div>
            );
          })}
=======
          filtered.map((m) => (
            <div key={m.user_id} className={styles.tableRow}>
              <div className={styles.nameCell}>{m.user_name}</div>
              <div className={styles.deptCell}>
                {m.department_name ?? m.department_id}
              </div>
              <div className={styles.dateCell}>{formatDate(m.join_date)}</div>
              <div className={styles.statusCell}>
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
>>>>>>> bae11b3d28ac03bbdabe76c6f3f4f44369b0e781
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
