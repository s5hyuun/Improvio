import styles from "../../../styles/Community.module.css";
function HotPost() {
  return (
    <div className={styles.commHotPost}>
      <div>핫한 게시글 제목입니다요</div>
      <div>
        <span>익룡101</span>
        <span>
          <i class="fa-solid fa-message"></i>23
        </span>
        <span>
          <i class="fa-solid fa-heart"></i>45
        </span>
      </div>
    </div>
  );
}
export default HotPost;
