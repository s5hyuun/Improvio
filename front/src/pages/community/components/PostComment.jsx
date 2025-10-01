import styles from "../../../styles/Community.module.css";

const COMMENT_LS_KEY = "liked_comments"; // Set<string(commentId)>

function readLikedComments() {
  try {
    const raw = localStorage.getItem(COMMENT_LS_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}
function writeLikedComments(set) {
  try {
    localStorage.setItem(COMMENT_LS_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}

function PostComment({ postId, currentUser }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [likedSet, setLikedSet] = useState(() => readLikedComments());

  // 댓글 불러오기(초기 좋아요 상태 적용)
  const fetchComments = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/posts/${postId}/comments`
      );
      const data = await res.json();
      const withLikeState = (data || []).map((c) => ({
        ...c,
        _liked: likedSet.has(String(c.postcomment_id)),
        like_count: c.like_count ?? 0,
      }));
      setComments(withLikeState);
    } catch (err) {
      console.error("댓글 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  // 댓글 작성
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (!currentUser?.user_id) {
      alert("로그인 후 댓글 작성이 가능합니다.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/posts/${postId}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: currentUser.user_id,
            content: newComment.trim(),
          }),
        }
      );

      const data = await res.json();
      if (res.ok && data) {
        const inserted = {
          ...data,
          _liked: false,
          like_count: data.like_count ?? 0,
        };
        setComments((prev) => [inserted, ...prev]);
        setNewComment("");

        // 상세/목록 댓글수 동기화(최종 숫자는 상세에서 델타로 다시 계산)
        try {
          window.dispatchEvent(
            new CustomEvent("post:commentAdded", {
              detail: { postId: String(postId) },
            })
          );
        } catch {}
      } else {
        alert(data?.error || "댓글 작성 실패");
      }
    } catch (err) {
      console.error("댓글 저장 실패:", err);
      alert("서버 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  // 댓글 좋아요 토글
  const toggleCommentLike = async (commentId) => {
    const idStr = String(commentId);
    const willLike = !likedSet.has(idStr);

    setComments((prev) =>
      prev.map((c) =>
        String(c.postcomment_id) === idStr
          ? {
              ...c,
              _liked: willLike,
              like_count: Math.max(
                0,
                (c.like_count ?? 0) + (willLike ? 1 : -1)
              ),
            }
          : c
      )
    );

    const next = new Set(likedSet);
    if (willLike) next.add(idStr);
    else next.delete(idStr);
    setLikedSet(next);
    writeLikedComments(next);

    // (선택) 서버 반영
    // await fetch(`http://localhost:5000/api/comments/${idStr}/like`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ like: willLike }),
    // }).catch(()=>{});
  };

  return (
    <div>
      {/* 댓글 작성 폼 */}
      <form onSubmit={handleSubmit} className={styles.commentForm}>
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="댓글을 입력하세요"
          disabled={submitting}
        />
        <button type="submit" disabled={submitting}>
          {submitting ? "등록 중..." : "등록"}
        </button>
      </form>

      {/* 댓글 목록 */}
      {comments.map((c) => (
        <div key={c.postcomment_id} className={styles.postCommentContainer}>
          <div className={styles.postCommentLeft}>
            <i className="fa-regular fa-user"></i>
            <div>
              <span>{c.user_name || `익명${c.user_id}`}</span>
              <span>{formatDate(c.created_at)}</span>
            </div>
          </div>

          <div className={styles.postCommentRight}>
            <div className={styles.postCommentContent}>{c.content}</div>

            <button
              type="button"
              className={styles.commentLikeBtn}
              onClick={() => toggleCommentLike(c.postcomment_id)}
              aria-label={c._liked ? "댓글 좋아요 취소" : "댓글 좋아요"}
              title={c._liked ? "좋아요 취소" : "좋아요"}
              style={{
                display: "inline-flex",
                gap: 6,
                alignItems: "center",
                background: "transparent",
                border: 0,
                cursor: "pointer",
                padding: 0,
              }}
            >
              <i
                className={
                  c._liked ? "fa-solid fa-heart" : "fa-regular fa-heart"
                }
                aria-hidden="true"
                style={{ color: c._liked ? "#ff0505" : "inherit" }}
              />
              <span>{c.like_count ?? 0}</span>
            </button>
          </div>
        </div>
      ))}
      <div className={styles.postCommentIcons}>
        <i class="fa-solid fa-message"></i>
        <i class="fa-regular fa-thumbs-up"></i>
        <i class="fa-regular fa-heart"></i>
      </div>
    </div>
  );
}
export default PostComment;
