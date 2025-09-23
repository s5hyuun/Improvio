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
        <div className={styles.writeTop}>
          <div>
            <h3>새 제안 작성</h3>
            <div className={styles.writeTopIcons}>
              <div>
                <i className="fa-regular fa-user"></i>
                익명101
              </div>
              <div>
                <i className="fa-regular fa-building"></i>
                부서자리
              </div>
              <div>
                <i className="fa-regular fa-calendar"></i>
                2025-09-25
              </div>
            </div>
          </div>
          <button onClick={onClose}>❌</button>
        </div>
        <div className={styles.writeTitle}>
          <div>개선 제안 제목</div>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className={styles.writeContent}>
          <div>개선 제안 상세</div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className={styles.writeSubmit}>
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
