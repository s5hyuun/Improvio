import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Post } from "./Post";
import axios from "axios";
import styles from "../../../styles/Community.module.css";

function PostList() {
  const nav = useNavigate();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/posts")
      .then((res) => setPosts(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <>
      <div>
        <i className="fa-solid fa-message"></i>
        <div>자유게시판</div>
        <span>( {posts.length} )</span>
      </div>

      <div className={styles.commPosts}>
        {posts.map((p) => (
          <Post
            key={p.post_id}
            onClick={() => nav(`/community/${p.post_id}`)}
            title={p.title}
            content={p.content}
            author={p.username}
            comments={p.comments?.length || 0}
            likes={p.likes || 0}
            views={p.views || 0}
            timeAgo="2시간 전" // 나중에 실제 시간 계산 가능
          />
        ))}
      </div>
    </>
  );
}

export default PostList;
