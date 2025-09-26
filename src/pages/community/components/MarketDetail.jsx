import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "../../../styles/Market.module.css";

const LS_KEY = "market_meta_v1";
const MS = { m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
const HEART_COLOR = "rgb(239, 68, 68)"; // #ef4444

function readStore() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; }
  catch { return {}; }
}
function writeStore(obj) { localStorage.setItem(LS_KEY, JSON.stringify(obj)); }
function patchStore(id, patch) {
  const store = readStore();
  store[id] = { ...(store[id] || {}), ...patch };
  writeStore(store);
  return store[id];
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  if (diff < MS.m) return "방금 전";
  if (diff < MS.h) return `${Math.floor(diff / MS.m)}분 전`;
  if (diff < MS.d) return `${Math.floor(diff / MS.h)}시간 전`;
  return `${Math.floor(diff / MS.d)}일 전`;
}
function parseRelativeToCreatedAt(str) {
  const m = /(\d+)\s*(분|시간|일)/.exec(str || "");
  if (!m) return Date.now();
  const n = Number(m[1]);
  const unit = m[2];
  const ms = unit === "분" ? n * MS.m : unit === "시간" ? n * MS.h : n * MS.d;
  return Date.now() - ms;
}
function countAllComments(list) {
  let total = 0;
  for (const c of list) {
    total += 1;
    if (Array.isArray(c.replies)) total += c.replies.length;
  }
  return total;
}

export default function MarketDetail() {
  const { postId } = useParams();
  const id = Number(postId);
  const nav = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyOpen, setReplyOpen] = useState({});
  const [replyDraft, setReplyDraft] = useState({});
  const [meta, setMeta] = useState(() => readStore()[id] || {});

  const fallback = useMemo(() => ({
    88156: { id: 88156, title: "제목 자리 입니다..", body: "내용 자리 입니다….", time: "6시간 전", likes: 67, images: ["사진"], author: "익명 88156" },
    81113: { id: 81113, title: "제목 자리 입니다..", body: "내용 자리 입니다….", time: "12시간 전", likes: 11, images: ["사진"], author: "익명 81113" },
    80421: { id: 80421, title: "제목 자리 입니다..", body: "내용 자리 입니다….", time: "2일 전", likes: 45, images: ["사진"], author: "익명 80421" },
  }), []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true); setErr("");
        const data = fallback[id];
        if (!data) throw new Error("게시글을 찾을 수 없습니다.");
        if (alive) setPost(data);

        const now = Date.now();
        const seed = [
          {
            id: 2, author: "익명3", time: "09/25 01:00", text: "?",
            likes: 5, liked: false, deleted: false, createdAt: now - 15 * 60 * 1000,
            replies: [
              { id: 21, author: "익명(글쓴이)", isWriter: true, time: "09/25 01:01", text: "??", likes: 36, liked: false, createdAt: now - 14 * 60 * 1000 },
            ],
          },
          { id: 3, author: "익명16", time: "09/25 01:05", text: "???", likes: 0, liked: false, deleted: false, createdAt: now - 10 * 60 * 1000, replies: [] },
        ].sort((a, b) => (b.createdAt ?? b.id) - (a.createdAt ?? a.id));
        if (alive) setComments(seed);

        const store = readStore();
        const initial = store[id] || {
          createdAt: parseRelativeToCreatedAt(data.time),
          likes: data.likes ?? 0,
          comments: countAllComments(seed),
          liked: false,
        };
        patchStore(id, initial);
        if (alive) setMeta(initial);
      } catch (e) {
        if (alive) setErr(e.message || "불러오기 실패");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id, fallback]);

  const submitRootComment = () => {
    const text = newComment.trim();
    if (!text) return;
    const item = { id: Date.now(), author: "익명", time: "방금 전", text, likes: 0, liked: false, deleted: false, createdAt: Date.now(), replies: [] };
    const next = [item, ...comments].sort((a, b) => (b.createdAt ?? b.id) - (a.createdAt ?? a.id));
    setComments(next);
    setNewComment("");
    const total = countAllComments(next);
    const nextMeta = patchStore(id, { comments: total });
    setMeta(nextMeta);
  };

  const toggleReply = (cid) => setReplyOpen((p) => ({ ...p, [cid]: !p[cid] }));
  const submitReply = (cid) => {
    const text = (replyDraft[cid] || "").trim();
    if (!text) return;
    const reply = { id: Date.now(), author: "익명", time: "방금 전", text, likes: 0, liked: false, createdAt: Date.now() };
    const next = comments.map((c) => (c.id === cid ? { ...c, replies: [...c.replies, reply] } : c));
    setComments(next);
    setReplyDraft((d) => ({ ...d, [c.id]: "" }));
    setReplyOpen((o) => ({ ...o, [c.id]: false }));
    const total = countAllComments(next);
    const nextMeta = patchStore(id, { comments: total });
    setMeta(nextMeta);
  };

  const togglePostLike = () => {
    const curr = readStore()[id] || {};
    const liked = !curr.liked;
    const likes = Math.max(0, (curr.likes || 0) + (liked ? 1 : -1));
    const nextMeta = patchStore(id, { liked, likes });
    setMeta(nextMeta);
  };

  // ✅ 댓글 공감(버튼으로만 토글)
  const toggleCommentLike = (cid) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id !== cid) return c;
        const liked = !c.liked;
        const likes = Math.max(0, (c.likes || 0) + (liked ? 1 : -1));
        return { ...c, liked, likes };
      })
    );
  };

  // ✅ 대댓글 공감(버튼으로만 토글)
  const toggleReplyLike = (cid, rid) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id !== cid) return c;
        const replies = c.replies.map((r) => {
          if (r.id !== rid) return r;
          const liked = !r.liked;
          const likes = Math.max(0, (r.likes || 0) + (liked ? 1 : -1));
          return { ...r, liked, likes };
        });
        return { ...c, replies };
      })
    );
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
  const totalComments = countAllComments(comments);

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
            className={styles.metaItem}
            onClick={togglePostLike}
            aria-pressed={!!meta.liked}
            title={meta.liked ? "좋아요 취소" : "좋아요"}
            style={{ background: "none", border: 0, cursor: "pointer", padding: 0 }}
          >
            <i
              className={meta.liked ? "fa-solid fa-heart" : "fa-regular fa-heart"}
              style={{ color: meta.liked ? HEART_COLOR : "inherit" }}
            />
            {meta.likes ?? 0}
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
            onKeyDown={(e) => { if (e.key === "Enter") submitRootComment(); }}
          />
          <div className={styles.commentSide}>
            <button className={styles.sendBtn} onClick={submitRootComment} aria-label="댓글 등록">
              <i className="fa-solid fa-pen"></i>
            </button>
          </div>
        </div>

        <div className={styles.commentsList}>
          {comments.map((c) =>
            c.deleted ? (
              <div key={c.id} className={`${styles.commentItem} ${styles.deletedItem}`}>
                삭제된 댓글입니다.
              </div>
            ) : (
              <div key={c.id} className={styles.commentItem}>
                <div className={styles.commentHead}>
                  <div className={styles.commentAvatar} />
                  <div className={styles.commentMeta}>
                    <div className={styles.commentAuthor}>{c.author}</div>
                    <div className={styles.commentTime}>{timeAgo(c.createdAt)}</div>
                  </div>
                  <div className={styles.commentActRight}>
                    <button className={styles.linkBtn} onClick={() => toggleReply(c.id)}>대댓글</button>
                    {/* ✅ 오직 이 버튼으로만 공감 토글 */}
                    <button className={styles.linkBtn} onClick={() => toggleCommentLike(c.id)}>
                      공감
                    </button>
                    <button className={styles.linkBtn}>쪽지</button>
                    <button className={styles.linkBtn}>신고</button>
                  </div>
                </div>

                <div className={styles.commentBody} style={{ whiteSpace: "pre-wrap" }}>
                  {c.text}
                </div>

                {/* ✅ 하트 영역은 표시만 (클릭 없음) */}
                <div className={styles.commentFoot}>
                  <span className={`${styles.likeWrap} ${c.liked ? styles.liked : ""}`}>
                    <i
                      className={c.liked ? "fa-solid fa-heart" : "fa-regular fa-heart"}
                      style={{ color: c.liked ? HEART_COLOR : undefined }}
                    />
                    <em className={styles.likeCount}>{c.likes}</em>
                  </span>
                </div>

                {replyOpen[c.id] && (
                  <div className={styles.replyInputRow}>
                    <input
                      className={styles.replyInput}
                      type="text"
                      placeholder="대댓글을 입력하세요."
                      value={replyDraft[c.id] || ""}
                      onChange={(e) => setReplyDraft((d) => ({ ...d, [c.id]: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === "Enter") submitReply(c.id); }}
                    />
                    <button className={styles.replySendBtn} onClick={() => submitReply(c.id)}>
                      등록
                    </button>
                  </div>
                )}

                {Array.isArray(c.replies) && c.replies.length > 0 && (
                  <div className={styles.replyList}>
                    {c.replies.map((r) => (
                      <div key={r.id} className={styles.replyBox}>
                        <div className={styles.commentHead}>
                          <div className={styles.commentAvatarSm} />
                          <div className={styles.commentMeta}>
                            <div className={`${styles.commentAuthor} ${r.isWriter ? styles.writer : ""}`}>
                              {r.author}
                            </div>
                            <div className={styles.commentTime}>{timeAgo(r.createdAt)}</div>
                          </div>
                          <div className={styles.commentActRight}>
                            {/* ✅ 오직 이 버튼으로만 대댓글 공감 토글 */}
                            <button className={styles.linkBtn} onClick={() => toggleReplyLike(c.id, r.id)}>
                              공감
                            </button>
                            <button className={styles.linkBtn}>쪽지</button>
                            <button className={styles.linkBtn}>신고</button>
                          </div>
                        </div>
                        <div className={styles.commentBody} style={{ whiteSpace: "pre-wrap" }}>
                          {r.text}
                        </div>
                        <div className={styles.commentFoot}>
                          <span className={`${styles.likeWrap} ${r.liked ? styles.liked : ""}`}>
                            <i
                              className={r.liked ? "fa-solid fa-heart" : "fa-regular fa-heart"}
                              style={{ color: r.liked ? HEART_COLOR : undefined }}
                            />
                            <em className={styles.likeCount}>{r.likes ?? 0}</em>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
