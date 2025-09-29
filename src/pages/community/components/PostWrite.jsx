import React, { useState } from "react";
import styles from "../../../styles/Community.module.css";

function PostWrite({ onSubmit, onCancel }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }
    onSubmit?.({ title, content });
    setTitle("");
    setContent("");
  };

  return (
    <div className={styles.writeContainer}>
      <h2>글쓰기</h2>
      <form onSubmit={handleSubmit} className={styles.writeForm}>
        <input
          type="text"
          placeholder="제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={styles.titleInput}
        />
        <textarea
          placeholder="내용을 입력하세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={styles.contentInput}
        />
        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.submitBtn}>
            등록
          </button>
          <button type="button" onClick={onCancel} className={styles.cancelBtn}>
            취소
          </button>
        </div>
      </form>
    </div>
  );
}

export default PostWrite;
