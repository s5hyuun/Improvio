import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "../../../styles/Market.module.css";

const MS = { m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };

const timeAgo = (ts) => {
  const diff = Date.now() - new Date(ts).getTime();
  if (diff < MS.m) return "방금 전";
  if (diff < MS.h) return `${Math.floor(diff / MS.m)}분 전`;
  if (diff < MS.d) return `${Math.floor(diff / MS.h)}시간 전`;
  return `${Math.floor(diff / MS.d)}일 전`;
};

export default function MarketDetail() {
  const { postId } = useParams();
  const nav = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [newComment, setNewComment] = useState("");
  const addLockRef = useRef(false);

  // 게시글 불러오기
  useEffect(() => {
    let alive = true;
    const fetchPost = async () => {
      try {
        setLoading(true);
        setErr("");

        const res = await fetch(`http://localhost:5000/api/posts/${postId}`);
        if (!res.ok) throw new Error("게시글 불러오기 실패");
        const data = await res.json();
        if (!alive) return;

        setPost(data);

        // 댓글 불러오기
        const resComments = await fetch(
          `http://localhost:5000/api/posts/${postId}/comments`
        );
        if (!resComments.ok) throw new Error("댓글 불러오기 실패");
        const cData = await resComments.json();
        if (!alive) return;

        setComments(cData);
      } catch (e) {
        setErr(e.message || "불러오기 실패");
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchPost();
    return () => (alive = false);
  }, [postId]);

  const totalComments = comments.length;

  // 댓글 등록
  const submitRootComment = async () => {
    if (addLockRef.current) return;
    addLockRef.current = true;
    setTimeout(() => (addLockRef.current = false), 350);

    const text = newComment.trim();
    if (!text) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/posts/${postId}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, author: "익명" }),
        }
      );
      if (!res.ok) throw new Error("댓글 등록 실패");

      const saved = await res.json();
      setComments((prev) => [saved, ...prev]);
      setNewComment("");
    } catch (e) {
      console.error(e);
      alert("댓글 등록에 실패했습니다.");
    }
  };

  if (loading)
    return (
      <div className={styles.detailWrap}>
        <button className={styles.mkbackBtn} onClick={() => nav(-1)}>
          ← 장터게시판 목록
        </button>
        <div className={styles.detailBody}>불러오는 중…</div>
      </div>
    );

  if (err || !post)
    return (
      <div className={styles.detailWrap}>
        <button className={styles.mkbackBtn} onClick={() => nav(-1)}>
          ← 장터게시판 목록
        </button>
        <div className={styles.detailBody} style={{ color: "crimson" }}>
          {err || "게시글을 불러오지 못했습니다."}
        </div>
      </div>
    );

  return (
    <div className={styles.mkdetailWrap}>
      <button className={styles.mkbackBtn} onClick={() => nav(-1)}>
        ← 장터게시판 목록
      </button>

      <div className={styles.mkdetailTitle}>{post.title}</div>
      <div className={styles.mkdetailBody}>{post.content}</div>

      {post.images && post.images.length > 0 && (
        <div className={styles.mkimageWrap}>{post.images[0]}</div>
      )}

      <div className={styles.mkmetaRow} style={{ marginTop: 8 }}>
        <div className={styles.mkmetaLeft}>
          <div className={styles.mkmetaItem}>{post.author || "익명"}</div>
          <div className={styles.mkmetaItem}>
            <i className="fa-regular fa-clock" aria-hidden="true" />
            {timeAgo(post.createdAt)}
          </div>
          <div className={styles.mkmetaItem}>
            <i className="fa-regular fa-comment" /> {totalComments}
          </div>
        </div>
      </div>

      <div className={styles.mkcommentsSection}>
        <div className={styles.mkcommentsHeader}>
          댓글 <span className={styles.mkcommentsCount}>{totalComments}</span>
        </div>

        <div className={styles.mkcommentDock}>
          <input
            className={styles.mkcommentInputBar}
            type="text"
            placeholder="댓글을 입력하세요."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.isComposing) return;
              if (e.key === "Enter") {
                e.preventDefault();
                submitRootComment();
              }
            }}
          />
          <div className={styles.mkcommentSide}>
            <button
              className={styles.mksendBtn}
              type="button"
              onClick={submitRootComment}
            >
              <i className="fa-solid fa-pen"></i>
            </button>
          </div>
        </div>

        <div className={styles.mkcommentsList}>
          {comments.map((c) => (
            <div key={c.id} className={styles.mkcommentItem}>
              <div className={styles.mkcommentHead}>
                <div className={styles.mkcommentAvatar} />
                <div className={styles.mkcommentMeta}>
                  <div className={styles.mkcommentAuthor}>{c.author}</div>
                  <div className={styles.mkcommentTime}>
                    {timeAgo(c.createdAt)}
                  </div>
                </div>
              </div>
              <div
                className={styles.mkcommentBody}
                style={{ whiteSpace: "pre-wrap" }}
              >
                {c.text}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
