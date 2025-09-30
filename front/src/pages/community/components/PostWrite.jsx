import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "../../../styles/Community.module.css";
import { useLocation } from "react-router-dom";
const MAX_IMAGES = 10;
// 최상단
const authUser = JSON.parse(localStorage.getItem("auth_user"));
const user_id = authUser?.user_id;

function PostWrite({ onSubmit, onCancel }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [isAnon, setIsAnon] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef(null);
  const dialogRef = useRef(null);
  const location = useLocation();
  const boardId = useMemo(() => {
    const parts = location.pathname.split("/");
    return parseInt(parts[parts.length - 1], 10);
  }, [location.pathname]);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onCancel?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const authUser = JSON.parse(localStorage.getItem("auth_user"));
    if (authUser?.user_id) setUserId(authUser.user_id);
  }, []);

  const handleOverlayClick = (e) => {
    if (dialogRef.current && !dialogRef.current.contains(e.target)) {
      onCancel?.();
    }
  };

  const addFiles = (fileList) => {
    const incoming = Array.from(fileList || []).filter((f) =>
      f.type.startsWith("image/")
    );

    if (incoming.length === 0) return;

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
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("board_id", boardId);
      formData.append("user_id", userId); // 로그인 사용자 ID
      formData.append("title", title.trim());
      formData.append("content", content.trim());
      formData.append("department_id", boardId); // 예시: board_id와 같게 설정
      images.forEach((img) => formData.append("images", img));

      const res = await fetch("http://localhost:5000/api/posts", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        alert("글이 등록되었습니다!");
        window.location.reload();
        setTitle("");
        setContent("");
        setImages([]);
        setIsAnon(false);
        onSubmit?.(data);
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
      className={styles.modalOverlay || ""}
      onMouseDown={handleOverlayClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby="postwrite-title"
    >
      <div
        className={styles.modal || ""}
        onMouseDown={(e) => e.stopPropagation()}
        ref={dialogRef}
      >
        <div className={styles.modalHeader || ""}>
          <h2 id="postwrite-title" className={styles.modalTitle || ""}>
            글쓰기
          </h2>
          <button
            type="button"
            className={styles.modalCloseBtn || ""}
            aria-label="닫기"
            onClick={onCancel}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm || ""}>
          <div className={styles.formRow || ""}>
            <label className={styles.formLabel || ""}>
              제목 <span className={styles.required || ""}>*</span>
            </label>
            <input
              type="text"
              placeholder="제목을 입력해주세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={styles.input || ""}
            />
          </div>

          <div className={styles.formRow || ""}>
            <label className={styles.formLabel || ""}>
              내용 <span className={styles.required || ""}>*</span>
            </label>
            <textarea
              placeholder="내용을 입력해주세요..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={styles.textarea || ""}
              rows={8}
            />
          </div>

          <div className={styles.formRow || ""}>
            <label className={styles.formLabel || ""}>첨부 이미지</label>

            <div
              className={[
                styles.dropzone || "",
                dragOver ? styles.dropzoneActive || "" : "",
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
              <div className={styles.dropzoneInner || ""}>
                <div className={styles.uploadIcon || ""}>📤</div>
                <div className={styles.uploadText || ""}>{imageCountText}</div>
              </div>
            </div>

            {images.length > 0 && (
              <div className={styles.thumbGrid || ""}>
                {images.map((file, idx) => {
                  const url = URL.createObjectURL(file);
                  return (
                    <div
                      className={styles.thumbItem || ""}
                      key={`${file.name}-${idx}`}
                    >
                      <img
                        src={url}
                        alt={file.name}
                        className={styles.thumbImg || ""}
                        onLoad={() => URL.revokeObjectURL(url)}
                      />
                      <button
                        type="button"
                        className={styles.thumbRemove || ""}
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

          <div className={styles.checkboxRow || ""}>
            <label className={styles.checkboxLabel || ""}></label>
          </div>

          <div className={styles.modalFooter || ""}>
            <button type="submit" className={styles.submitBtnPrimary || ""}>
              등록하기
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .${styles.modalOverlay || "overlay-fallback"}{
          position: fixed; inset: 0; background: rgba(0,0,0,.5);
          display: flex; align-items: center; justify-content: center; z-index: 1000;
        }
        .${styles.modal || "modal-fallback"}{
          width: 720px; max-width: calc(100% - 32px); background: #fff; border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,.2); overflow: hidden;
        }
        .${styles.modalHeader || "header-fallback"}{
          display:flex; align-items:center; justify-content:space-between;
          padding:16px 20px; border-bottom:1px solid #eee;
        }
        .${
          styles.modalTitle || "title-fallback"
        }{ font-size:18px; font-weight:700; color:#1f2a44; }
        .${styles.modalCloseBtn || "close-fallback"}{
          border:none; background:transparent; font-size:22px; line-height:1; cursor:pointer; color:#666;
        }
        .${styles.modalForm || "form-fallback"}{ padding:20px; }
        .${styles.formRow || "row-fallback"}{ margin-bottom:16px; }
        .${
          styles.formLabel || "label-fallback"
        }{ display:block; margin-bottom:8px; color:#1f2a44; font-weight:600; }
        .${styles.required || "req-fallback"}{ color:#e11d48; margin-left:2px; }
        .${styles.input || "input-fallback"}{
          width:100%; height:44px; border:1px solid #ececef; border-radius:10px; padding:0 14px; background:#f4f5f7;
        }
        .${styles.textarea || "ta-fallback"}{
          width:100%; border:1px solid #ececef; border-radius:10px; padding:12px 14px; background:#f4f5f7; resize:vertical;
        }
        .${styles.dropzone || "dz-fallback"}{
          border:2px dashed #d6d9e0; border-radius:12px; padding:24px; text-align:center; cursor:pointer;
        }
        .${styles.dropzoneActive || "dz-active-fallback"}{ background:#f8fafc; }
        .${
          styles.dropzoneInner || "dz-inner-fallback"
        }{ display:flex; flex-direction:column; gap:8px; align-items:center; }
        .${styles.uploadIcon || "up-ic-fallback"}{ font-size:20px; }
        .${styles.uploadText || "up-tx-fallback"}{ color:#667085; }
        .${
          styles.thumbGrid || "grid-fallback"
        }{ display:grid; grid-template-columns:repeat(auto-fill, minmax(88px,1fr)); gap:10px; margin-top:12px; }
        .${
          styles.thumbItem || "item-fallback"
        }{ position:relative; border:1px solid #eee; border-radius:10px; overflow:hidden; }
        .${
          styles.thumbImg || "img-fallback"
        }{ width:100%; height:88px; object-fit:cover; display:block; }
        .${styles.thumbRemove || "rm-fallback"}{
          position:absolute; top:4px; right:4px; width:22px; height:22px; border:none; border-radius:50%;
          background:rgba(0,0,0,.6); color:#fff; cursor:pointer; line-height:22px; text-align:center;
        }
        .${styles.checkboxRow || "chkrow-fallback"}{ margin-top:8px; }
        .${
          styles.checkboxLabel || "chklb-fallback"
        }{ display:flex; gap:8px; align-items:center; color:#475467; }
        .${
          styles.modalFooter || "footer-fallback"
        }{ display:flex; justify-content:flex-end; gap:8px; padding-top:8px; }
        .${styles.cancelBtn || "cancel-fallback"}{
          height:40px; padding:0 16px; border-radius:8px; border:1px solid #e5e7eb; background:#fff; color:#374151; cursor:pointer;
        }
        .${styles.submitBtnPrimary || "submit-fallback"}{
          height:40px; padding:0 18px; border-radius:8px; border:none; background:#2563eb; color:#fff; font-weight:600; cursor:pointer;
        }
      `}</style>
    </div>
  );
}

export default PostWrite;
