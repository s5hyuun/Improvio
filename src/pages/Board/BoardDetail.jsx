import styles from "../../styles/Board.module.css";
import BoardComment from "./components/BoardComment";

function BoardDetail({ suggestion, onClose }) {
  if (!suggestion) return null;
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.detailIPost}>
          <div className={styles.detailTop}>
            <div>
              <div>제목</div>
              <div className={styles.detailTopIcons}>
                <div>
                  <i class="fa-regular fa-user"></i>
                  노래하는 물고기
                </div>
                <div>
                  <i class="fa-regular fa-calendar"></i>
                  2025-09-19
                </div>
                <div>
                  <i class="fa-regular fa-building"></i>
                  R&D
                </div>
              </div>
            </div>
            <div>
              <div className={styles.status}>In progress</div>
              <button onClick={onClose}>❌</button>
            </div>
          </div>
          <div className={styles.detailContent}>
            <div>제안 내용</div>
            <div>
              여기 내용 나옴 <br />
              여기 내용 나옴 <br />
              여기 내용 나옴
              <br />
              여기 내용 나옴
            </div>
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
