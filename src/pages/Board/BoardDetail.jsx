import styles from "../../styles/Board.module.css";
import BoardComment from "./components/BoardComment";

function BoardDetail({ suggestion, onClose }) {
  if (!suggestion) return null;
  const {
    title,
    description,
    created_at,
    user_name,
    department_name,
    vote_count = 0,
    comment_count = 0,
    status,
  } = suggestion;
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.detailIPost}>
          <div className={styles.detailTop}>
            <div>
              <div>{title}</div>
              <div className={styles.detailTopIcons}>
                <div>
                  <i class="fa-regular fa-user"></i>
                  {user_name}
                </div>
                <div>
                  <i class="fa-regular fa-calendar"></i>
                  {new Date(created_at).toLocaleDateString()}
                </div>
                <div>
                  <i class="fa-regular fa-building"></i>
                  {department_name}
                </div>
              </div>
            </div>
            <div>
              <div className={styles.status}>{status}</div>
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
            <i class="fa-regular fa-thumbs-up"></i>999
          </div>
          <div>
            상태 변경 : <span>In Progress</span>
          </div>
        </div>
        <div className={styles.detailComment}>
          <div>
            <i class="fa-regular fa-comment"></i>
            <span>댓글 (2)</span>
          </div>
          <BoardComment />
          <BoardComment />
        </div>
      </div>
    </div>
  );
}
export default BoardDetail;
