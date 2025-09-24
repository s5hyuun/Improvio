import { useEffect, useState } from "react";
import styles from "../../styles/Board.module.css";
import BoardComment from "./components/BoardComment";

function BoardDetail({ suggestion, onClose }) {
  const [detail, setDetail] = useState(null);
  const [dislikes, setDislikes] = useState(0);

  const user_id = 1; // 실제 로그인한 user_id로 바꿔야 함

  // ESC 눌러도 닫히게
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);
  useEffect(() => {
    if (!suggestion) return;
    fetch(
      `http://localhost:5000/api/suggestions/${suggestion.suggestion_id}/details`
    )
      .then((res) => res.json())
      .then((data) => {
        setDetail(data);

        setDislikes(data.dislike_count || 0); // 여기서 싫어요 세팅
      })
      .catch((err) => console.error(err));
  }, [suggestion]);

  // 상세 데이터 가져오기
  const fetchDetail = async () => {
    if (!suggestion) return;
    try {
      const data = await fetch(
        `http://localhost:5000/api/suggestions/${suggestion.suggestion_id}/details`
      ).then((res) => res.json());
      setDetail(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [suggestion]);

  if (!suggestion) return null;
  if (!detail) return <div className={styles.overlay}>불러오는 중...</div>;

  const {
    title,
    description,
    created_at,
    department_name,
    vote_count,
    dislike_count,
    comments,
    status,
    user_id: author_id,
  } = detail;

  // 좋아요 클릭
  const handleVote = async () => {
    try {
      await fetch(
        `http://localhost:5000/api/suggestions/${suggestion.suggestion_id}/vote`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id, score: 1 }),
        }
      );
      fetchDetail(); // 새로고침
    } catch (err) {
      console.error(err);
    }
  };

  // 싫어요 클릭
  const handleDislike = async () => {
    try {
      await fetch(
        `http://localhost:5000/api/suggestions/${suggestion.suggestion_id}/dislike`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: 1 }), // 실제 로그인 유저 id로 교체
        }
      );

      // 업데이트 후 다시 조회
      const res = await fetch(
        `http://localhost:5000/api/suggestions/${suggestion.suggestion_id}/details`
      );
      const data = await res.json();
      setDislikes(data.dislike_count || 0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className={styles.overlay}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className={styles.modal}>
        <div className={styles.detailIPost}>
          <div className={styles.detailTop}>
            <div>
              <div className={styles.detailTopTitle}>{title}</div>
              <div className={styles.detailTopIcons}>
                <div>
                  <i className="fa-regular fa-building"></i>
                  {department_name}
                </div>
                <div>
                  <i className="fa-regular fa-calendar"></i>
                  {new Date(created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div>
              <div
                className={
                  status === "pending"
                    ? styles.proposal
                    : status === "approved"
                    ? styles.inprogress
                    : styles.complete
                }
              >
                {status === "pending"
                  ? "Proposal"
                  : status === "approved"
                  ? "In progress"
                  : "Complete"}
              </div>
              <button onClick={onClose}>❌</button>
            </div>
          </div>

          <div className={styles.detailContent}>
            <div>제안 내용</div>
            <div>{description}</div>

            <div className={styles.detailThumb}>
              <div onClick={handleVote} style={{ cursor: "pointer" }}>
                <i className="fa-regular fa-thumbs-up"></i> {vote_count || 0}
              </div>
              <div onClick={handleDislike} style={{ cursor: "pointer" }}>
                <i className="fa-regular fa-thumbs-down"></i>{" "}
                {dislike_count || 0}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.detailComment}>
          <div>
            <i className="fa-regular fa-comment"></i>
            <span>댓글 ({comments.length})</span>
          </div>
          {comments.map((c) => (
            <BoardComment key={c.comment_id} comment={c} />
          ))}
          <form className={styles.detailCommentInput}>
            <input type="text" placeholder="Add Comment ..." />
            <input type="submit" />
          </form>
        </div>
      </div>
    </div>
  );
}

export default BoardDetail;
