import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import styles from "../../../styles/Market.module.css";
import { useTranslation } from "react-i18next";

// 로컬스토리지 / 세션 관리
const LS_LIKED_POSTS = "liked_posts";
const LS_POST_DELTAS = "post_count_deltas";
const SS_VIEW_KEY_PREFIX = "viewed_";

// ---------------- 유틸 ----------------
function readDeltas() {
  try { return JSON.parse(localStorage.getItem(LS_POST_DELTAS)) || {}; } catch { return {}; }
}
function writeDeltas(obj) { try { localStorage.setItem(LS_POST_DELTAS, JSON.stringify(obj)); } catch {} }
function bumpDelta(postId, key, amount) {
  const all = readDeltas();
  const id = String(postId);
  all[id] = all[id] || { likes: 0, views: 0, comments: 0 };
  all[id][key] = (all[id][key] || 0) + amount;
  if (key !== "views" && all[id][key] < 0) all[id][key] = 0;
  writeDeltas(all);
  return all[id];
}
function getDisplayCount(serverValue, deltaValue) {
  const s = Number.isFinite(serverValue) ? serverValue : 0;
  const d = Number.isFinite(deltaValue) ? deltaValue : 0;
  return Math.max(0, s + d);
}
function readLikedSet() { try { const raw = localStorage.getItem(LS_LIKED_POSTS); return new Set(raw ? JSON.parse(raw) : []); } catch { return new Set(); } }
function writeLikedSet(set) { try { localStorage.setItem(LS_LIKED_POSTS, JSON.stringify(Array.from(set))); } catch {} }

// ---------------- DeepL 번역 ----------------
async function translateText(text, lang) {
  if (!text) return "";
  try {
    const res = await fetch("http://localhost:5000/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, targetLang: lang.toUpperCase() }),
    });
    const data = await res.json();
    return data?.translatedText ?? text;
  } catch (err) {
    console.error("번역 실패:", err);
    return text;
  }
}

// ---------------- PostDetail ----------------
function PostDetail() {
  const { postId } = useParams();
  const nav = useNavigate();
  const { i18n } = useTranslation();
  const lang = i18n.language || "ko";

  const [post, setPost] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [liked, setLiked] = useState(false);

  // ---------------- 게시글 로드 + 번역 ----------------
  useEffect(() => {
    let mounted = true;
    const idStr = String(postId);

    async function fetchAndTranslate() {
      try {
        let data = await fetch(`http://localhost:5000/api/posts/${idStr}`).then((res) => res.json());
        if (!mounted) return;

        // 번역 적용
        if (lang !== "ko") {
          data.title = await translateText(data?.title ?? "", lang);
          data.content = await translateText(data?.content ?? data?.body ?? "", lang);

          if (Array.isArray(data.comments)) {
            data.comments = await Promise.all(
              data.comments.map(async (c) => ({
                ...c,
                content: await translateText(c.content ?? c.text ?? "", lang),
              }))
            );
          }
        }

        // 좋아요 초기화
        const likedSet = readLikedSet();
        setLiked(!!(data?.user_liked ?? likedSet.has(idStr)));

        // 조회수 처리
        const ssKey = `${SS_VIEW_KEY_PREFIX}${idStr}`;
        if (sessionStorage.getItem(ssKey) !== "1") {
          sessionStorage.setItem(ssKey, "1");
          const after = bumpDelta(idStr, "views", 1);
          const nextViews = getDisplayCount(data?.views, after.views);
          try { window.dispatchEvent(new CustomEvent("post:viewIncreased", { detail: { postId: idStr, views: nextViews } })); } catch {}
        }

        setPost(data);
      } catch (err) {
        console.error(err);
      }
    }

    fetchAndTranslate();

    return () => { mounted = false; };
  }, [postId, lang]);

  // ---------------- 댓글 등록 ----------------
  const addComment = async () => {
    const idStr = String(post.post_id ?? postId);
    if (!newComment.trim()) return;

    try {
      const res = await fetch(`http://localhost:5000/api/posts/${idStr}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment.trim(), user_id: 1 }),
      });
      let saved = await res.json();

      if (lang !== "ko") {
        saved.content = await translateText(saved.content ?? "", lang);
      }

      setPost((prev) => ({
        ...prev,
        comments: [...(prev?.comments ?? []), saved],
        comment_count: (prev?.comment_count ?? prev?.comments?.length ?? 0) + 1,
      }));

      const after = bumpDelta(idStr, "comments", 1);
      const nextComments = getDisplayCount(post?.comment_count ?? (post?.comments?.length ?? 0) + 1, after.comments);

      try { window.dispatchEvent(new CustomEvent("post:commentAdded", { detail: { postId: idStr, comment_count: nextComments } })); } catch {}
      setNewComment("");
    } catch (err) {
      console.error("댓글 등록 실패:", err);
    }
  };

  // ---------------- 좋아요 토글 ----------------
  const toggleLike = () => {
    const idStr = String(post.post_id ?? postId);
    const likedSet = readLikedSet();
    const willLike = !liked;

    setLiked(willLike);
    bumpDelta(idStr, "likes", willLike ? 1 : -1);
    const del = readDeltas()[idStr] || { likes: 0, views: 0, comments: 0 };
    const nextLikeCount = getDisplayCount(post?.like_count ?? post?.likes, del.likes);

    if (willLike) likedSet.add(idStr); else likedSet.delete(idStr);
    writeLikedSet(likedSet);

    try { window.dispatchEvent(new CustomEvent("post:likeToggled", { detail: { postId: idStr, liked: willLike, like_count: nextLikeCount } })); } catch {}
  };

  // ---------------- 시간 포맷 ----------------
  const timeAgo = (ts) => {
    if (!ts) return "";
    const t = new Date(ts).getTime();
    const diff = Date.now() - t;
    const m = 60 * 1000, h = 60 * m, d = 24 * h;
    if (diff < m) return "방금 전";
    if (diff < h) return `${Math.floor(diff / m)}분 전`;
    if (diff < d) return `${Math.floor(diff / h)}시간 전`;
    return `${Math.floor(diff / d)}일 전`;
  };

  if (!post) return <div>Loading...</div>;

  const deltas = readDeltas()[String(post.post_id ?? postId)] || { likes: 0, views: 0, comments: 0 };
  const likeCount = getDisplayCount(post?.like_count ?? post?.likes, deltas.likes);
  const viewCount = getDisplayCount(post?.views, deltas.views);
  const totalComments = getDisplayCount(post?.comment_count ?? post?.comments?.length ?? 0, deltas.comments);

  return (
    <>
      <button className={styles.mkbackBtn} onClick={() => nav(-1)}>
        ← {post.board_title ?? "게시판"} 목록
      </button>

      <div className={styles.mkdetailWrap}>
        <div className={`${styles.mkmetaRow} ${styles.mkdetailTop}`} />

        <div className={styles.mkdetailTitle}>{post.title}</div>
        <div className={styles.mkdetailBody}>{post.content}</div>

        {post.attachments && post.attachments.length > 0 && (
          <div className={styles.mkAttachments}>
            {post.attachments.map((att) => (
              <div key={att.attachment_id} className={styles.mkAttachmentItem}>
                <img src={`http://localhost:5000${att.file_path}`} alt="첨부이미지" className={styles.mkAttachmentImg} />
              </div>
            ))}
          </div>
        )}

        <div className={styles.mkmetaRow} style={{ marginTop: 8 }}>
          <div className={styles.mkmetaLeft}>
            {post.author && <div className={styles.mkmetaItem}>{post.author}</div>}
            {post.created_at && (
              <div className={styles.mkmetaItem}>
                <i className="fa-regular fa-clock" aria-hidden="true" />
                {timeAgo(post.created_at)}
              </div>
            )}
            <div className={styles.mkmetaItem}>
              <i className="fa-regular fa-comment" aria-hidden="true" />
              {totalComments}
            </div>
            <button
              type="button"
              className={styles.mkmetaItem}
              onClick={toggleLike}
              aria-label={liked ? "좋아요 취소" : "좋아요"}
              style={{ display: "inline-flex", gap: 6, alignItems: "center", cursor: "pointer", background: "transparent", border: 0, padding: 0 }}
            >
              <i className={liked ? "fa-solid fa-heart" : "fa-regular fa-heart"} aria-hidden="true" style={{ color: liked ? "#ff0505" : "inherit" }} />
              {likeCount}
            </button>
            <div className={styles.mkmetaItem}>
              <i className="fa-regular fa-eye" aria-hidden="true" />
              {viewCount}
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
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addComment(); } }}
            />
            <div className={styles.mkcommentSide}>
              <button className={styles.mksendBtn} type="button" onClick={addComment} aria-label="댓글 등록">
                <i className="fa-solid fa-pen" />
              </button>
            </div>
          </div>

          <div className={styles.mkcommentsList}>
            {(post.comments ?? []).map((c) => (
              <div key={c.postcomment_id} className={styles.mkcommentItem}>
                <div className={styles.mkcommentHead}>
                  <div className={styles.mkcommentAvatar} />
                  <div className={styles.mkcommentMeta}>
                    <div className={styles.mkcommentAuthor}>{c.author ?? c.user_name ?? "익명"}</div>
                    <div className={styles.mkcommentTime}>{timeAgo(c.created_at)}</div>
                  </div>
                </div>
                <div className={styles.mkcommentBody} style={{ whiteSpace: "pre-wrap" }}>{c.content}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default PostDetail;
