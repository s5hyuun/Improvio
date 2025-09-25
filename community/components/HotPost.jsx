import styles from "../../../styles/Community.module.css";

function HotPost({ title, author, comments, likes }) {
  return (
    <div className={styles.commHotPost}>
      <div>{title}</div>
      <div>
        <span>{author}</span>
        <span>
          <i className="fa-solid fa-message"></i> {comments}
        </span>
        <span>
          <i className="fa-solid fa-heart"></i> {likes}
        </span>
      </div>
    </div>
  );
}

export default HotPost;
