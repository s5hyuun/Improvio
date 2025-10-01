import { useEffect, useMemo, useState } from "react";
import styles from "../../../styles/Board.module.css";

const BASE = "http://localhost:5000";

/** "a/b c.jpg" → "a/b%20c.jpg" (슬래시는 유지, 세그먼트만 인코딩) */
function encodePathSegments(path) {
  if (!path) return "";
  return String(path)
    .replace(/['"]/g, "")
    .replace(/\\/g, "/")
    .split("?")[0]
    .split("/")
    .map(seg => encodeURIComponent(seg))
    .join("/");
}

/** /uploads 아래의 정적 파일 URL 만들기 */
function toUploadsUrl(filePath) {
  const encoded = encodePathSegments(filePath);
  if (!encoded) return null;
  // 이미 절대 URL이면 그대로
  if (/^https?:\/\//i.test(filePath)) return filePath;
  return `${BASE}/uploads/${encoded}`;
}

/** HTML에서 첫번째 <img src> 추출 */
function extractImgFromHtml(html) {
  if (!html) return null;
  try {
    const div = document.createElement("div");
    div.innerHTML = html;
    const img = div.querySelector("img");
    return img?.getAttribute("src") || null;
  } catch {
    return null;
  }
}

/** 확장자 (소문자) */
function extOf(p) {
  if (!p) return "";
  const clean = String(p).split("?")[0];
  const i = clean.lastIndexOf(".");
  return i >= 0 ? clean.slice(i + 1).toLowerCase() : "";
}

/** 썸네일 후보를 고르는 공통 로직 */
function pickImageUrlFromSuggestion(suggestion) {
  // 1) description/body 내 <img src>
  const fromHtml =
    extractImgFromHtml(suggestion?.description) ||
    extractImgFromHtml(suggestion?.body);
  if (fromHtml) {
    const e = extOf(fromHtml);
    if (["jpg", "jpeg", "png"].includes(e)) {
      return /^https?:\/\//i.test(fromHtml) ? fromHtml : toUploadsUrl(fromHtml);
    }
  }

  // 2) 평면 키들
  const flatKeys = [
    "image_url",
    "imageUrl",
    "image",
    "photo_url",
    "photo",
    "thumbnail_url",
    "thumb_url",
    "attachment_url",
    "file_url",
    "file_path",
    "image_path",
    "upload_path",
    "preview_url",
  ];
  for (const k of flatKeys) {
    const v = suggestion?.[k];
    if (!v) continue;
    const e = extOf(v);
    if (!["jpg", "jpeg", "png"].includes(e)) continue;
    return /^https?:\/\//i.test(v) ? v : toUploadsUrl(v);
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

  // 1차: 리스트 객체만으로 썸네일 추출 (없으면 null)
  const primaryUrl = useMemo(
    () => pickImageUrlFromSuggestion(suggestion),
    [suggestion]
  );

  // 2차: 상세를 한 번 조회해서 attachments에서 썸네일 결정
  const [detailThumb, setDetailThumb] = useState(null);

  useEffect(() => {
    let abort = false;
    async function loadDetailThumb() {
      try {
        const res = await fetch(`${BASE}/api/suggestions/${suggestion_id}/details`);
        if (!res.ok) return; // 실패 시 썸네일 없이 진행
        const data = await res.json();

        // attachments에서 jpg/jpeg/png 우선
        const first = (data.attachments || []).find(att => {
          const e = extOf(att?.file_path || att?.path || att?.url);
          return ["jpg", "jpeg", "png"].includes(e);
        });

        if (!abort && first) {
          setDetailThumb(toUploadsUrl(first.file_path || first.path || first.url));
        }
      } catch {
        // 무시
      }
    }

    // primaryUrl이 이미 있으면 상세 호출 불필요
    if (!primaryUrl) loadDetailThumb();
    return () => { abort = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestion_id, primaryUrl]);

  // 최종 썸네일: 리스트→상세 순으로 결정
  const imageUrl = primaryUrl || detailThumb;

  const handleVote = async (score) => {
    try {
      const res = await fetch(`${BASE}/api/suggestions/${suggestion_id}/vote`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: 1, score }), // TODO: 실제 로그인 사용자로 교체
      });
      if (res.ok) {
        if (score === 1) setVotes(v => v + 1);
        else if (score === -1) setDislikes(d => d + 1);
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
      style={{ display: "flex", alignItems: "center", gap: 12 }}
    >
      {/* 텍스트 */}
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
            onClick={(e) => { e.stopPropagation(); handleVote(1); }}
            title="좋아요"
            style={{ cursor: "pointer" }}
          >
            <i className="fa-regular fa-thumbs-up"></i> {votes}
          </div>

        <div
            onClick={(e) => { e.stopPropagation(); handleVote(-1); }}
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

      {/* 이미지 썸네일 */}
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
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            onError={(e) => {
              // 깨질 경우 카드에서 감춤
              e.currentTarget.parentElement.style.display = "none";
            }}
          />
        </div>
      )}
    </div>
  );
}

export default BoardContent;
