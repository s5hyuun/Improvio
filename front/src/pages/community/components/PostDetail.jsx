// PostDetail.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import styles from "../../../styles/Market.module.css";

const LS_LIKED_POSTS = "liked_posts"; // Set<string(postId)>
const LS_POST_DELTAS = "post_count_deltas"; // { [postId]: { likes: number, views: number, comments: number } }
const SS_VIEW_KEY_PREFIX = "viewed_"; // sessionStorage 중복 조회 방지
const AUTH_KEY = "auth_user"; // 로그인 사용자 로컬 스토리지 키

/** ---- 공통 유틸: 델타 저장/적용 ---- */
function readDeltas() {
  try {
    return JSON.parse(localStorage.getItem(LS_POST_DELTAS)) || {};
  } catch {
    return {};
  }
}
function writeDeltas(obj) {
  try {
    localStorage.setItem(LS_POST_DELTAS, JSON.stringify(obj));
  } catch {}
}
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
function readLikedSet() {
  try {
    const raw = localStorage.getItem(LS_LIKED_POSTS);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}
function writeLikedSet(set) {
  try {
    localStorage.setItem(LS_LIKED_POSTS, JSON.stringify(Array.from(set)));
  } catch {}
}

function PostDetail() {
  const { postId } = useParams();
  const nav = useNavigate();
  const [post, setPost] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // 로그인 사용자 로드
  useEffect(() => {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      if (raw) setCurrentUser(JSON.parse(raw));
      else setCurrentUser(null);
    } catch {
      setCurrentUser(null);
    }
  }, []);

  // 상세/조회수 처리
  useEffect(() => {
    let mounted = true;
    const idStr = String(postId);

    fetch(`http://localhost:5000/api/posts/${idStr}`)
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;

        const likedSet = readLikedSet();
        setLiked(
          !!(data?.user_liked ?? likedSet.has(String(data?.post_id ?? idStr)))
        );

        const ssKey = `${SS_VIEW_KEY_PREFIX}${idStr}`;
        const already = sessionStorage.getItem(ssKey) === "1";
        if (!already) {
          sessionStorage.setItem(ssKey, "1");
          const after = bumpDelta(idStr, "views", 1);
          const nextViews = getDisplayCount(data?.views, after.views);
          try {
            window.dispatchEvent(
              new CustomEvent("post:viewIncreased", {
                detail: { postId: idStr, views: nextViews },
              })
            );
          } catch {}
        }

        setPost(data);
      })
      .catch((err) => console.error(err));

    return () => {
      mounted = false;
    };
  }, [postId]);

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

  const deltas = readDeltas()[String(post.post_id ?? postId)] || {
    likes: 0, views: 0, comments: 0,
  };
  const likeCount = getDisplayCount(post?.like_count ?? post?.likes, deltas.likes);
  const viewCount = getDisplayCount(post?.views, deltas.views);
  const totalComments = getDisplayCount(
    post?.comment_count ?? post?.comments?.length ?? 0,
    deltas.comments
  );

  // 댓글 등록
  const addComment = async () => {
    const idStr = String(post.post_id ?? postId);
    if (!newComment.trim()) return;

    try {
      const res = await fetch(`http://localhost:5000/api/posts/${idStr}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newComment.trim(),
          user_id: currentUser?.user_id ?? 1,
        }),
      });
      const saved = await res.json();

      setPost((prev) => ({
        ...prev,
        comments: [...(prev?.comments ?? []), saved],
        comment_count: (prev?.comment_count ?? prev?.comments?.length ?? 0) + 1,
      }));

      const after = bumpDelta(idStr, "comments", 1);
      const nextComments = getDisplayCount(
        post?.comment_count ?? (post?.comments?.length ?? 0) + 1,
        after.comments
      );

      try {
        window.dispatchEvent(
          new CustomEvent("post:commentAdded", {
            detail: { postId: idStr, comment_count: nextComments },
          })
        );
      } catch {}

      setNewComment("");
    } catch (err) {
      console.error("댓글 등록 실패:", err);
    }
  };

  // 댓글 삭제 (확인창/alert 없이, 낙관적 UI)
  const deleteComment = async (comment) => {
    const idStr = String(post.post_id ?? postId);
    const commentId = String(comment.postcomment_id ?? comment.id);
    if (!commentId) return;

    // 본인 댓글만 삭제 (무소음 처리)
    if (!currentUser?.user_id || currentUser.user_id !== comment.user_id) return;

    // 1) 화면 먼저 제거 + 카운트 감소
    setPost((prev) => {
      const nextComments = (prev?.comments ?? []).filter(
        (c) => String(c.postcomment_id) !== commentId
      );
      const base = prev?.comment_count ?? prev?.comments?.length ?? 0;
      return {
        ...prev,
        comments: nextComments,
        comment_count: Math.max(0, base - 1),
      };
    });
    const after = bumpDelta(idStr, "comments", -1);
    const nextCommentsCnt = getDisplayCount(
      (post?.comment_count ?? post?.comments?.length ?? 0) - 1,
      after.comments
    );
    try {
      window.dispatchEvent(
        new CustomEvent("post:commentDeleted", {
          detail: { postId: idStr, comment_count: nextCommentsCnt },
        })
      );
    } catch {}

    // 2) 서버 삭제 요청 (실패해도 조용히 로그만)
    try {
      await fetch(
        `http://localhost:5000/api/posts/${idStr}/comments/${commentId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: currentUser.user_id }),
        }
      ).then((r) => {
        if (!r.ok) throw new Error(`delete failed: ${r.status}`);
      });
    } catch (err) {
      console.warn("댓글 삭제 서버 반영 실패(화면은 유지):", err);
      // 요구사항: 실패 알림/되돌리기 없이 조용히 진행
    }
  };

  // 좋아요
  const toggleLike = async () => {
    const idStr = String(post.post_id ?? postId);
    const likedSet = readLikedSet();
    const willLike = !liked;

    setLiked(willLike);
    bumpDelta(idStr, "likes", willLike ? 1 : -1);
    const del = readDeltas()[idStr] || { likes: 0, views: 0, comments: 0 };
    const nextLikeCount = getDisplayCount(post?.like_count ?? post?.likes, del.likes);

    if (willLike) likedSet.add(idStr);
    else likedSet.delete(idStr);
    writeLikedSet(likedSet);

    try {
      window.dispatchEvent(
        new CustomEvent("post:likeToggled", {
          detail: { postId: idStr, liked: willLike, like_count: nextLikeCount },
        })
      );
    } catch {}
  };

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
                <img
                  src={`http://localhost:5000${att.file_path}`}
                  alt="첨부이미지"
                  className={styles.mkAttachmentImg}
                />
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
              style={{
                display: "inline-flex",
                gap: 6,
                alignItems: "center",
                cursor: "pointer",
                background: "transparent",
                border: 0,
                padding: 0,
              }}
            >
              <i
                className={liked ? "fa-solid fa-heart" : "fa-regular fa-heart"}
                aria-hidden="true"
                style={{ color: liked ? "#ff0505" : "inherit" }}
              />
              {likeCount}
            </button>
            <div className={styles.mkmetaItem}>
              <i className="fa-regular fa-eye" aria-hidden="true" />
              {viewCount}
            </div>
          </div>
        </div>

        {/* 댓글 입력 */}
        <div className={styles.mkcommentsSection}>
          <div className={styles.mkcommentsHeader}>
            댓글 <span className={styles.mkcommentsCount}>{totalComments / 2}</span>
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
                  addComment();
                }
              }}
            />
            <div className={styles.mkcommentSide}>
              <button
                className={styles.mksendBtn}
                type="button"
                onClick={addComment}
                aria-label="댓글 등록"
              >
                <i className="fa-solid fa-pen" />
              </button>
            </div>
          </div>

          {/* 댓글 목록 */}
          <div className={styles.mkcommentsList}>
            {(post.comments ?? []).map((c) => {
              const isOwner =
                !!currentUser?.user_id &&
                Number(currentUser.user_id) === Number(c.user_id);

              return (
                <div key={c.postcomment_id} className={styles.mkcommentItem}>
                  <div
                    className={styles.mkcommentHead}
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div className={styles.mkcommentAvatar} />
                      <div className={styles.mkcommentMeta}>
                        <div className={styles.mkcommentAuthor}>
                          {c.author ?? c.user_name ?? "익명"}
                        </div>
                        <div className={styles.mkcommentTime}>
                          {timeAgo(c.created_at)}
                        </div>
                      </div>
                    </div>

                    {/* 삭제 버튼(본인만) */}
                    {isOwner && (
                      <div style={{ marginLeft: "auto" }}>
                        <button
                          type="button"
                          onClick={() => deleteComment(c)}
                          className={styles.mkcommentDelBtn}
                          aria-label="댓글 삭제"
                          title="댓글 삭제"
                          style={{
                            background: "transparent",
                            border: "1px solid #ddd",
                            borderRadius: 6,
                            padding: "4px 8px",
                            cursor: "pointer",
                          }}
                        >
                          <i className="fa-regular fa-trash-can" /> 삭제
                        </button>
                      </div>
                    )}
                  </div>

                  <div
                    className={styles.mkcommentBody}
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    {c.content ?? c.text}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

export default PostDetail;
