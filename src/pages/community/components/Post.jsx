import styles from "../../../styles/Community.module.css";

function Post() {
  return (
    <div className={styles.postContainer}>
      <div>
        <span>HOT</span>
        <h1>제목 자리 입니다 ..</h1>
      </div>
      <div>내용 자리 입니다 ....</div>
      <div className={styles.postIcons}>
        <span>익룡 888</span>
        <span>
          <i class="fa-solid fa-clock"></i>2시간 전
        </span>
        <span>
          <i class="fa-solid fa-message"></i>23
        </span>
        <span>
          <i class="fa-solid fa-eye"></i>567
        </span>
        <span>
          <i class="fa-solid fa-heart"></i>45
        </span>
      </div>
    </div>
  );
}
export default Post;
