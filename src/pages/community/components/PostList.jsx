import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Post from "./Post";
import styles from "../../../styles/Community.module.css";

function PostList() {
  const nav = useNavigate();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // axios → fetch
    fetch("http://localhost:5000/api/posts")
      .then((res) => {
        if (!res.ok) throw new Error("게시글 가져오기 실패");
        return res.json();
      })
      .then((data) => setPosts(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className={styles.commPostsContainer}>
      <div>
        <i className="fa-solid fa-message"></i>
        <div>자유게시판</div>
        <span>( {posts.length} )</span>
      </div>

      {/* 게시글 리스트 */}
      <div>
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
            timeAgo="2시간 전" // TODO: 실제 시간 계산 함수로 교체 가능
          />
        ))}
      </div>
    </div>
  );
}

export default PostList;
