import styles from "../../../styles/Board.module.css";
function BoardComment() {
  return (
    <div className={styles.commentContainer}>
      <div className={styles.commentTop}>
        <div>
          <i class="fa-regular fa-user"></i>
          <div>
            <div>냉철한기획자642</div>
            <div className={styles.dept}>부서</div>
          </div>
        </div>
        <div>2025-09-19</div>
      </div>
      <div className={styles.commentContent}>댓글 내용</div>
      <div className={styles.commentLike}>
        <i class="fa-regular fa-thumbs-up"></i> <span>5</span>
        <span>답글</span>
      </div>
    </div>
  );
}

export default BoardComment;
