// src/pages/Community/PostDetail.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import styles from "../../../styles/Market.module.css"; // ✅ mk 스타일

function PostDetail() {
  const { postId } = useParams();
  const nav = useNavigate();
  const [post, setPost] = useState(null);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    fetch(`http://localhost:5000/api/posts/${postId}`)
      .then((res) => res.json())
      .then((data) => setPost(data))
      .catch((err) => console.error(err));
  }, [postId]);

  // 간단한 timeAgo (created_at 있을 때 사용)
  const timeAgo = (ts) => {
    if (!ts) return "";
    const t = new Date(ts).getTime();
    const diff = Date.now() - t;
    const m = 60 * 1000,
      h = 60 * m,
      d = 24 * h;
    if (diff < m) return "방금 전";
    if (diff < h) return `${Math.floor(diff / m)}분 전`;
    if (diff < d) return `${Math.floor(diff / h)}시간 전`;
    return `${Math.floor(diff / d)}일 전`;
  };

  const totalComments = post?.comment_count ?? post?.comments?.length ?? 0;
  // 댓글 등록 함수
  const addComment = async () => {
    if (!newComment.trim()) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/posts/${postId}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: newComment,
            user_id: 1, // TODO: 로그인한 사용자 ID 넣기
          }),
        }
      );

      const saved = await res.json();

      // DB에 저장된 댓글을 현재 state에 추가
      setPost((prev) => ({
        ...prev,
        comments: [...(prev.comments ?? []), saved],
      }));

      setNewComment(""); // 입력창 초기화
    } catch (err) {
      console.error("댓글 등록 실패:", err);
    }
  };

  if (!post) return <div>Loading...</div>;

  return (
    <>
      <button className={styles.mkbackBtn} onClick={() => nav(-1)}>
        ← {post.board_title ?? "게시판"} 목록
      </button>

      <div className={styles.mkdetailWrap}>
        <div className={`${styles.mkmetaRow} ${styles.mkdetailTop}`} />

        {/* 제목/본문 */}
        <div className={styles.mkdetailTitle}>{post.title}</div>
        <div className={styles.mkdetailBody}>{post.content}</div>
        {post.attachments && post.attachments.length > 0 && (
          <div className={styles.mkAttachments}>
            {post.attachments.map((att) => (
              <div key={att.attachment_id} className={styles.mkAttachmentItem}>
                <img
                  src={`http://localhost:5000${att.file_path}`}
                  alt="첨부이미지"
                  className={styles.mkAttachmentImg}
                />
              </div>
            ))}
          </div>
        )}
        {/* 메타(작성자/시간/댓글/좋아요 수) — 아이콘/카운트만 표시 */}
        <div className={styles.mkmetaRow} style={{ marginTop: 8 }}>
          <div className={styles.mkmetaLeft}>
            {post.author && (
              <div className={styles.mkmetaItem}>{post.author}</div>
            )}
            {post.created_at && (
              <div className={styles.mkmetaItem}>
                <i className="fa-regular fa-clock" aria-hidden="true" />
                {timeAgo(post.created_at)}
              </div>
            )}
            <div className={styles.mkmetaItem}>
              <i className="fa-regular fa-comment" aria-hidden="true" />
              {totalComments}
            </div>
            <div className={styles.mkmetaItem}>
              <i className="fa-regular fa-heart" aria-hidden="true" />
              {post.like_count ?? 0}
            </div>
          </div>
        </div>

        {/* 댓글 섹션 */}
        <div className={styles.mkcommentsSection}>
          <div className={styles.mkcommentsHeader}>
            댓글 <span className={styles.mkcommentsCount}>{totalComments}</span>
          </div>

          {/* 댓글 입력 (동작 로직은 기존처럼 미구현 상태) */}
          <div className={styles.mkcommentDock}>
            <input
              className={styles.mkcommentInputBar}
              type="text"
              placeholder="댓글을 입력하세요."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.isComposing) return;
                if (e.key === "Enter") {
                  e.preventDefault();
                  addComment();
                }
              }}
            />
            <div className={styles.mkcommentSide}>
              <button
                className={styles.mksendBtn}
                type="button"
                onClick={addComment}
                aria-label="댓글 등록"
              >
                <i className="fa-solid fa-pen" />
              </button>
            </div>
          </div>

          {/* 댓글 리스트: mk 구조로 렌더링 */}
          <div className={styles.mkcommentsList}>
            {(post.comments ?? []).map((c) => (
              <div key={c.postcomment_id} className={styles.mkcommentItem}>
                <div className={styles.mkcommentHead}>
                  <div className={styles.mkcommentAvatar} />
                  <div className={styles.mkcommentMeta}>
                    <div className={styles.mkcommentAuthor}>
                      {c.author ?? c.user_name ?? "익명"}
                    </div>
                    <div className={styles.mkcommentTime}>
                      {timeAgo(c.created_at)}
                    </div>
                  </div>
                </div>

                <div
                  className={styles.mkcommentBody}
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {c.content ?? c.text}
                </div>

                <div className={styles.mkcommentFoot}>
                  <div className={styles.mklikeWrap}>
                    <i className="fa-regular fa-heart" />
                    <em className={styles.mklikeCount}>{c.like_count ?? 0}</em>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default PostDetail;
