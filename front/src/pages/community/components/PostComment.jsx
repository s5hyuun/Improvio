import { useEffect, useState } from "react";
import styles from "../../../styles/Community.module.css";

function PostComment({ postId, currentUser }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  // 댓글 불러오기
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/posts/${postId}/comments`
        );
        const data = await res.json();
        setComments(data);
      } catch (err) {
        console.error("댓글 불러오기 실패:", err);
      }
    })();
  }, [postId]);

  // 댓글 작성
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/posts/${postId}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: currentUser.user_id,
            content: newComment,
          }),
        }
      );

      if (res.ok) {
        const saved = await res.json();
        setComments([saved, ...comments]); // 새 댓글 추가
        setNewComment("");
      }
    } catch (err) {
      console.error("댓글 저장 실패:", err);
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
        />
        <button type="submit">등록</button>
      </form>

      {/* 댓글 목록 */}
      {comments.map((c) => (
        <div key={c.postcomment_id} className={styles.postCommentContainer}>
          <div className={styles.postCommentLeft}>
            <i className="fa-regular fa-user"></i>
            <div>
              <span>{c.user_name}</span>
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
