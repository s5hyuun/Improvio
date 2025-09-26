import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import PostComment from "../components/PostComment";
import styles from "../../../styles/Community.module.css";

function PostDetail() {
  const { postId } = useParams();
  const nav = useNavigate();
  const [post, setPost] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/posts`)
      .then((res) => res.json())
      .then((posts) => {
        const found = posts.find((p) => p.post_id === Number(postId));
        setPost(found);
      });
  }, [postId]);

  if (!post) return <div>Loading...</div>;

  return (
    <div className={styles.postDetailContainer}>
      <button onClick={() => nav(-1)} className={styles.backButton}>
        <i className="fa-solid fa-arrow-left"></i>자유게시판 목록
      </button>
      <div className={styles.postDetailContent}>
        <h2>{post.title}</h2>
        <p>{post.content}</p>
      </div>
      <div className={styles.postAd}>광고자리</div>
      <div className={styles.postDetailComments}>
        <PostComment />
      </div>
    </div>
  );
}

export default PostDetail;
