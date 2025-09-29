// src/pages/Community/PostList.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
// PostWrite는 쓰지 않지만, 나중을 위해 import 남겨도 되고 제거해도 됩니다.
// import PostWrite from "./PostWrite";
import styles from "../../../styles/Market.module.css"; // ✅ mk 스타일 사용

function PostList() {
  const { boardId } = useParams();
  const nav = useNavigate();

  const [posts, setPosts] = useState([]);
  const [isWriting, setIsWriting] = useState(false);

  // 원본의 보드 타이틀 로직 유지(아이콘 제거, 숫자만 표시)
  const norm = (id = "") => {
    const s = String(id).toLowerCase();
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

  // ✅ 원본 로직 그대로: 목록 API
  useEffect(() => {
    fetch(`http://localhost:5000/api/posts?board_id=${boardId}`)
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch((err) => console.error(err));
  }, [boardId]);

  // ✅ 원본 로직 그대로: 등록 API (모달 내용이 없으므로 지금은 호출되지 않지만 로직은 보관)
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

  // 시간 표기(원본에는 없었지만 카드 UI엔 필요하니 간단히 처리)
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
      {/* ✅ mk 스타일 헤더 (구조/클래스네임 변경) */}
      <div className={styles.mkheader} style={{ position: "relative" }}>
        {boardMeta.title}
        <span> ({posts?.length ?? 0})</span>
        <button
          type="button"
          className={styles.mkwriteBtn}
          onClick={() => setIsWriting(true)}
          style={{ cursor: "pointer", zIndex: 1 }}
        >
          글쓰기
        </button>
      </div>

      {/* ✅ mk 카드 리스트 (구조/클래스네임 변경) */}
      <div className={styles.mklist}>
        {posts.map((post, idx) => {
          // 백엔드 필드명 그대로 사용 (원본 로직 유지)
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

              {/* 썸네일이 필요하면 mkthumb 영역 사용
              <div className={styles.mkthumb} aria-hidden="true">
                사진
              </div> */}
            </div>
          );
        })}
      </div>

      {/* ✅ 빈 모달(내용 불필요 요구) — 필요 시 PostWrite 넣으면 됨 */}
      {isWriting && (
        <div
          className={styles.mkmodalOverlay}
          onClick={(e) => e.target === e.currentTarget && setIsWriting(false)}
        >
          <div className={styles.mkmodalPanel}>
            <div className={styles.mkmodalHeader}>
              <h2 className={styles.mkmodalTitle}>글쓰기</h2>
              <button
                type="button"
                className={styles.mkcloseBtn}
                onClick={() => setIsWriting(false)}
                aria-label="닫기"
              >
                ✕
              </button>
            </div>
            {/* 여기 내용은 비워둠(요청 사항). 필요하면 PostWrite로 교체 */}
            {/* <PostWrite onSubmit={handleSubmit} onCancel={() => setIsWriting(false)} /> */}
          </div>
        </div>
      )}
    </>
  );
}

export default PostList;
