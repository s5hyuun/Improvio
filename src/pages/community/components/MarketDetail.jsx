import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "../../../styles/Market.module.css";

const META_KEY = "market_meta_v1";
const COMMENTS_KEY = "market_comments_v1";
const MS = { m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };

const readMetaStore = () => {
  try { return JSON.parse(localStorage.getItem(META_KEY)) || {}; }
  catch { return {}; }
};
const writeMetaStore = (obj) => localStorage.setItem(META_KEY, JSON.stringify(obj));
const patchMeta = (id, patch) => {
  const store = readMetaStore();
  store[id] = { ...(store[id] || {}), ...patch };
  writeMetaStore(store);
  window.dispatchEvent(new CustomEvent("market_meta_updated", { detail: { id, meta: store[id] } }));
  return store[id];
};

const readCommentsStore = () => {
  try { return JSON.parse(localStorage.getItem(COMMENTS_KEY)) || {}; }
  catch { return {}; }
};
const writeCommentsStore = (obj) => localStorage.setItem(COMMENTS_KEY, JSON.stringify(obj));
const getCommentsByPost = (postId) => (readCommentsStore()[postId] || []);
const setCommentsByPost = (postId, list) => {
  const all = readCommentsStore();
  all[postId] = list;
  writeCommentsStore(all);
  return list;
};

const timeAgo = (ts) => {
  const diff = Date.now() - ts;
  if (diff < MS.m) return "방금 전";
  if (diff < MS.h) return `${Math.floor(diff / MS.m)}분 전`;
  if (diff < MS.d) return `${Math.floor(diff / MS.h)}시간 전`;
  return `${Math.floor(diff / MS.d)}일 전`;
};
const parseRelativeToCreatedAt = (str) => {
  const m = /(\d+)\s*(분|시간|일)/.exec(str || "");
  if (!m) return Date.now();
  const n = Number(m[1]);
  const unit = m[2];
  const ms = unit === "분" ? n * MS.m : unit === "시간" ? n * MS.h : n * MS.d;
  return Date.now() - ms;
};

export default function MarketDetail() {
  const { postId } = useParams();
  const id = Number(postId);
  const nav = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [meta, setMeta] = useState(() => readMetaStore()[id] || {});
  const addLockRef = useRef(false); 

  const fallback = useMemo(
    () => ({
      88156: { id: 88156, title: "제목 자리 입니다..", body: "내용 자리 입니다….", time: "6시간 전", likes: 0, images: ["사진"], author: "익명 88156" },
      81113: { id: 81113, title: "제목 자리 입니다..", body: "내용 자리 입니다….", time: "12시간 전", likes: 0, images: ["사진"], author: "익명 81113" },
      80421: { id: 80421, title: "제목 자리 입니다..", body: "내용 자리 입니다….", time: "2일 전", likes: 0, images: ["사진"], author: "익명 80421" },
    }),
    []
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");

        const data = fallback[id];
        if (!data) throw new Error("게시글을 찾을 수 없습니다.");
        if (alive) setPost(data);

        const loadedComments = getCommentsByPost(id);
        if (alive) setComments(loadedComments);

        const store = readMetaStore();
        const initial = store[id] || {
          createdAt: parseRelativeToCreatedAt(data.time),
          likes: 0,
          comments: loadedComments.filter((c) => !c.deleted).length,
          liked: false,
        };
        const fixed = patchMeta(id, initial);
        if (alive) setMeta(fixed);
      } catch (e) {
        if (alive) setErr(e.message || "불러오기 실패");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id, fallback]);

  const totalComments = comments.filter((c) => !c.deleted).length;

  const submitRootComment = () => {
    if (addLockRef.current) return;
    addLockRef.current = true;
    setTimeout(() => (addLockRef.current = false), 350);

    const text = newComment.trim();
    if (!text) return;

    const item = {
      id: Date.now(),
      author: "익명",
      text,
      likes: 0,
      liked: false,
      deleted: false,
      createdAt: Date.now(),
    };
    const next = [item, ...comments].sort((a, b) => (b.createdAt ?? b.id) - (a.createdAt ?? a.id));
    setComments(next);
    setCommentsByPost(id, next);
    setNewComment("");

    const nextMeta = patchMeta(id, { comments: next.filter((c) => !c.deleted).length });
    setMeta(nextMeta);
  };

  const togglePostLike = () => {
    const curr = readMetaStore()[id] || {};
    const liked = !curr.liked;
    const likes = Math.max(0, (curr.likes || 0) + (liked ? 1 : -1));
    const nextMeta = patchMeta(id, { liked, likes });
    setMeta(nextMeta);
  };

  const toggleCommentLike = (cid) => {
    const next = comments.map((c) => {
      if (c.id !== cid || c.deleted) return c;
      const liked = !c.liked;
      const likes = Math.max(0, (c.likes || 0) + (liked ? 1 : -1));
      return { ...c, liked, likes };
    });
    setComments(next);
    setCommentsByPost(id, next);
  };

  if (loading) {
    return (
      <div className={styles.detailWrap}>
        <div className={`${styles.metaRow} ${styles.detailTop}`}>
          <button className={styles.backBtn} onClick={() => nav(-1)}>← 목록</button>
        </div>
        <div className={styles.detailBody}>불러오는 중…</div>
      </div>
    );
  }
  if (err || !post) {
    return (
      <div className={styles.detailWrap}>
        <div className={`${styles.metaRow} ${styles.detailTop}`}>
          <button className={styles.backBtn} onClick={() => nav(-1)}>← 목록</button>
        </div>
        <div className={styles.detailBody} style={{ color: "crimson" }}>
          {err || "게시글을 불러오지 못했습니다."}
        </div>
      </div>
    );
  }

  const timeText = timeAgo(meta.createdAt || Date.now());

  return (
    <div className={styles.detailWrap}>
      <div className={`${styles.metaRow} ${styles.detailTop}`}>
        <button className={styles.backBtn} onClick={() => nav(-1)}>← 목록</button>
      </div>

      <div className={styles.detailTitle}>{post.title}</div>
      <div className={styles.detailBody}>{post.body}</div>

      {Array.isArray(post.images) && post.images.length > 0 && (
        <div className={styles.imageWrap}>{post.images[0]}</div>
      )}

      <div className={styles.metaRow} style={{ marginTop: 8 }}>
        <div className={styles.metaLeft}>
          <div className={styles.metaItem}>{post.author}</div>
          <div className={styles.metaItem}>
            <i className="fa-regular fa-clock" aria-hidden="true" />
            {timeText}
          </div>

          <button
            className={`${styles.metaItem} ${meta.liked ? styles.liked : ""}`}
            onClick={togglePostLike}
            aria-pressed={!!meta.liked}
            title={meta.liked ? "좋아요 취소" : "좋아요"}
            type="button"
            style={{
              background: "none",
              border: 0,
              cursor: "pointer",
              padding: 0,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              font: "inherit",
              color: "inherit",
              lineHeight: 1,
            }}
          >
            <i
              className={meta.liked ? "fa-solid fa-heart" : "fa-regular fa-heart"}
              style={{ color: meta.liked ? "rgb(239, 68, 68)" : "#2563eb" }}
            />
            <span className={styles.likeNum}>{meta.likes ?? 0}</span>
          </button>

          <div className={styles.metaItem}>
            <i className="fa-regular fa-comment" />
            {totalComments}
          </div>
        </div>
      </div>

      <div className={styles.commentsSection}>
        <div className={styles.commentsHeader}>
          댓글 <span className={styles.commentsCount}>{totalComments}</span>
        </div>

        <div className={styles.commentDock}>
          <input
            className={styles.commentInputBar}
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
          <div className={styles.commentSide}>
            <button className={styles.sendBtn} type="button" onClick={submitRootComment} aria-label="댓글 등록">
              <i className="fa-solid fa-pen"></i>
            </button>
          </div>
        </div>

        <div className={styles.commentsList}>
          {comments.map((c) =>
            c.deleted ? (
              <div key={c.id} className={`${styles.commentItem} ${styles.deletedItem}`}>삭제된 댓글입니다.</div>
            ) : (
              <div key={c.id} className={styles.commentItem}>
                <div className={styles.commentHead}>
                  <div className={styles.commentAvatar} />
                  <div className={styles.commentMeta}>
                    <div className={styles.commentAuthor}>{c.author}</div>
                    <div className={styles.commentTime}>{timeAgo(c.createdAt)}</div>
                  </div>
                </div>

                <div className={styles.commentBody} style={{ whiteSpace: "pre-wrap" }}>
                  {c.text}
                </div>

                <div className={styles.commentFoot}>
                  <button
                    type="button"
                    onClick={() => toggleCommentLike(c.id)}
                    className={`${styles.likeWrap} ${c.liked ? styles.liked : ""}`}
                    aria-pressed={!!c.liked}
                    title={c.liked ? "공감 취소" : "공감"}
                    style={{ cursor: "pointer", background: "none", border: 0, padding: 0 }}
                  >
                    <i className={c.liked ? "fa-solid fa-heart" : "fa-regular fa-heart"} />
                    <em className={styles.likeCount}>{c.likes}</em>
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
