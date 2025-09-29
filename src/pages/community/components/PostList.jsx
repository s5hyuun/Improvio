import React, { useEffect, useState, useMemo, useEffect as useEffect2 } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PostWrite from "./PostWrite"; 
import styles from "../../../styles/Market.module.css"; 

function PostList() {
  const { boardId } = useParams();
  const nav = useNavigate();

  const [posts, setPosts] = useState([]);
  const [isWriting, setIsWriting] = useState(false);

  useEffect(() => {
    if (isWriting) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => (document.body.style.overflow = prev);
    }
  }, [isWriting]);

  const norm = (id = "") => {
    const s = String(id).toLowerCase();
    if (["free", "자유", "자유게시판"].includes(s)) return "free";
    if (["rookie", "newbie", "new", "junior", "신입", "신입게시판"].includes(s)) return "rookie";
    if (["secret", "private", "비밀", "비밀게시판"].includes(s)) return "secret";
    if (["info", "information", "tips", "정보", "정보게시판"].includes(s)) return "info";
    if (["market", "장터", "장터게시판"].includes(s)) return "market";
    if (["issue", "issues", "current", "news", "시사", "시사/이슈", "이슈"].includes(s)) return "issue";
    return "etc";
  };

  const boardMeta = useMemo(() => {
    const key = norm(boardId);
    const map = {
      free: { title: "자유게시판" },
      rookie: { title: "신입게시판" },
      secret: { title: "비밀게시판" },
      info: { title: "정보게시판" },
      market: { title: "장터게시판" },
      issue: { title: "시사/이슈" },
      etc: { title: "게시판" },
    };
    return map[key] || map.etc;
  }, [boardId]);

  useEffect(() => {
    fetch(`http://localhost:3000/api/posts?board_id=${boardId}`)
      .then((res) => res.json())
      .then((data) => setPosts(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err));
  }, [boardId]);

  const handleSubmit = async ({ title, content, images = [], anonymous = false }) => {
    try {
      const form = new FormData();
      form.append("board_id", boardId);
      form.append("title", title);
      form.append("content", content);
      form.append("anonymous", String(anonymous));
      for (const f of images) form.append("images", f); 

      const res = await fetch("http://localhost:3000/api/posts", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`POST /api/posts failed: ${res.status} ${text}`);
      }

      const saved = await res.json();
      setPosts((prev) => [saved, ...prev]);
      setIsWriting(false);
    } catch (e) {
      console.error(e);
      alert("등록에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  const timeAgo = (ts) => {
    const t = new Date(ts || Date.now()).getTime();
    const diff = Date.now() - t;
    const m = 60 * 1000, h = 60 * m, d = 24 * h;
    if (diff < m) return "방금 전";
    if (diff < h) return `${Math.floor(diff / m)}분 전`;
    if (diff < d) return `${Math.floor(diff / h)}시간 전`;
    return `${Math.floor(diff / d)}일 전`;
  };

  return (
    <>
      <div className={styles.mkheader} style={{ position: "relative" }}>
        {boardMeta.title}
        <span> ({posts?.length ?? 0})</span>
        <button
          type="button"
          className={styles.mkwriteBtn}
          onClick={() => setIsWriting(true)}
          style={{ cursor: "pointer", zIndex: 1 }}
        >
        <i className="fa-solid fa-pen" aria-hidden="true" />
          글쓰기
        </button>
      </div>

      <div className={styles.mklist}>
        {posts.map((post, idx) => {
          const title = post.title ?? "";
          const body = post.content ?? post.body ?? "";
          const created = post.created_at ?? post.createdAt ?? Date.now();
          const comments = post.comments ?? post.comment_count ?? 0;
          const likes = post.likes ?? 0;
          const views = post.views ?? 0;

          return (
            <div
              key={post.post_id ?? `${title}-${idx}`}
              className={`${styles.mkcard} ${idx === 0 ? styles.mkfirstCard : ""}`}
              onClick={() => nav(`/community/${post.post_id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && nav(`/community/${post.post_id}`)}
            >
              <div className={styles.mkcardContent}>
                <div className={styles.mktitleRow}>
                  <div className={styles.mktitle}>{title}</div>
                </div>

                <div className={styles.mkbody}>{body}</div>

                <div className={styles.mkmetaRow}>
                  <div className={styles.mkmetaLeft}>
                    <div className={styles.mkmetaItem}>
                      <i className="fa-regular fa-clock" aria-hidden="true" />
                      {timeAgo(created)}
                    </div>
                  </div>
                  <div className={styles.mkmetaRight}>
                    <div className={styles.mkmetaItem}>
                      <i className="fa-regular fa-comment" aria-hidden="true" />
                      {comments}
                    </div>
                    <div className={styles.mkmetaItem}>
                      <i className="fa-regular fa-eye" aria-hidden="true" />
                      {views}
                    </div>
                    <div className={styles.mkmetaItem}>
                      <i className="fa-regular fa-heart" aria-hidden="true" />
                      {likes}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isWriting && (
        <PostWrite
          onSubmit={handleSubmit}
          onCancel={() => setIsWriting(false)}
        />
      )}
    </>
  );
}

export default PostList;
