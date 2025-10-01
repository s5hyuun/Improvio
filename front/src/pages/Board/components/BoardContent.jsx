import { useState, useMemo } from "react";
import styles from "../../../styles/Board.module.css";

/** 절대 URL 생성 (윈도우 경로 보정 포함) */
function toAbsoluteUrl(raw, base = "http://localhost:5000") {
  if (!raw) return null;
  let s = String(raw).trim().replace(/['"]/g, "");
  s = s.replace(/\\/g, "/");
  if (!/^https?:\/\//i.test(s) && !s.startsWith("/")) s = `/${s}`;
  try {
    return new URL(s, base).href;
  } catch {
    return null;
  }
}

/** HTML 내 <img> 태그에서 첫 src 추출 */
function extractImgFromHtml(html) {
  if (!html) return null;
  try {
    const div = document.createElement("div");
    div.innerHTML = html;
    const img = div.querySelector("img");
    const src = img?.getAttribute("src");
    return src || null;
  } catch {
    return null;
  }
}

/** 이미지 URL 선택 로직 */
function pickImageUrl(suggestion, base = "http://localhost:5000") {
  if (!suggestion || typeof suggestion !== "object") return null;

  // 1. attachments 우선
  if (Array.isArray(suggestion.attachments)) {
    for (const att of suggestion.attachments) {
      const path = att.file_path || att.path;
      const ext = path?.split(".").pop()?.toLowerCase();
      if (["jpg", "jpeg", "png"].includes(ext)) {
        return `${base}/uploads/${encodeURIComponent(path)}`;
      }
    }
  }

  // 2. HTML 내 이미지
  const fromHtml =
    extractImgFromHtml(suggestion.description) ||
    extractImgFromHtml(suggestion.body);
  if (fromHtml) {
    const u = toAbsoluteUrl(fromHtml, base);
    if (u) return u;
  }

  // 3. 평평한 필드 탐색
  const flatKeys = [
    "image_url", "imageUrl", "image", "photo_url", "photo",
    "thumbnail_url", "thumb_url", "attachment_url", "file_url",
    "file_path", "image_path", "upload_path", "preview_url",
  ];
  for (const key of flatKeys) {
    if (suggestion[key]) {
      const u = toAbsoluteUrl(suggestion[key], base);
      if (u) return u;
    }
  }

  // 4. 배열 속 객체 탐색
  const arrayKeys = ["images", "photos", "attachments", "files", "pictures"];
  for (const key of arrayKeys) {
    const arr = suggestion[key];
    if (Array.isArray(arr)) {
      for (const item of arr) {
        if (typeof item === "string") {
          const u = toAbsoluteUrl(item, base);
          if (u) return u;
        } else if (typeof item === "object") {
          const innerKeys = [
            item.url, item.path, item.file_url, item.file_path,
            item.image_url, item.preview_url
          ];
          for (const val of innerKeys) {
            if (val) {
              const u = toAbsoluteUrl(val, base);
              if (u) return u;
            }
          }
        }
      }
    }
  }

  return null;
}

function BoardContent({ suggestion, onClick }) {
  const {
    title,
    description = "",
    created_at,
    user_id,
    vote_count = 0,
    dislike_count = 0,
    comment_count = 0,
    suggestion_id,
  } = suggestion;

  const [votes, setVotes] = useState(vote_count);
  const [dislikes, setDislikes] = useState(dislike_count);

  const imageUrl = useMemo(() => pickImageUrl(suggestion), [suggestion]);

  const handleVote = async (score) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/suggestions/${suggestion_id}/vote`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: 1, score }), // TODO: 실제 로그인 사용자 반영
        }
      );
      if (res.ok) {
        if (score === 1) setVotes((v) => v + 1);
        else if (score === -1) setDislikes((d) => d + 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const shortDesc =
    description.length > 60 ? `${description.slice(0, 60)}...` : description;

  return (
    <div
      className={styles.contentContainer}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      {/* 텍스트 영역 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 className={styles.cardTitle} style={{ marginBottom: 6 }}>
          {title}
        </h3>

        <div className={styles.description} style={{ marginBottom: 8 }}>
          {shortDesc}
        </div>

        <div className={styles.contentUser}>
          <div title="작성자">
            <i className="fa-regular fa-user"></i> 익명{user_id}
          </div>
          <div title="작성일">
            <i className="fa-regular fa-calendar"></i>{" "}
            {new Date(created_at).toLocaleDateString()}
          </div>
        </div>

        <div className={styles.contentUser} style={{ marginTop: 6 }}>
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleVote(1);
            }}
            title="좋아요"
            style={{ cursor: "pointer" }}
          >
            <i className="fa-regular fa-thumbs-up"></i> {votes}
          </div>

          <div
            onClick={(e) => {
              e.stopPropagation();
              handleVote(-1);
            }}
            title="싫어요"
            style={{ cursor: "pointer" }}
          >
            <i className="fa-regular fa-thumbs-down"></i> {dislikes}
          </div>

          <div title="댓글 수">
            <i className="fa-regular fa-comment"></i> {comment_count}
          </div>
        </div>
      </div>

      {/* 썸네일 이미지 (있는 경우만) */}
      {imageUrl && (
        <div
          style={{
            flex: "0 0 auto",
            width: 96,
            height: 96,
            borderRadius: 8,
            overflow: "hidden",
            border: "1px solid #e2e8f0",
          }}
          onClick={(e) => e.stopPropagation()}
          title="첨부 이미지"
        >
          <img
            src={imageUrl}
            alt="첨부 이미지"
            loading="lazy"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
            onError={(e) => {
              e.currentTarget.parentElement.style.display = "none";
            }}
          />
        </div>
      )}
    </div>
  );
}

export default BoardContent;
