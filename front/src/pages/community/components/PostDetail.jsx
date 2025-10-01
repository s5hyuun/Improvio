import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import styles from "../../../styles/Market.module.css";

const LS_LIKED_POSTS = "liked_posts"; // Set<string(postId)>
const LS_POST_DELTAS = "post_count_deltas"; // { [postId]: { likes: number, views: number, comments: number } }
const SS_VIEW_KEY_PREFIX = "viewed_"; // sessionStorage 중복 조회 방지

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
  // 음수 방지: 화면용 델타는 0 미만이면 0으로(특히 likes)
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

  // 상세 진입: 게시글 로드 + 조회수 1회 가산(세션 중복 방지)
  useEffect(() => {
    let mounted = true;
    const idStr = String(postId);

    fetch(`http://localhost:5000/api/posts/${idStr}`)
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;

        // 좋아요 초기화
        const likedSet = readLikedSet();
        setLiked(
          !!(data?.user_liked ?? likedSet.has(String(data?.post_id ?? idStr)))
        );

        // 조회수: 상세 직접 진입 시 1회 증가(세션 중복 방지)
        const ssKey = `${SS_VIEW_KEY_PREFIX}${idStr}`;
        const already = sessionStorage.getItem(ssKey) === "1";
        if (!already) {
          sessionStorage.setItem(ssKey, "1");
          const after = bumpDelta(idStr, "views", 1);
          // 목록 동기화(최종 숫자 포함)
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

  // timeAgo
  const timeAgo = (ts) => {
    if (!ts) return "";
    const t = new Date(ts).getTime();
    const diff = Date.now() - t;
    const m = 60 * 1000,
      h = 60 * m,
      d = 24 * h;
    if (diff < m) return "방금 전";
    if (diff < h) return `${Math.floor(diff / m)}분 전`;
    if (diff < d) return `${Math.floor(diff / h)}시간 전`;
    return `${Math.floor(diff / d)}일 전`;
  };

  if (!post) return <div>Loading...</div>;

  // 화면 표시용 최종 카운트(서버 값 + 델타)
  const deltas = readDeltas()[String(post.post_id ?? postId)] || {
    likes: 0,
    views: 0,
    comments: 0,
  };
  const likeCount = getDisplayCount(
    post?.like_count ?? post?.likes,
    deltas.likes
  );
  const viewCount = getDisplayCount(post?.views, deltas.views);
  const totalComments = getDisplayCount(
    post?.comment_count ?? post?.comments?.length ?? 0,
    deltas.comments
  );

  // 댓글 등록(성공 시 숫자 즉시 +1)
  const addComment = async () => {
    const idStr = String(post.post_id ?? postId);
    if (!newComment.trim()) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/posts/${idStr}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: newComment.trim(), user_id: 1 }),
        }
      );
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

      // 목록 동기화(최종 숫자)
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

  // ❤️ 좋아요 토글(성공 가정: 즉시 반영)
  const toggleLike = async () => {
    const idStr = String(post.post_id ?? postId);
    const likedSet = readLikedSet();
    const willLike = !liked;

    setLiked(willLike);

    // 델타 업데이트(+1/-1) 및 최종 카운트 산정
    bumpDelta(idStr, "likes", willLike ? 1 : -1);
    const del = readDeltas()[idStr] || { likes: 0, views: 0, comments: 0 };
    const nextLikeCount = getDisplayCount(
      post?.like_count ?? post?.likes,
      del.likes
    );

    // 로컬 좋아요 세트 유지
    if (willLike) likedSet.add(idStr);
    else likedSet.delete(idStr);
    writeLikedSet(likedSet);

    // 목록 동기화(최종 숫자 포함)
    try {
      window.dispatchEvent(
        new CustomEvent("post:likeToggled", {
          detail: { postId: idStr, liked: willLike, like_count: nextLikeCount },
        })
      );
    } catch {}

    // (선택) 서버 반영:
    // await fetch(`http://localhost:5000/api/posts/${idStr}/like`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ like: willLike }),
    // }).catch(()=>{});
  };

  return (
    <>
      <button className={styles.mkbackBtn} onClick={() => nav(-1)}>
        ← {post.board_title ?? "게시판"} 목록
      </button>

      <div className={styles.mkdetailWrap}>
        <div className={`${styles.mkmetaRow} ${styles.mkdetailTop}`} />

        {/* 제목/본문 */}
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

        {/* 메타(작성자/시간/댓글/좋아요/조회수) */}
        <div className={styles.mkmetaRow} style={{ marginTop: 8 }}>
          <div className={styles.mkmetaLeft}>
            {post.author && (
              <div className={styles.mkmetaItem}>{post.author}</div>
            )}
            {post.created_at && (
              <div className={styles.mkmetaItem}>
                <i className="fa-regular fa-clock" aria-hidden="true" />
                {timeAgo(post.created_at)}
              </div>
            )}

            {/* 댓글 수 */}
            <div className={styles.mkmetaItem}>
              <i className="fa-regular fa-comment" aria-hidden="true" />
              {totalComments}
            </div>

            {/* ❤️ 좋아요 */}
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

            {/* 👁 조회수 */}
            <div className={styles.mkmetaItem}>
              <i className="fa-regular fa-eye" aria-hidden="true" />
              {viewCount}
            </div>
          </div>
        </div>

        {/* 댓글 입력 */}
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

          {/* 기존 댓글 렌더링(좋아요는 PostComment.jsx에서 처리하는 경우 별도 사용) */}
          <div className={styles.mkcommentsList}>
            {(post.comments ?? []).map((c) => (
              <div key={c.postcomment_id} className={styles.mkcommentItem}>
                <div className={styles.mkcommentHead}>
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
                <div
                  className={styles.mkcommentBody}
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {c.content ?? c.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default PostDetail;
