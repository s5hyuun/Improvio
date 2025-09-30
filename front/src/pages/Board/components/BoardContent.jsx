import { useState } from "react";
import styles from "../../../styles/Board.module.css";

function BoardContent({ suggestion, onClick }) {
  const {
    title,
    description,
    created_at,
    user_id,
    vote_count = 0,
    dislike_count = 0,
    comment_count = 0,
    suggestion_id,
  } = suggestion;

  const [votes, setVotes] = useState(vote_count);
  const [dislikes, setDislikes] = useState(dislike_count);

  const handleVote = async (score) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/suggestions/${suggestion_id}/vote`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: 1, score }), // TODO: 실제 로그인 user_id 사용
        }
      );

      if (res.ok) {
        if (score === 1) setVotes(votes + 1);
        else if (score === -1) setDislikes(dislikes + 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.contentContainer} onClick={onClick}>
      <h3>{title}</h3>
      <div className={styles.description}>{description}</div>

      <div className={styles.contentUser}>
        <div>
          <i className="fa-regular fa-user"></i> 익명{user_id}
        </div>
        <div>
          <i className="fa-regular fa-calendar"></i>{" "}
          {new Date(created_at).toLocaleDateString()}
        </div>
      </div>

      <div className={styles.contentUser}>
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleVote(1);
          }}
        >
          <i className="fa-regular fa-thumbs-up"></i> {votes}{" "}
        </div>
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleVote(-1);
          }}
        ></div>

        <div>
          <i className="fa-regular fa-comment"></i> {comment_count}
        </div>
      </div>
    </div>
  );
}

export default BoardContent;
