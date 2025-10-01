import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "../../../styles/Community.module.css";
import { useLocation } from "react-router-dom";

const MAX_IMAGES = 10;

function PostWrite({ onSubmit, onCancel }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [userId, setUserId] = useState(null);

  const fileInputRef = useRef(null);
  const dialogRef = useRef(null);
  const location = useLocation();

  const boardId = useMemo(() => {
    const parts = location.pathname.split("/");
    return parseInt(parts[parts.length - 1], 10);
  }, [location.pathname]);

  useEffect(() => {
    const authUser = JSON.parse(localStorage.getItem("auth_user"));
    if (authUser?.user_id) setUserId(authUser.user_id);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onCancel?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const handleOverlayClick = (e) => {
    if (dialogRef.current && !dialogRef.current.contains(e.target)) {
      onCancel?.();
    }
  };

  const addFiles = (fileList) => {
    const incoming = Array.from(fileList || []).filter((f) =>
      f.type.startsWith("image/")
    );
    const existsKey = new Set(images.map((f) => `${f.name}-${f.size}`));
    const deduped = incoming.filter(
      (f) => !existsKey.has(`${f.name}-${f.size}`)
    );
    const room = Math.max(0, MAX_IMAGES - images.length);
    const next = images.concat(deduped.slice(0, room));
    if (images.length + deduped.length > MAX_IMAGES) {
      alert(`이미지는 최대 ${MAX_IMAGES}장까지 업로드할 수 있습니다.`);
    }
    setImages(next);
  };

  const handleFilePick = (e) => addFiles(e.target.files);

  const onDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };
  const onDragLeave = () => setDragOver(false);
  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("board_id", boardId);
      formData.append("user_id", userId);
      formData.append("title", title.trim());
      formData.append("content", content.trim());
      formData.append("department_id", boardId);
      images.forEach((img) => formData.append("images", img));

      const res = await fetch("http://localhost:5000/api/posts", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        alert("글이 등록되었습니다!");
        setTitle("");
        setContent("");
        setImages([]);
        onSubmit?.(data); // ✅ 부모에게 등록 완료 알림
        onCancel?.(); // ✅ 모달 닫기

        window.location.reload();
      } else {
        alert("등록 실패: " + data.error);
      }
    } catch (err) {
      console.error("❌ Submit Error:", err);
      alert("서버 오류가 발생했습니다.");
    }
  };

  const imageCountText = useMemo(
    () => `이미지 업로드 (최대 ${MAX_IMAGES}장)`,
    []
  );

  return (
    <div
      className={styles.modalOverlay}
      onMouseDown={handleOverlayClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby="postwrite-title"
    >
      <div
        className={styles.modal}
        onMouseDown={(e) => e.stopPropagation()}
        ref={dialogRef}
      >
        <div className={styles.modalHeader}>
          <h2 id="postwrite-title" className={styles.modalTitle}>
            글쓰기
          </h2>
          <button
            type="button"
            className={styles.modalCloseBtn}
            aria-label="닫기"
            onClick={onCancel}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formRow}>
            <label className={styles.formLabel}>
              제목 <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              placeholder="제목을 입력해주세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.formRow}>
            <label className={styles.formLabel}>
              내용 <span className={styles.required}>*</span>
            </label>
            <textarea
              placeholder="내용을 입력해주세요..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={styles.textarea}
              rows={8}
            />
          </div>

          <div className={styles.formRow}>
            <label className={styles.formLabel}>첨부 이미지</label>
            <div
              className={[
                styles.dropzone,
                dragOver ? styles.dropzoneActive : "",
              ].join(" ")}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFilePick}
                hidden
              />
              <div className={styles.dropzoneInner}>
                <div className={styles.uploadIcon}>📤</div>
                <div className={styles.uploadText}>{imageCountText}</div>
              </div>
            </div>

            {images.length > 0 && (
              <div className={styles.thumbGrid}>
                {images.map((file, idx) => {
                  const url = URL.createObjectURL(file);
                  return (
                    <div
                      className={styles.thumbItem}
                      key={`${file.name}-${idx}`}
                    >
                      <img
                        src={url}
                        alt={file.name}
                        className={styles.thumbImg}
                        onLoad={() => URL.revokeObjectURL(url)}
                      />
                      <button
                        type="button"
                        className={styles.thumbRemove}
                        onClick={() => removeImage(idx)}
                        aria-label="이미지 제거"
                        title="제거"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className={styles.modalFooter}>
            <button type="submit" className={styles.submitBtnPrimary}>
              등록하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PostWrite;
