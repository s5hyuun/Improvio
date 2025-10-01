import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import PostComment from "./PostComment";
import styles from "../../../styles/Community.module.css";
import { useTranslation } from "react-i18next"; 
import styles from "../../../styles/Market.module.css";

function PostDetail() {
  const { postId } = useParams();
  const nav = useNavigate();
  const [post, setPost] = useState(null);
  const { t, i18n } = useTranslation();  

  // 번역 함수
  async function translateText(text, lang) {
    const res = await fetch("http://localhost:4000/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, targetLang: lang.toUpperCase() }),
    });
    const data = await res.json();
    return data.translatedText || text;
  }

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`http://localhost:4000/api/posts/${postId}`);
        const data = await res.json();

        const lang = i18n.language || "ko";

        if (lang === "ko") {
          setPost(data);
          return;
        }

        // 번역
        const translatedTitle = await translateText(data.title, lang);
        const translatedContent = await translateText(data.content, lang);

        // comments도 번역 (선택)
        const translatedComments = await Promise.all(
          (data.comments || []).map(async (c) => {
            const translatedComment = await translateText(c.comment_text, lang);
            return { ...c, comment_text: translatedComment };
          })
        );

        setPost({ ...data, title: translatedTitle, content: translatedContent, comments: translatedComments });
      } catch (err) {
        console.error(err);
      }
    }

    fetchPost();
  }, [postId, i18n.language]);

  if (!post) return <div>{t("postDetail.loading")}</div>;
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  // 게시글 + 댓글 불러오기
  const fetchPost = async () => {
    setLoading(true);
    try {
      const [postRes, commentRes] = await Promise.all([
        fetch(`http://localhost:5000/api/posts/${postId}`),
        fetch(`http://localhost:5000/api/posts/${postId}/comments`),
      ]);

      const postData = await postRes.json();
      const commentData = await commentRes.json();

      if (!postRes.ok) throw new Error(postData?.error || "게시글 로드 실패");
      if (!commentRes.ok)
        throw new Error(commentData?.error || "댓글 로드 실패");

      setPost(postData);
      setComments(commentData);
      setLiked(!!postData.user_liked); // 서버에서 현재 로그인 사용자가 좋아요 했는지 반환
    } catch (err) {
      console.error(err);
      alert("게시글을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [postId]);

  // 좋아요 토글
  const toggleLike = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/posts/${postId}/like`,
        {
          method: "POST",
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "좋아요 처리 실패");

      setLiked(data.user_liked);
      setPost((prev) => ({ ...prev, like_count: data.like_count }));
    } catch (err) {
      console.error(err);
      alert("좋아요 처리 중 오류가 발생했습니다.");
    }
  };

  // 댓글 등록
  const addComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/posts/${postId}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: newComment.trim(), user_id: 1 }), // 로그인 사용자 ID
        }
      );
      const saved = await res.json();
      if (!res.ok) throw new Error(saved?.error || "댓글 등록 실패");

      setComments((prev) => [...prev, saved]);
      setPost((prev) => ({ ...prev, comment_count: prev.comment_count + 1 }));
      setNewComment("");
    } catch (err) {
      console.error(err);
      alert("댓글 등록 중 오류가 발생했습니다.");
    }
  };

  const timeAgo = (ts) => {
    if (!ts) return "";
    const diff = Date.now() - new Date(ts).getTime();
    const m = 60 * 1000,
      h = 60 * m,
      d = 24 * h;
    if (diff < m) return "방금 전";
    if (diff < h) return `${Math.floor(diff / m)}분 전`;
    if (diff < d) return `${Math.floor(diff / h)}시간 전`;
    return `${Math.floor(diff / d)}일 전`;
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className={styles.postDetailContainer}>
      <button onClick={() => nav(-1)} className={styles.backButton}>
        <i className="fa-solid fa-arrow-left"></i>{t("postDetail.back")}
      </button>

      <div className={styles.mkdetailWrap}>
        <div className={styles.mkdetailTitle}>{post.title}</div>
        <div className={styles.mkdetailBody}>{post.content}</div>

        {post.attachments?.length > 0 && (
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

        <div className={styles.mkmetaRow} style={{ marginTop: 8 }}>
          <div className={styles.mkmetaLeft}>
            {post.author && (
              <div className={styles.mkmetaItem}>{post.author}</div>
            )}
            <div className={styles.mkmetaItem}>
              <i className="fa-regular fa-clock" /> {timeAgo(post.created_at)}
            </div>
            <div className={styles.mkmetaItem}>
              <i className="fa-regular fa-comment" /> {post.comment_count}
            </div>
            <button
              type="button"
              className={styles.mkmetaItem}
              onClick={toggleLike}
              style={{
                display: "inline-flex",
                gap: 6,
                alignItems: "center",
                cursor: "pointer",
                background: "transparent",
                border: 0,
                padding: 0,
              }}
            >
              <i
                className={liked ? "fa-solid fa-heart" : "fa-regular fa-heart"}
                style={{ color: liked ? "#ff0505" : "inherit" }}
              />
              {post.like_count}
            </button>
            <div className={styles.mkmetaItem}>
              <i className="fa-regular fa-eye" /> {post.views}
            </div>
          </div>
        </div>

        {/* 댓글 입력 */}
        <div className={styles.mkcommentsSection}>
          <input
            className={styles.mkcommentInputBar}
            type="text"
            placeholder="댓글을 입력하세요."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addComment();
              }
            }}
          />
          <button type="button" onClick={addComment}>
            등록
          </button>

          <div className={styles.mkcommentsList}>
            {comments.map((c) => (
              <div key={c.postcomment_id} className={styles.mkcommentItem}>
                <div className={styles.mkcommentMeta}>
                  <span>{c.author ?? "익명"}</span>
                  <span>{timeAgo(c.created_at)}</span>
                </div>
                <div>{c.content}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.postDetailIcons}>
        <i className="fa-solid fa-message"></i>
        <span>{t("postDetail.comment")} {post.comment_count}</span>
        <i className="fa-regular fa-heart"></i>
        <span>{t("postDetail.like")} {post.like_count}</span>
      </div>

      <div className={styles.postAd}>{t("postDetail.ad")}</div>

      <div className={styles.postDetailComments}>
        {post.comments?.map((c) => (
          <PostComment key={c.postcomment_id} comment={c} />
        ))}
      </div>
    </div>
  );
}

export default PostDetail;
