// Notice.jsx
import React, { useEffect, useMemo, useState } from "react";
import styles from "../../styles/Notice.module.css";

const STORAGE_KEY = "notices_v1";

function loadNotices() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function saveNotices(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list ?? []));
  } catch {}
}
function broadcast(list) {
  saveNotices(list);
  const activeCount = (list || []).filter((n) => n.active).length;
  window.dispatchEvent(
    new CustomEvent("notice:changed", { detail: { list, activeCount } })
  );
}

export default function Notice() {
  const [list, setList] = useState([]);

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [urgent, setUrgent] = useState(false);

  useEffect(() => {
    const cached = loadNotices();
    if (cached && cached.length) {
      setList(cached);
      broadcast(cached);
    } else {
      const seed = [
        {
          id: 1,
          title: "긴급: 생산라인 자동화 제안 검토 필요",
          body: "높은 우선순위를 가진 생산라인 자동화 제안이 제출되었습니다. 관련 부서의 빠른 검토가 필요합니다.",
          urgent: true,
          active: true,
          created_at: "2024-01-15",
        },
        {
          id: 2,
          title: "월간 안전교육 일정 안내",
          body: "이번 달 안전교육 일정을 안내드립니다. 모든 직원은 반드시 참석해주시기 바랍니다.",
          urgent: false,
          active: true,
          created_at: "2024-01-10",
        },
      ];
      setList(seed);
      broadcast(seed);
    }
  }, []);

  const view = useMemo(() => {
    return list
      .slice()
      .sort((a, b) => (a.urgent === b.urgent ? 0 : a.urgent ? -1 : 1))
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }, [list]);

  const openCreate = () => {
    setEditId(null);
    setTitle("");
    setBody("");
    setUrgent(false);
    setOpen(true);
  };

  const openEdit = (n) => {
    setEditId(n.id);
    setTitle(n.title);
    setBody(n.body);
    setUrgent(!!n.urgent);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setEditId(null);
  };

  const submit = (e) => {
    e.preventDefault();
    const t = title.trim();
    const b = body.trim();
    if (!t) return;

    if (editId !== null) {
      const next = list.map((n) =>
        n.id === editId ? { ...n, title: t, body: b, urgent } : n
      );
      setList(next);
      broadcast(next);
      closeModal();
    } else {
      const now = new Date();
      const item = {
        id: Date.now(),
        title: t,
        body: b,
        urgent,
        active: true,
        created_at: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(now.getDate()).padStart(2, "0")}`,
      };
      const next = [item, ...list];
      setList(next);
      broadcast(next);
      closeModal();
    }
  };

  const toggleActive = (id) => {
    const next = list.map((n) =>
      n.id === id ? { ...n, active: !n.active } : n
    );
    setList(next);
    broadcast(next);
  };

  // ✅ 공지 삭제 (편집 모달에서 사용)
  const deleteNotice = () => {
    if (editId === null) return;
    // 확인 다이얼로그(원치 않으시면 제거해도 됩니다)
    const next = list.filter((n) => n.id !== editId);
    setList(next);
    broadcast(next); // 헤더/대시보드와 동기화
    closeModal();
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <button type="button" className={styles.writeBtn} onClick={openCreate}>
          공지 작성
        </button>
      </div>

      <div className={styles.list}>
        {view.length === 0 ? (
          <div className={styles.empty}>등록된 공지가 없습니다.</div>
        ) : (
          view.map((n) => (
            <article key={n.id} className={styles.card}>
              <div className={styles.cardTop}>
                <div className={styles.titleRow}>
                  <strong className={styles.title}>{n.title}</strong>
                  <div className={styles.chips}>
                    {n.urgent && (
                      <span className={`${styles.chip} ${styles.chipUrgent}`}>
                        긴급
                      </span>
                    )}
                    {n.active ? (
                      <span className={`${styles.chip} ${styles.chipActive}`}>
                        활성
                      </span>
                    ) : (
                      <span className={`${styles.chip} ${styles.chipInactive}`}>
                        중단
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.linkBtn}
                    onClick={() => openEdit(n)}
                  >
                    ✎ 편집
                  </button>

                  <button
                    type="button"
                    className={n.active ? styles.stopBtn : styles.resumeBtn}
                    onClick={() => toggleActive(n.id)}
                    title={n.active ? "게시 중단" : "게시 재개"}
                  >
                    {n.active ? "게시 중단" : "게시 재개"}
                  </button>
                </div>
              </div>

              <p className={styles.body}>{n.body}</p>
              <div className={styles.meta}>{n.created_at}</div>
            </article>
          ))
        )}
      </div>

      {open && (
        <div className={styles.modalBackdrop} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>
              {editId !== null ? "공지 수정" : "공지 작성"}
            </h3>

            <form onSubmit={submit}>
              <label className={styles.label}>
                공지 제목
                <input
                  className={styles.input}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="제목을 입력하세요"
                  autoFocus
                />
              </label>

              <label className={styles.label}>
                공지 내용
                <textarea
                  className={styles.textarea}
                  rows={5}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="내용을 입력하세요"
                />
              </label>

              <label className={styles.checkRow}>
                <input
                  type="checkbox"
                  checked={urgent}
                  onChange={(e) => setUrgent(e.target.checked)}
                />
                <span>긴급 표시</span>
              </label>

              {/* 하단 버튼: 취소 | 삭제 | 저장 */}
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={closeModal}
                >
                  취소
                </button>

                {editId !== null && (
                  <button
                    type="button"
                    onClick={deleteNotice}
                    // 인라인 강조(별도 CSS 수정 없이 사용)
                    style={{
                      margin: "0 8px",
                      padding: "10px 16px",
                      borderRadius: 12,
                      border: "1px solid #fecaca",
                      background: "#fee2e2",
                      color: "#b91c1c",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                    title="공지 삭제"
                  >
                    삭제
                  </button>
                )}

                <button type="submit" className={styles.submitBtn}>
                  {editId !== null ? "저장" : "게시"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
