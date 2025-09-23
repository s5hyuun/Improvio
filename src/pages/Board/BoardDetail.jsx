import { useEffect, useState } from "react";
import styles from "../../styles/Board.module.css";
import BoardComment from "./components/BoardComment";

function BoardDetail({ suggestion, onClose }) {
  const [detail, setDetail] = useState(null);

  //   esc 눌러도 닫히게 .....
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
      .then((data) => setDetail(data))
      .catch((err) => console.error(err));
  }, [suggestion]);

  if (!suggestion) return null;
  if (!detail) return <div className={styles.overlay}>불러오는 중...</div>;

  const {
    title,
    description,
    created_at,
    user_name,
    department_name,
    vote_count,
    comments,
    status,
    user_id,
  } = detail;

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
              <div>{title}</div>
              <div className={styles.detailTopIcons}>
                <div>
                  <i className="fa-regular fa-user"></i>
                  익명{user_id}
                </div>
                <div>
                  <i className="fa-regular fa-calendar"></i>
                  {new Date(created_at).toLocaleDateString()}
                </div>
                <div>
                  <i className="fa-regular fa-building"></i>
                  {department_name}
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
                  : "complete"}
              </div>
              <button onClick={onClose}>❌</button>
            </div>
          </div>
          <div className={styles.detailContent}>
            <div>제안 내용</div>
            <div>{description}</div>
          </div>
        </div>

        <div className={styles.detailMiddle}>
          <div>
            <i className="fa-regular fa-thumbs-up"></i>
            {vote_count}
          </div>
          <div>
            <i class="fa-regular fa-thumbs-down"></i>
            1,294
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
        </div>
      </div>
    </div>
  );
}

export default BoardDetail;
