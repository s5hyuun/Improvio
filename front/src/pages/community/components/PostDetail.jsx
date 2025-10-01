import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import styles from "../../../styles/Market.module.css";

const LS_KEY = "liked_posts";

/** 로컬스토리지에 저장된 좋아요 집합 읽기 */
function readLikedSet() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(arr);
  } catch {
    return new Set();
  }
}

/** 좋아요 집합 저장 */
function writeLikedSet(set) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}

function PostDetail() {
  const { postId } = useParams();
  const nav = useNavigate();
  const [post, setPost] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [liked, setLiked] = useState(false);

  // 게시글 조회
  useEffect(() => {
    fetch(`http://localhost:5000/api/posts/${postId}`)
      .then((res) => res.json())
      .then((data) => {
        setPost(data);
        // 서버 응답에 사용자 좋아요 여부가 없다면 로컬스토리지 기준으로 결정
        const likedSet = readLikedSet();
        const isLiked =
          data?.user_liked ?? likedSet.has(String(data?.post_id ?? postId));
        setLiked(!!isLiked);
      })
      .catch((err) => console.error(err));
  }, [postId]);

  // 간단한 timeAgo
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

  const totalComments = post?.comment_count ?? post?.comments?.length ?? 0;
  const likeCount = post?.like_count ?? post?.likes ?? 0;

  // 댓글 등록 (즉시 카운트 + 브로드캐스트)
  const addComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/posts/${postId}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: newComment,
            user_id: 1, // TODO: 로그인한 사용자 ID
          }),
        }
      );
      const saved = await res.json();

      setPost((prev) => {
        const prevList = prev?.comments ?? [];
        const newCount = (prev?.comment_count ?? prevList.length) + 1;
        // 목록에 즉시 반영
        try {
          window.dispatchEvent(
            new CustomEvent("post:commentAdded", {
              detail: {
                postId: String(prev?.post_id ?? postId),
                comment_count: newCount,
              },
            })
          );
        } catch {}
        return {
          ...prev,
          comments: [...prevList, saved],
          comment_count: newCount,
        };
      });

      setNewComment("");
    } catch (err) {
      console.error("댓글 등록 실패:", err);
    }
  };

  // ❤️ 좋아요 토글 (즉시 카운트 + 브로드캐스트)
  const toggleLike = async () => {
    if (!post) return;
    const currentId = String(post.post_id ?? postId);
    const likedSet = readLikedSet();
    const willLike = !liked;

    // 낙관적 업데이트
    setLiked(willLike);
    setPost((prev) => ({
      ...prev,
      like_count: Math.max(
        0,
        (prev?.like_count ?? prev?.likes ?? 0) + (willLike ? 1 : -1)
      ),
    }));

    // 로컬스토리지 갱신
    if (willLike) likedSet.add(currentId);
    else likedSet.delete(currentId);
    writeLikedSet(likedSet);

    // 다른 컴포넌트 동기화
    try {
      window.dispatchEvent(
        new CustomEvent("post:likeToggled", {
          detail: {
            postId: currentId,
            liked: willLike,
          },
        })
      );
    } catch {}

    // (선택) 서버 반영
    // try {
    //   await fetch(`http://localhost:5000/api/posts/${postId}/like`, {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ like: willLike }),
    //   });
    // } catch (e) {
    //   console.warn("서버 좋아요 반영 실패(로컬 유지):", e);
    // }
  };

  if (!post) return <div>Loading...</div>;

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

        {/* 메타(작성자/시간/댓글/좋아요 수) */}
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
            <div className={styles.mkmetaItem}>
              <i className="fa-regular fa-comment" aria-hidden="true" />
              {totalComments}
            </div>

            {/* ❤️ 좋아요(클릭 가능) */}
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
          </div>
        </div>

        {/* 댓글 섹션 */}
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

                <div className={styles.mkcommentFoot}>
                  <div className={styles.mklikeWrap}>
                    <i className="fa-regular fa-heart" />
                    <em className={styles.mklikeCount}>{c.like_count ?? 0}</em>
                  </div>
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
