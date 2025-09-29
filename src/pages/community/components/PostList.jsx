import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Post from "./Post";
import PostWrite from "./PostWrite";
import styles from "../../../styles/Community.module.css";

function PostList() {
  const { boardId } = useParams();
  const nav = useNavigate();
  const [posts, setPosts] = useState([]);
  const [isWriting, setIsWriting] = useState(false);

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

  // 아이콘 제거: title만 사용
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
    fetch(`http://localhost:5000/api/posts?board_id=${boardId}`)
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch((err) => console.error(err));
  }, [boardId]);

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

  return (
    <>
      {/* 상단 헤더: 게시판 이름 + 글쓰기 버튼 (아이콘 없음) */}
      <div className={styles.commHeader}>
        <div className={styles.commHeaderLeft}>
          <span className={styles.commHeaderTitle}>{boardMeta.title}</span>
          <span className={styles.commHeaderCount}>({posts?.length ?? 0})</span>
        </div>
        <button
          type="button"
          className={styles.writeBtn}
          onClick={() => setIsWriting(true)}
        >
          글쓰기
        </button>
      </div>

      {/* 목록 */}
      <div className={styles.commPosts}>
        {posts.map((post) => (
          <Post
            key={post.post_id}
            onClick={() => nav(`/community/${post.post_id}`)}
            post={post}
          />
        ))}
      </div>

      {/* 글쓰기 모달 */}
      {isWriting && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <PostWrite
              onSubmit={handleSubmit}
              onCancel={() => setIsWriting(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default PostList;
