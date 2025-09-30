import { useEffect, useState } from "react";
import styles from "../../../styles/Community.module.css";

function PostComment({ postId, currentUser }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 댓글 불러오기
  const fetchComments = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/posts/${postId}/comments`
      );
      const data = await res.json();
      setComments(data || []);
    } catch (err) {
      console.error("댓글 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  // 댓글 작성
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (!currentUser?.user_id) {
      alert("로그인 후 댓글 작성이 가능합니다.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/posts/${postId}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: currentUser.user_id,
            content: newComment.trim(),
          }),
        }
      );

      const data = await res.json();
      if (res.ok && data) {
        setComments([data, ...comments]); // 새 댓글 상단에 추가
        setNewComment("");
      } else {
        alert(data?.error || "댓글 작성 실패");
      }
    } catch (err) {
      console.error("댓글 저장 실패:", err);
      alert("서버 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
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
      {comments.map((c) => (
        <div key={c.postcomment_id} className={styles.postCommentContainer}>
          <div className={styles.postCommentLeft}>
            <i className="fa-regular fa-user"></i>
            <div>
              <span>{c.user_name || `익명${c.user_id}`}</span>
              <span>{formatDate(c.created_at)}</span>
            </div>
          </div>
          <div>{c.content}</div>
        </div>
      ))}
    </div>
  );
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

export default PostComment;
