import styles from "../../../styles/Board.module.css";
import { useState, useEffect } from "react";

function BoardWrite({ onClose, onSubmit }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  //   esc 눌러도 닫히게 .....
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);
  return (
    <div
      className={styles.overlay}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className={styles.modal}>
        <h3>새 제안 작성</h3>
        <div className={styles.detailTopIcons}>
          <div>
            <i className="fa-regular fa-user"></i>
            익명101
          </div>
          <div>
            <i className="fa-regular fa-calendar"></i>
            2025-09-25
          </div>
          <div>
            <i className="fa-regular fa-building"></i>
            부서자리
          </div>
        </div>
        <div className={styles.formRow}>
          <label>제목</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className={styles.formRow}>
          <label>내용</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className={styles.modalActions}>
          <button onClick={onClose}>취소</button>
          <button
            onClick={() => onSubmit({ title, description })}
            disabled={!title || !description}
          >
            등록
          </button>
        </div>
      </div>
    </div>
  );
}

export default BoardWrite;
