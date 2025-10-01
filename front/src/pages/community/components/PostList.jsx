import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "../../../styles/Market.module.css";
import PostWrite from "./PostWrite";
import { useTranslation } from "react-i18next";

const LS_LIKED_POSTS = "liked_posts";
const LS_POST_DELTAS = "post_count_deltas";
const SS_VIEW_KEY_PREFIX = "viewed_";

// ------------------- 유틸 -------------------
function readDeltas() {
  try {
    return JSON.parse(localStorage.getItem(LS_POST_DELTAS)) || {};
  } catch {
    return {};
  }
}

function getDisplayCount(serverValue, deltaValue) {
  const s = Number.isFinite(serverValue) ? serverValue : 0;
  const d = Number.isFinite(deltaValue) ? deltaValue : 0;
  return Math.max(0, s + d);
}

function readLikedSet() {
  try {
    const raw = localStorage.getItem(LS_LIKED_POSTS);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

// ------------------- 번역 -------------------
async function translateText(text, lang) {
  try {
    const res = await fetch("http://localhost:5000/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, targetLang: lang.toUpperCase() }),
    });
    const data = await res.json();
    return data?.translatedText ?? text ?? "";
  } catch (err) {
    console.error("번역 실패:", err);
    return text ?? "";
  }
}

// ------------------- PostList 컴포넌트 -------------------
function PostList() {
  const { boardId } = useParams();
  const nav = useNavigate();
  const { t, i18n } = useTranslation();

  const [posts, setPosts] = useState([]);
  const [isWriting, setIsWriting] = useState(false);

  // ------------------- 게시판 메타 -------------------
  const boardMeta = useMemo(() => {
    const key = String(boardId ?? "").toLowerCase();
    const map = {
      free: { title: "자유게시판", icon: "fa-solid fa-message" },
      rookie: { title: "신입게시판", icon: "fa-solid fa-user-graduate" },
      secret: { title: "비밀게시판", icon: "fa-solid fa-lock" },
      info: { title: "정보게시판", icon: "fa-solid fa-circle-info" },
      market: { title: "장터게시판", icon: "fa-solid fa-cart-shopping" },
      issue: { title: "시사/이슈", icon: "fa-solid fa-newspaper" },
      etc: { title: "게시판", icon: "fa-solid fa-rectangle-list" },
    };
    return map[key] || map.etc;
  }, [boardId]);

  // ------------------- 게시글 로드 -------------------
  useEffect(() => {
    let aborted = false;
    const likedSet = readLikedSet();
    const deltas = readDeltas();

    async function fetchPosts() {
      try {
        let data = await fetch(`http://localhost:5000/api/posts?board_id=${boardId}`).then((res) => res.json());
        if (!Array.isArray(data)) data = [];

        const lang = i18n.language || "ko";

        // 번역 적용
        if (lang !== "ko") {
          data = await Promise.all(
            data.map(async (p) => ({
              ...p,
              title: await translateText(p.title ?? "", lang),
              content: await translateText(p.content ?? p.body ?? "", lang),
            }))
          );
        }

        // 로컬 델타 + 좋아요 적용
        const merged = data
          .map((p) => {
            if (!p || typeof p !== "object") return null;
            const id = String(p.post_id);
            const d = deltas[id] || { likes: 0, views: 0, comments: 0 };
            return {
              ...p,
              _liked: likedSet.has(id),
              like_count: getDisplayCount(p.like_count ?? p.likes, d.likes),
              comment_count: getDisplayCount(p.comment_count ?? p.comments, d.comments),
              views: getDisplayCount(p.views, d.views),
            };
          })
          .filter(Boolean); // null 제거

        if (!aborted) setPosts(merged);
      } catch (err) {
        console.error(err);
      }
    }

    fetchPosts();
    return () => {
      aborted = true;
    };
  }, [boardId, i18n.language]);

  // ------------------- 브로드캐스트 이벤트 -------------------
  useEffect(() => {
    const onLike = (e) => {
      const { postId, liked, like_count } = e.detail || {};
      if (!postId) return;
      setPosts((prev) =>
        prev.map((p) =>
          String(p.post_id) === String(postId)
            ? { ...p, _liked: !!liked, like_count: Math.max(0, like_count ?? p.like_count ?? 0) }
            : p
        )
      );
    };
    const onComment = (e) => {
      const { postId, comment_count } = e.detail || {};
      if (!postId) return;
      setPosts((prev) =>
        prev.map((p) =>
          String(p.post_id) === String(postId)
            ? { ...p, comment_count: Math.max(0, comment_count ?? (p.comment_count ?? 0) + 1) }
            : p
        )
      );
    };
    const onView = (e) => {
      const { postId, views } = e.detail || {};
      if (!postId) return;
      setPosts((prev) =>
        prev.map((p) =>
          String(p.post_id) === String(postId)
            ? { ...p, views: Math.max(0, views ?? (p.views ?? 0) + 1) }
            : p
        )
      );
    };

    window.addEventListener("post:likeToggled", onLike);
    window.addEventListener("post:commentAdded", onComment);
    window.addEventListener("post:viewIncreased", onView);

    return () => {
      window.removeEventListener("post:likeToggled", onLike);
      window.removeEventListener("post:commentAdded", onComment);
      window.removeEventListener("post:viewIncreased", onView);
    };
  }, []);

  // ------------------- 시간 포맷 -------------------
  const timeAgo = (ts) => {
    const t = new Date(ts || Date.now()).getTime();
    const diff = Date.now() - t;
    const m = 60 * 1000,
      h = 60 * m,
      d = 24 * h;
    if (diff < m) return "방금 전";
    if (diff < h) return `${Math.floor(diff / m)}분 전`;
    if (diff < d) return `${Math.floor(diff / h)}시간 전`;
    return `${Math.floor(diff / d)}일 전`;
  };

  // ------------------- 게시글 클릭 -------------------
  const openPost = (pid) => {
    const idStr = String(pid);
    const ssKey = `${SS_VIEW_KEY_PREFIX}${idStr}`;
    if (sessionStorage.getItem(ssKey) !== "1") {
      sessionStorage.setItem(ssKey, "1");
      setPosts((prev) =>
        prev.map((p) =>
          String(p.post_id) === idStr ? { ...p, views: (p.views ?? 0) + 1 } : p
        )
      );
      window.dispatchEvent(new CustomEvent("post:viewIncreased", { detail: { postId: idStr } }));
    }
    nav(`/community/${idStr}`);
  };

  return (
    <>
      {/* 헤더 */}
      <div className={styles.mkheader} style={{ position: "relative" }}>
        {boardMeta.icon && <i className={boardMeta.icon} aria-hidden="true" />}
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

      {/* 게시글 리스트 */}
      <div className={styles.mklist}>
        {posts.map((post, idx) => {
          const title = post.title ?? "";
          const body = post.content ?? post.body ?? "";
          const created = post.created_at ?? post.createdAt ?? Date.now();
          const comments = post.comment_count ?? 0;
          const views = post.views ?? 0;
          const likes = post.like_count ?? 0;
          const isLiked = !!post._liked;

          return (
            <div
              key={post.post_id}
              className={`${styles.mkcard} ${idx === 0 ? styles.mkfirstCard : ""}`}
              onClick={() => openPost(post.post_id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.isComposing) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openPost(post.post_id);
                }
              }}
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
                      <i
                        className={isLiked ? "fa-solid fa-heart" : "fa-regular fa-heart"}
                        aria-hidden="true"
                        style={{ color: isLiked ? "#ff0505" : "inherit" }}
                        title={isLiked ? "좋아요 누름" : "좋아요 안 누름"}
                      />
                      {likes}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 글쓰기 모달 */}
      {isWriting && (
        <PostWrite
          onSubmit={async (newPost) => {
            const authUser = JSON.parse(localStorage.getItem("auth_user"));
            if (!authUser?.user_id) {
              alert("로그인 후 글을 작성해주세요.");
              return;
            }
            const res = await fetch("http://localhost:5000/api/posts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ board_id: boardId, user_id: authUser.user_id, ...newPost }),
            });
            if (res.ok) {
              const saved = await res.json();
              setPosts((prev) => [
                { ...saved, _liked: false, like_count: saved.like_count ?? 0, comment_count: saved.comment_count ?? 0, views: saved.views ?? 0 },
                ...prev,
              ]);
              setIsWriting(false);
            }
          }}
          onCancel={() => setIsWriting(false)}
        />
      )}
    </>
  );
}

export default PostList;
