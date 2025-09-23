import styles from "../../../styles/Board.module.css";
import { useState } from "react";

function BoardWrite({ onClose, onSubmit }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3>새 제안 작성</h3>
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
