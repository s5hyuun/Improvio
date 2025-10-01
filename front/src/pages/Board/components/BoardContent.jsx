import { useState } from "react";
import styles from "../../../styles/Board.module.css";

const API = "http://localhost:5000";
const STORAGE_KEY = "proposal_items_cache_v1";

/** "a/b c.jpg" → "a/b%20c.jpg" (슬래시는 유지, 세그먼트만 인코딩) */
function encodePathSegments(path) {
  if (!path) return "";
  return String(path)
    .replace(/['"]/g, "")
    .replace(/\\/g, "/")
    .split("?")[0]
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
}

/** description/body HTML에서 <img> 첫 src 추출 */
function extractImgFromHtml(html) {
  if (!html) return null;
  try {
    const div = document.createElement("div");
    div.innerHTML = html;
    const img = div.querySelector("img");
    const src = img?.getAttribute("src");
    return src || null;
  } catch {
    return null;
  }
}

/** 다양한 형태의 이미지 소스를 표준 image_url로 수렴 */
function resolveImage(row) {
  const base = "http://localhost:5000";

  // 1) 본문 HTML에서 우선 추출
  const fromHtml =
    extractImgFromHtml(row.description) || extractImgFromHtml(row.body);
  if (fromHtml) {
    const u = toAbsoluteUrl(fromHtml, base);
    if (u) return u;
  }

  // 2) 단일 키
  const flatKeys = [
    "image_url",
    "imageUrl",
    "image",
    "photo_url",
    "photo",
    "thumbnail_url",
    "thumb_url",
    "attachment_url",
    "file_url",
    "file_path",
    "image_path",
    "upload_path",
    "preview_url",
  ];
  for (const k of flatKeys) {
    if (row[k]) {
      const u = toAbsoluteUrl(row[k], base);
      if (u) return u;
    }
  }

  // 3) 배열 키
  const arrayKeys = ["images", "photos", "attachments", "files", "pictures"];
  for (const k of arrayKeys) {
    const arr = row[k];
    if (Array.isArray(arr)) {
      for (const x of arr) {
        if (!x) continue;
        let cand = null;
        if (typeof x === "string") cand = x;
        else if (typeof x === "object") {
          cand =
            x.url ||
            x.path ||
            x.file_url ||
            x.file_path ||
            x.image_url ||
            x.preview_url ||
            null;
        }
        const u = toAbsoluteUrl(cand, base);
        if (u) return u;
      }
    }
  }

  return null;
}

// Proposal.jsx의 규칙과 동일한 어댑터 + image_url 매핑
function adaptFromDB(row) {
  const id = row.id ?? row.suggestion_id ?? row.suggestionId;
  const body = row.body ?? row.description ?? "";
  const dept = row.dept ?? row.department_name ?? null;
  const author = row.author ?? row.name ?? null;
  const created_at =
    row.created_at ?? row.createdAt ?? new Date().toISOString();

  const priority =
    typeof row.priority === "number"
      ? row.priority
      : typeof row.avg_score === "number"
      ? row.avg_score
      : null;

  let status = row.status;
  if (!["pending", "approved", "completed"].includes(status)) {
    const lower = String(row.status ?? "").toLowerCase();
    if (lower.includes("progress")) status = "approved";
    else if (lower.includes("complete")) status = "completed";
    else status = "pending";
  }

  const urgent =
    typeof row.urgent === "boolean" ? row.urgent : !!row.is_urgent || false;

  const image_url = resolveImage(row);

  return {
    id,
    suggestion_id: row.suggestion_id ?? id,
    title: row.title ?? "(제목 없음)",
    description: row.description ?? body,
    body,
    dept,
    department_name: row.department_name ?? dept,
    author,
    created_at,
    author_id,
    vote_count = 0,
    dislike_count = 0,
    comment_count = 0,
    suggestion_id,
    username,
  } = suggestion;

  const [votes, setVotes] = useState(vote_count);
  const [dislikes, setDislikes] = useState(dislike_count);
  const [commentsNum, setCommentsNum] = useState(comment_count);
  // 1차: 리스트 객체만으로 썸네일 추출 (없으면 null)
  const primaryUrl = useMemo(
    () => pickImageUrlFromSuggestion(suggestion),
    [suggestion]
  );

  // 2차: 상세를 한 번 조회해서 attachments에서 썸네일 결정
  const [detailThumb, setDetailThumb] = useState(null);
  useEffect(() => {
    let abort = false;

    async function loadStats() {
      try {
        const res = await fetch(
          `${BASE}/api/suggestions/${suggestion_id}/details`
        );
        if (!res.ok) return;
        const data = await res.json();
        if (!abort) {
          setVotes(data.vote_count ?? 0);
          setDislikes(data.dislike_count ?? 0);
          setCommentsNum((data.comments || []).length);
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadStats();
    return () => {
      abort = true;
    };
  }, [suggestion_id]);

  useEffect(() => {
    let abort = false;
    async function loadDetailThumb() {
      try {
        const res = await fetch(
          `${BASE}/api/suggestions/${suggestion_id}/details`
        );
        if (!res.ok) return; // 실패 시 썸네일 없이 진행
        const data = await res.json();

        // attachments에서 jpg/jpeg/png 우선
        const first = (data.attachments || []).find((att) => {
          const e = extOf(att?.file_path || att?.path || att?.url);
          return ["jpg", "jpeg", "png"].includes(e);
        });

        if (!abort && first) {
          setDetailThumb(
            toUploadsUrl(first.file_path || first.path || first.url)
          );
        }
      } catch {
        // 무시
      }
    }

    // primaryUrl이 이미 있으면 상세 호출 불필요
    if (!primaryUrl) loadDetailThumb();
    return () => {
      abort = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestion_id, primaryUrl]);

  // 최종 썸네일: 리스트→상세 순으로 결정
  const imageUrl = primaryUrl || detailThumb;

  const handleVote = async (score) => {
    try {
      const res = await fetch(`${BASE}/api/suggestions/${suggestion_id}/vote`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: 1, score }), // TODO: 실제 로그인 사용자로 교체
      });
      if (res.ok) {
        if (score === 1) setVotes((v) => v + 1);
        else if (score === -1) setDislikes((d) => d + 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const shortDesc =
    description.length > 60 ? `${description.slice(0, 60)}...` : description;

  return (
    <div className={styles.contentContainer} onClick={onClick}>
      <h3>{title}</h3>
      <div className={styles.description}>{description}</div>

      <div className="main">
        {/* Header에 onSearch 연결 */}
        <Header
          isLoggedIn={true}
          setIsLoggedIn={() => {}}
          onSearch={(results, active) => {
            setSearchResults(results || []);
            setIsSearching(!!active);
          }}
        />

        <div className={styles.contentUser}>
          <div title="작성자">
            <i className="fa-regular fa-user"></i> 익명{author_id}
          </div>
          <div title="작성일">
            <i className="fa-regular fa-calendar"></i>{" "}
            {new Date(created_at).toLocaleDateString()}
          </div>
        </div>

        <div className={styles.contentUser} style={{ marginTop: 6 }}>
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleVote(1);
            }}
            title="좋아요"
            style={{ cursor: "pointer" }}
          >
            <i className="fa-regular fa-thumbs-up"></i> {votes}
          </div>

          <div
            onClick={(e) => {
              e.stopPropagation();
              handleVote(-1);
            }}
            title="싫어요"
            style={{ cursor: "pointer" }}
          >
            <i className="fa-regular fa-thumbs-down"></i> {dislikes}
            &nbsp;
          </div>

          <div title="댓글 수">
            <i className="fa-regular fa-comment"></i> {commentsNum}
          </div>
        </div>
      </div>

      {/* 이미지 썸네일 */}
      {imageUrl && (
        <div
          style={{
            flex: "0 0 auto",
            width: 96,
            height: 96,
            borderRadius: 8,
            overflow: "hidden",
            border: "1px solid #e2e8f0",
          }}
          onClick={(e) => e.stopPropagation()}
          title="첨부 이미지"
        >
          <img
            src={imageUrl}
            alt="첨부 이미지"
            loading="lazy"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
            onError={(e) => {
              // 깨질 경우 카드에서 감춤
              e.currentTarget.parentElement.style.display = "none";
            }}
          />
        </div>
      )}
    </div>
  );
}

export default BoardContent;
