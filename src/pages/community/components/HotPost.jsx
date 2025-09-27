import React, { useEffect, useState } from "react";
import styles from "../../../styles/Community.module.css";

function HotPost({ post }) {
  return (
    <div className={styles.commHotPost}>
      <div>{post.title}</div>
      <div>
        <span>{post.username}</span>
        <span>
          <i className="fa-solid fa-message"></i>
          {post.comment_count}
        </span>
        <span>
          <i className="fa-solid fa-heart"></i>
          {post.like_count}
        </span>
      </div>
    </div>
  );
}
export default HotPost;
