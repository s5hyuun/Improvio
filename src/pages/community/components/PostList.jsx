// src/pages/Community/PostList.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "../../../styles/Market.module.css"; // ✅ mk 스타일 사용
import PostWrite from "./PostWrite"; // ✅ 모달 컴포넌트 임포트 (경로 확인)

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

  // ✅ 목록 API
  useEffect(() => {
    fetch(`http://localhost:5000/api/posts?board_id=${boardId}`)
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch((err) => console.error(err));
  }, [boardId]);

  // ✅ 등록 API (PostWrite에서 onSubmit 호출 시 사용)
  const handleSubmit = async (newPost) => {
    const res = await fetch("http://localhost:5000/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ board_id: boardId, ...newPost }),
    });
    if (res.ok) {
      const saved = await res.json();
      setPosts((prev) => [saved, ...prev]);
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
          const comments = post.comments ?? post.comment_count ?? 0;
          const likes = post.likes ?? 0;
          const views = post.views ?? 0;

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
                    <div className={styles.mkmetaItem}>
                      <i className="fa-regular fa-heart" aria-hidden="true" />
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

      {/* 글쓰기 모달: PostWrite 자체가 오버레이/모달을 포함 */}
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
