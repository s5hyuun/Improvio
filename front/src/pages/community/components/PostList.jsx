import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "../../../styles/Market.module.css";
import PostWrite from "./PostWrite";

const LS_KEY = "liked_posts";

/** 로컬스토리지 좋아요 집합 */
function readLikedSet() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(arr);
  } catch {
    return new Set();
  }
}

function PostList() {
  const { boardId } = useParams();
  const nav = useNavigate();

  const [posts, setPosts] = useState([]);
  const [isWriting, setIsWriting] = useState(false);

  // ✅ 숫자/문자 → 키 매핑
  const norm = (id = "") => {
    const s = String(id).toLowerCase();
    const numMap = {
      1: "free",
      2: "rookie",
      3: "secret",
      4: "info",
      5: "market",
      6: "issue",
    };
    if (numMap[s]) return numMap[s];

    if (["free", "자유", "자유게시판"].includes(s)) return "free";
    if (["rookie", "newbie", "new", "junior", "신입", "신입게시판"].includes(s))
      return "rookie";
    if (["secret", "private", "비밀", "비밀게시판"].includes(s))
      return "secret";
    if (["info", "information", "tips", "정보", "정보게시판"].includes(s))
      return "info";
    if (["market", "장터", "장터게시판"].includes(s)) return "market";
    if (
      [
        "issue",
        "issues",
        "current",
        "news",
        "시사",
        "시사/이슈",
        "이슈",
      ].includes(s)
    )
      return "issue";
    return "etc";
  };

  // ✅ 보드 메타(아이콘 + 타이틀)
  const boardMeta = useMemo(() => {
    const key = norm(boardId);
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

  // ✅ 목록 API + 로컬 좋아요 반영
  useEffect(() => {
    let aborted = false;
    fetch(`http://localhost:5000/api/posts?board_id=${boardId}`)
      .then((res) => res.json())
      .then((data) => {
        if (aborted) return;
        const likedSet = readLikedSet();
        const merged = (data ?? []).map((p) => ({
          ...p,
          _liked: likedSet.has(String(p.post_id)),
          like_count: p.like_count ?? p.likes ?? 0,
        }));
        setPosts(merged);
      })
      .catch((err) => console.error(err));
    return () => {
      aborted = true;
    };
  }, [boardId]);

  // ✅ PostDetail에서 발생한 좋아요 이벤트 반영
  useEffect(() => {
    const handler = (e) => {
      const { postId, liked, like_count } = e.detail || {};
      if (!postId) return;
      setPosts((prev) =>
        prev.map((p) =>
          String(p.post_id) === String(postId)
            ? {
                ...p,
                _liked: liked ?? p._liked,
                like_count:
                  typeof like_count === "number"
                    ? like_count
                    : Math.max(0, (p.like_count ?? 0) + (liked ? 1 : -1)),
              }
            : p
        )
      );
    };
    window.addEventListener("post:likeToggled", handler);
    return () => window.removeEventListener("post:likeToggled", handler);
  }, []);

  // ✅ 등록 API (PostWrite에서 onSubmit 호출 시 사용)
  const handleSubmit = async (newPost) => {
    const authUser = JSON.parse(localStorage.getItem("auth_user"));
    if (!authUser?.user_id) {
      alert("로그인 후 글을 작성해주세요.");
      return;
    }
    const res = await fetch("http://localhost:5000/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        board_id: boardId,
        user_id: authUser.user_id,
        ...newPost,
      }),
    });
    if (res.ok) {
      const saved = await res.json();
      setPosts((prev) => [
        {
          ...saved,
          _liked: false,
          like_count: saved.like_count ?? saved.likes ?? 0,
        },
        ...prev,
      ]);
      setIsWriting(false);
    }
  };

  // ✅ 시간 표기
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

      {/* 리스트 */}
      <div className={styles.mklist}>
        {posts.map((post, idx) => {
          const title = post.title ?? "";
          const body = post.content ?? post.body ?? "";
          const created = post.created_at ?? post.createdAt ?? Date.now();
          const comments = post.comment_count ?? post.comments ?? 0;
          const views = post.views ?? 0;
          const likes = post.like_count ?? post.likes ?? 0;
          const isLiked = !!post._liked;

          return (
            <div
              key={post.post_id}
              className={`${styles.mkcard} ${
                idx === 0 ? styles.mkfirstCard : ""
              }`}
              onClick={() => nav(`/community/${post.post_id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") &&
                nav(`/community/${post.post_id}`)
              }
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

                    {/* ❤️ 눌렀다는 표시(색만 변경) */}
                    <div className={styles.mkmetaItem}>
                      <i
                        className={
                          isLiked ? "fa-solid fa-heart" : "fa-regular fa-heart"
                        }
                        aria-hidden="true"
                        style={{ color: isLiked ? "#ff0505" : "inherit" }}
                        title={isLiked ? "좋아요 누름" : "좋아요 안 누름"}
                      />
                      {likes}
                    </div>
                  </div>
                </div>
              </div>
              {/* 필요 시 썸네일:
              <div className={styles.mkthumb} aria-hidden="true">사진</div> */}
            </div>
          );
        })}
      </div>

      {/* 글쓰기 모달 */}
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
