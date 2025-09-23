import styles from "../../../styles/Board.module.css";

function BoardComment({ comment }) {
  return (
    <div className={styles.commentContainer}>
      <div className={styles.commentTop}>
        <div>
          <i className="fa-regular fa-user"></i>
          <div>
            <div>익명{comment.user_id}</div>
            <div className={styles.dept}>{comment.department_name}</div>
          </div>
        </div>
        <div>{new Date(comment.created_at).toLocaleDateString()}</div>
      </div>
      <div className={styles.commentContent}>{comment.content}</div>
      <div className={styles.commentLike}>
        <i className="fa-regular fa-thumbs-up"></i>{" "}
        <span>{comment.like_count}</span>
        <span>답글</span>
      </div>
    </div>
  );
}

export default BoardComment;
