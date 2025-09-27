import React from "react";
import styles from "../../../styles/Community.module.css";

function Post({ post, onClick }) {
  return (
    <div
      className={styles.postContainer}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
    >
      <div>
        <span>HOT</span>
        <h1>{post.title}</h1>
      </div>
      <div>{post.content}</div>
      <div className={styles.postIcons}>
        <span>{post.username}</span>
        <span>
          <i className="fa-solid fa-clock"></i>{" "}
          {new Date(post.created_at).toLocaleString()}
        </span>
      </div>
    </div>
  );
}

export default Post;
