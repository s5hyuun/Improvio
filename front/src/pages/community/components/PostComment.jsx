import styles from "../../../styles/Community.module.css";
function PostComment() {
  return (
    <div className={styles.postCommentContainer}>
      <div className={styles.postCommentLeft}>
        <i class="fa-regular fa-user"></i>
        <div>
          <span>익룡이101</span>
          <span>09/24 14:34</span>
        </div>
      </div>
      <div className={styles.postCommentIcons}>
        <i class="fa-solid fa-message"></i>
        <i class="fa-regular fa-thumbs-up"></i>
        <i class="fa-regular fa-heart"></i>
      </div>
    </div>
  );
}
export default PostComment;
