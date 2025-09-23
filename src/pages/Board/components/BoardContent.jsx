import styles from "../../../styles/Board.module.css";

function BoardContent({ suggestion, onClick }) {
  const {
    title,
    description,
    created_at,
    user_name,
    vote_count = 0,
    comment_count = 0,
  } = suggestion;

  return (
    <div className={styles.contentContainer} onClick={onClick}>
      <h4>{title}</h4>
      <div className={styles.description}>{description}</div>

      <div className={styles.contentUser}>
        <div>
          <i className="fa-regular fa-user"></i> {user_name}
        </div>
        <div>
          <i className="fa-regular fa-calendar"></i>{" "}
          {new Date(created_at).toLocaleDateString()}
        </div>
      </div>

      <div className={styles.contentUser}>
        <div>
          <i className="fa-regular fa-thumbs-up"></i> {vote_count}
        </div>
        <div>
          <i className="fa-regular fa-comment"></i> {comment_count}
        </div>
      </div>
    </div>
  );
}

export default BoardContent;
