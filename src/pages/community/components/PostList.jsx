import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Post from "./Post";
import styles from "../../../styles/Community.module.css";

function PostList() {
  const { boardId } = useParams();
  const nav = useNavigate();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/posts?board_id=${boardId}`)
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch((err) => console.error(err));
  }, [boardId]);

  return (
    <div className={styles.commPosts}>
      {posts.map((post) => (
        <Post
          key={post.post_id}
          onClick={() => nav(`/community/${post.post_id}`)}
          post={post}
        />
      ))}
    </div>
  );
}

export default PostList;
