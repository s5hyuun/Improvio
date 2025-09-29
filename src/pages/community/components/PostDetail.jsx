// src/pages/Community/PostDetail.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import styles from "../../../styles/Market.module.css"; // ✅ mk 스타일

function PostDetail() {
  const { postId } = useParams();
  const nav = useNavigate();
  const [post, setPost] = useState(null);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    fetch(`http://localhost:5000/api/posts/${postId}`)
      .then((res) => res.json())
      .then((data) => setPost(data))
      .catch((err) => console.error(err));
  }, [postId]);

  // 간단한 timeAgo (created_at 있을 때 사용)
  const timeAgo = (ts) => {
    if (!ts) return "";
    const t = new Date(ts).getTime();
    const diff = Date.now() - t;
    const m = 60 * 1000,
      h = 60 * m,
      d = 24 * h;
    if (diff < m) return "방금 전";
    if (diff < h) return `${Math.floor(diff / m)}분 전`;
    if (diff < d) return `${Math.floor(diff / h)}시간 전`;
    return `${Math.floor(diff / d)}일 전`;
  };

  const totalComments = post?.comment_count ?? post?.comments?.length ?? 0;

  if (!post) return <div>Loading...</div>;

  return (
    <>
      <button className={styles.mkbackBtn} onClick={() => nav(-1)}>
        ← {post.board_title ?? "게시판"} 목록
      </button>

      <div className={styles.mkdetailWrap}>
        <div className={`${styles.mkmetaRow} ${styles.mkdetailTop}`} />

        {/* 제목/본문 */}
        <div className={styles.mkdetailTitle}>{post.title}</div>
        <div className={styles.mkdetailBody}>{post.content}</div>

        {/* 첨부 이미지 */}
        {post.attachments && post.attachments.length > 0 && (
          <div className={styles.mkAttachments}>
            {post.attachments.map((att) => (
              <div key={att.attachment_id} className={styles.mkAttachmentItem}>
                <img
                  src={`http://localhost:5000${att.file_path}`}
                  alt="첨부이미지"
                  className={styles.mkAttachmentImg}
                />
              </div>
            ))}
          </div>
        )}

        {/* 메타(작성자/시간/댓글/좋아요 수) */}
        <div className={styles.mkmetaRow} style={{ marginTop: 8 }}>
          <div className={styles.mkmetaLeft}>
            {post.author && (
              <div className={styles.mkmetaItem}>{post.author}</div>
            )}
            {post.created_at && (
              <div className={styles.mkmetaItem}>
                <i className="fa-regular fa-clock" aria-hidden="true" />
                {timeAgo(post.created_at)}
              </div>
            )}
            <div className={styles.mkmetaItem}>
              <i className="fa-regular fa-comment" aria-hidden="true" />
              {totalComments}
            </div>
            <div className={styles.mkmetaItem}>
              <i className="fa-regular fa-heart" aria-hidden="true" />
              {post.like_count ?? 0}
            </div>
          </div>
        </div>

        {/* 댓글 섹션 */}
        <div className={styles.mkcommentsSection}>
          {/* 댓글 입력 및 리스트 기존 코드 그대로 */}
        </div>
      </div>
    </>
  );
}

export default PostDetail;
