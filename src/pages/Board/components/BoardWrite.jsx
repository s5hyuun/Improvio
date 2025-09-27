import styles from "../../../styles/Board.module.css";
import { useState, useEffect, useRef } from "react";

function BoardWrite({ onClose, onSubmit }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [expect, setExpect] = useState("");

  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const addFiles = (fileList) => {
    const picked = Array.from(fileList || []);
    setFiles((prev) => [...prev, ...picked]);
  };
  const handleFileChange = (e) => {
    addFiles(e.target.files);
    e.target.value = "";
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };
  const handleDragLeave = () => setDragOver(false);
  const removeFile = (index) =>
    setFiles((prev) => prev.filter((_, i) => i !== index));

  const submit = () => {
    const fd = new FormData();
    fd.append("title", title);
    fd.append("description", description);
    fd.append("expected_effect", expect);
    files.forEach((f) => fd.append("files", f));
    onSubmit(fd);
  };

  return (
    <div
      className={styles.overlay}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className={styles.modal}>
        {/* 상단 */}
        <div className={styles.writeTop}>
          <div>
            <h3>새 제안 작성</h3>
            <div className={styles.writeTopIcons}>
              <div>
                <i className="fa-regular fa-user"></i>익명101
              </div>
              <div>
                <i className="fa-regular fa-building"></i>부서자리
              </div>
              <div>
                <i className="fa-regular fa-calendar"></i>2025-09-25
              </div>
            </div>
          </div>
          <button onClick={onClose}>❌</button>
        </div>

        {/* ✅ 가운데 스크롤 본문 */}
        <div className={styles.writeBody}>
          <div className={styles.writeTitle}>
            <div>개선 제안 제목</div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="문제를 한 줄로 요약해주세요."
            />
          </div>

          <div className={styles.writeContent}>
            <div>개선 제안 상세</div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
            />
          </div>

          <div className={styles.writeContent}>
            <div>기대효과</div>
            <textarea
              value={expect}
              onChange={(e) => setExpect(e.target.value)}
              rows={5}
            />
          </div>

          <div className={styles.writeContent}>
            <div>첨부파일</div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileChange}
              className={styles.hiddenFileInput}
            />

            <div
              className={`${styles.dropzone} ${
                dragOver ? styles.dropzoneActive : ""
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              role="button"
              tabIndex={0}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") &&
                fileInputRef.current?.click()
              }
            >
              <p>
                여기에 파일을 드래그하거나 클릭해서 선택하세요.
                <span>(최대 3개)</span>
              </p>
            </div>

            {files.length > 0 && (
              <ul className={styles.fileList}>
                {files.map((f, i) => (
                  <li key={i} className={styles.fileItem}>
                    <span>{f.name}</span>
                    <small>({(f.size / 1024).toFixed(1)} KB)</small>
                    <button type="button" onClick={() => removeFile(i)}>
                      제거
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ✅ 하단 고정 버튼 (그리드 3행) */}
        <div className={styles.writeSubmit}>
          <button onClick={submit} disabled={!title || !description || !expect}>
            등록
          </button>
        </div>
      </div>
    </div>
  );
}

export default BoardWrite;
