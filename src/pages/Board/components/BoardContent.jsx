import styles from "../../../styles/Board.module.css";

function BoardContent() {
  return (
    <div className={styles.contentContainer}>
      <h3>저 제안 합니다 .</h3>
      <div>여기는 제안 내용 입니다 .</div>
      <div className={styles.contentUser}>
        <div>
          <i class="fa-regular fa-user"></i>
          조용한 사원208
        </div>
        <div>
          <i class="fa-regular fa-calendar"></i>
          2025-09-20
        </div>
      </div>
      <div className={styles.contentUser}>
        <div>
          <i class="fa-regular fa-thumbs-up"></i>0
        </div>
        <div>
          <i class="fa-regular fa-comment"></i>0
        </div>
      </div>
    </div>
  );
}
export default BoardContent;
