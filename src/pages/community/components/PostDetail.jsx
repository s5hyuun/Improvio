import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import PostComment from "../components/PostComment";
import styles from "../../../styles/Community.module.css";

function PostDetail() {
  const { postId } = useParams();
  const nav = useNavigate();
  const [post, setPost] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/posts/${postId}`)
      .then((res) => res.json())
      .then((data) => setPost(data))
      .catch((err) => console.error(err));
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

      <div className={styles.postDetailIcons}>
        <i className="fa-solid fa-message"></i>
        <span>댓글 {post.comment_count}</span>
        <i className="fa-regular fa-heart"></i>
        <span>좋아요 {post.like_count}</span>
      </div>

      <div className={styles.postAd}>광고자리</div>

      <div className={styles.postDetailComments}>
        {post.comments?.map((c) => (
          <PostComment key={c.postcomment_id} comment={c} />
        ))}
      </div>
    </div>
  );
}

export default PostDetail;
