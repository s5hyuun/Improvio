import { useState, useMemo } from "react";
import styles from "../../../styles/Board.module.css";

/** 카드 내부에서 사용할 안전한 이미지 URL 선택자 */
function pickImageUrl(suggestion, base = "http://localhost:5000") {
  if (!suggestion || typeof suggestion !== "object") return null;

  const flatCandidates = [
    suggestion.image_url,
    suggestion.imageUrl,
    suggestion.image,
    suggestion.photo_url,
    suggestion.photo,
    suggestion.attachment_url,
    suggestion.file_url,
    suggestion.file_path,
  ].filter(Boolean);

  const arrayCandidates = []
    .concat(suggestion.images || [])
    .concat(suggestion.photos || [])
    .concat(suggestion.attachments || [])
    .concat(suggestion.files || [])
    .map((x) => {
      if (!x) return null;
      if (typeof x === "string") return x;
      if (typeof x === "object") return x.url || x.path || x.file_url || x.file_path || null;
      return null;
    })
    .filter(Boolean);

  const first = [...flatCandidates, ...arrayCandidates].find(Boolean) || null;
  if (!first) return null;

  // 절대 URL인지 상대 경로인지 판별하여 보정
  try {
    const u = new URL(first, base);
    // 만약 first가 이미 절대주소면 그대로, "/uploads/.." 같은 상대면 base 붙음
    return u.href;
  } catch {
    // URL 파싱 실패 시 그대로 반환
    return first;
  }
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
          body: JSON.stringify({ user_id: 1, score }), // TODO: 실제 로그인 user_id 사용
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

      {/* 이미지 썸네일 영역 (있을 때만 표시) */}
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
              // 썸네일 로딩 실패 시 영역 숨김
              e.currentTarget.parentElement.style.display = "none";
            }}
          />
        </div>
      )}
    </div>
  );
}

export default BoardContent;
