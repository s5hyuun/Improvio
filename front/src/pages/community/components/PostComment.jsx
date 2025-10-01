// PostComment.jsx
import { useCallback, useEffect, useState } from "react";
import styles from "../../../styles/Community.module.css";

const COMMENT_LS_KEY = "liked_comments"; 

function readLikedComments() {
  try {
    const raw = localStorage.getItem(COMMENT_LS_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}
function writeLikedComments(set) {
  try {
    localStorage.setItem(COMMENT_LS_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}

function formatDate(s) {
  if (!s) return "-";
  const d = new Date(s);
  const mm = `${d.getMonth() + 1}`.padStart(2, "0");
  const dd = `${d.getDate()}`.padStart(2, "0");
  const hh = `${d.getHours()}`.padStart(2, "0");
  const mi = `${d.getMinutes()}`.padStart(2, "0");
  return `${mm}/${dd} ${hh}:${mi}`;
}

function PostComment({ postId, currentUser }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [likedSet, setLikedSet] = useState(() => readLikedComments());

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/posts/${postId}/comments`);
      const data = await res.json();
      const withLikeState = (data || []).map((c) => ({
        ...c,
        _liked: likedSet.has(String(c.postcomment_id)),
        like_count: c.like_count ?? 0,
      }));
      setComments(withLikeState);
    } catch (err) {
      console.error("댓글 불러오기 실패:", err);
    }
  }, [postId, likedSet]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!currentUser?.user_id) return; // 무소음 처리

    setSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: currentUser.user_id,
          content: newComment.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data) {
        const inserted = { ...data, _liked: false, like_count: data.like_count ?? 0 };
        // 낙관적 반영
        setComments((prev) => [inserted, ...prev]);
        try {
          window.dispatchEvent(
            new CustomEvent("post:commentAdded", { detail: { postId: String(postId) } })
          );
        } catch {}
        setNewComment("");

        fetchComments();
      }
    } catch (err) {
      console.error("댓글 저장 실패:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // 삭제: 확인/alert 없이 낙관적 처리 + posts/:postId/comments/:commentId 엔드포인트 사용
  const handleDelete = async (comment) => {
    const rawId = comment?.postcomment_id ?? comment?.id;
    if (rawId === undefined || rawId === null) {
      console.warn("잘못된 commentId(없음):", comment);
      return;
    }
    const commentId = String(rawId);
    if (!/^\d+$/.test(commentId)) {
      console.warn("잘못된 commentId(숫자 아님):", commentId, comment);
      return;
    }
    if (!currentUser?.user_id || Number(currentUser.user_id) !== Number(comment.user_id)) return;

    // 1) 화면에서 즉시 제거
    setComments((prev) => prev.filter((c) => String(c.postcomment_id) !== commentId));
    try {
      window.dispatchEvent(
        new CustomEvent("post:commentDeleted", { detail: { postId: String(postId) } })
      );
    } catch {}

    // 2) 서버 요청 (실패해도 조용히)
    try {
      const r = await fetch(`http://localhost:5000/api/posts/${postId}/comments/${commentId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: currentUser.user_id }),
      });
      if (!r.ok) throw new Error(`delete failed: ${r.status}`);
    } catch (err) {
      console.warn("댓글 삭제 서버 반영 실패(화면은 유지):", err);
    } finally {
      // 3) 서버 상태 재동기화(한 번 보강)
      fetchComments();
    }
  };

  const toggleCommentLike = async (commentId) => {
    const idStr = String(commentId);
    const willLike = !likedSet.has(idStr);

    setComments((prev) =>
      prev.map((c) =>
        String(c.postcomment_id) === idStr
          ? { ...c, _liked: willLike, like_count: Math.max(0, (c.like_count ?? 0) + (willLike ? 1 : -1)) }
          : c
      )
    );

    const next = new Set(likedSet);
    if (willLike) next.add(idStr);
    else next.delete(idStr);
    setLikedSet(next);
    writeLikedComments(next);

    // 서버 반영은 생략(조용히)
  };

  return (
    <div>
      {/* 댓글 작성 폼 */}
      <form onSubmit={handleSubmit} className={styles.commentForm}>
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="댓글을 입력하세요"
          disabled={submitting}
        />
        <button type="submit" disabled={submitting}>
          {submitting ? "등록 중..." : "등록"}
        </button>
      </form>

      {/* 댓글 목록 */}
      {comments.map((c) => {
        const isOwner =
          !!currentUser?.user_id && Number(currentUser.user_id) === Number(c.user_id);

        const key = String(c.postcomment_id ?? c.id ?? `${c.user_id}-${c.created_at}`);

        return (
          <div key={key} className={styles.postCommentContainer}>
            <div className={styles.postCommentLeft}>
              <i className="fa-regular fa-user"></i>
              <div>
                <span>{c.user_name || `익명${c.user_id}`}</span>
                <span>{formatDate(c.created_at)}</span>
              </div>
            </div>

            <div className={styles.postCommentRight}>
              <div className={styles.postCommentContent}>{c.content}</div>

              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                {/* 좋아요 */}
                <button
                  type="button"
                  className={styles.commentLikeBtn}
                  onClick={() => toggleCommentLike(c.postcomment_id)}
                  aria-label={c._liked ? "댓글 좋아요 취소" : "댓글 좋아요"}
                  title={c._liked ? "좋아요 취소" : "좋아요"}
                  style={{
                    display: "inline-flex",
                    gap: 6,
                    alignItems: "center",
                    background: "transparent",
                    border: 0,
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  <i
                    className={c._liked ? "fa-solid fa-heart" : "fa-regular fa-heart"}
                    aria-hidden="true"
                    style={{ color: c._liked ? "#ff0505" : "inherit" }}
                  />
                  <span>{c.like_count ?? 0}</span>
                </button>

                {/* 삭제 버튼(본인만) */}
                {isOwner && (
                  <button
                    type="button"
                    onClick={() => handleDelete(c)}
                    className={styles.commentDeleteBtn}
                    aria-label="댓글 삭제"
                    title="댓글 삭제"
                    style={{
                      background: "transparent",
                      border: "1px solid #ddd",
                      borderRadius: 6,
                      padding: "4px 8px",
                      cursor: "pointer",
                    }}
                  >
                    <i className="fa-regular fa-trash-can" /> 삭제
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default PostComment;
