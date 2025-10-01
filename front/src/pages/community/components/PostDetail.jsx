import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import PostComment from "./PostComment";
import styles from "../../../styles/Community.module.css";
import { useTranslation } from "react-i18next"; 

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

  return (
    <div className={styles.postDetailContainer}>
      <button onClick={() => nav(-1)} className={styles.backButton}>
        <i className="fa-solid fa-arrow-left"></i>{t("postDetail.back")}
      </button>

      <div className={styles.postDetailContent}>
        <h2>{post.title}</h2>
        <p>{post.content}</p>
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
