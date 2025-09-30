// BoardPage.jsx
import { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import styles from "../../styles/Board.module.css";
import BoardContent from "./components/BoardContent";
import BoardDetail from "./BoardDetail";
import BoardWrite from "./components/BoardWrite";

const API = "http://localhost";
const STORAGE_KEY = "proposal_items_cache_v1";

/** 이미지/파일 경로를 표준 image_url로 해석 */
function resolveImage(row) {
  const base = "http://localhost:5000";
  const flats = [
    row.image_url,
    row.imageUrl,
    row.image,
    row.photo_url,
    row.photo,
    row.attachment_url,
    row.file_url,
    row.file_path,
  ].filter(Boolean);

  const arrays = []
    .concat(row.images || [])
    .concat(row.photos || [])
    .concat(row.attachments || [])
    .concat(row.files || [])
    .map((x) => {
      if (!x) return null;
      if (typeof x === "string") return x;
      if (typeof x === "object")
        return x.url || x.path || x.file_url || x.file_path || null;
      return null;
    })
    .filter(Boolean);

  const first = [...flats, ...arrays].find(Boolean);
  if (!first) return null;

  try {
    const u = new URL(first, base);
    return u.href;
  } catch {
    return first;
  }
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
    priority,
    status,
    urgent,
    image_url, // ✅ 표준화된 이미지 URL

    comment_count: row.comment_count ?? 0,
    vote_count: row.vote_count ?? 0,
  };
}

function loadCache() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function mergeById(serverList, cacheList) {
  // cache의 최신 status/urgent 값을 서버 목록에 덮어씁니다.
  const map = new Map(cacheList.map((x) => [x.id, x]));
  return serverList.map((s) => {
    const m = map.get(s.id);
    return m ? { ...s, status: m.status, urgent: m.urgent } : s;
  });
}

function BoardPage() {
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [write, setWrite] = useState(false);

  // 기본값: 전체 보기
  const [dept, setDept] = useState("");

  // 검색 상태
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // 초기 로드: 서버 + 캐시 병합
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`${API}:5000/api/suggestions`);
        const data = await res.json();
        let server = Array.isArray(data) ? data.map(adaptFromDB) : [];
        const cache = loadCache();
        if (cache.length) server = mergeById(server, cache);
        if (mounted) setSuggestions(server);
      } catch (err) {
        console.error(err);
        if (mounted) setSuggestions([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // 부서 변경 이벤트(사이드바에서 브로드캐스트)
  useEffect(() => {
    function handler(e) {
      setDept(e.detail?.dept ?? "");
    }
    window.addEventListener("dept:changed", handler);
    return () => window.removeEventListener("dept:changed", handler);
  }, []);

  // Proposal.jsx에서 쏘는 상태/긴급 변경을 즉시 반영
  useEffect(() => {
    const onStatus = (e) => {
      const { id, status } = e.detail || {};
      if (!id) return;
      setSuggestions((prev) =>
        prev.map((x) => (x.id === id ? { ...x, status } : x))
      );
    };
    const onUrgent = (e) => {
      const { id, urgent } = e.detail || {};
      if (!id) return;
      setSuggestions((prev) =>
        prev.map((x) => (x.id === id ? { ...x, urgent } : x))
      );
    };
    window.addEventListener("suggestion:status", onStatus);
    window.addEventListener("suggestion:urgent", onUrgent);
    return () => {
      window.removeEventListener("suggestion:status", onStatus);
      window.removeEventListener("suggestion:urgent", onUrgent);
    };
  }, []);

  // 검색 결과 vs 전체(검색 결과도 정규화하여 동일 로직 적용)
  const dataSourceRaw = isSearching ? searchResults : suggestions;
  const dataSource = useMemo(
    () => (Array.isArray(dataSourceRaw) ? dataSourceRaw.map(adaptFromDB) : []),
    [dataSourceRaw]
  );

  // dept === "" 이면 전체 보기
  const filtered = dept
    ? dataSource.filter((s) => (s.dept ?? s.department_name) === dept)
    : dataSource;

  const proposals = filtered.filter((s) => s.status === "pending");
  const inProgress = filtered.filter((s) => s.status === "approved");
  const completed = filtered.filter((s) => s.status === "completed");

  const cleanText = (text = "") => String(text).replace(/<\/?mark>/g, "");

  return (
    <div className="app">
      <Sidebar />

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

        <div className={styles.boardContainer}>
          <div className={styles.boardTitle}>
            <div>
              <p>개선 제안 시스템</p>
              <p>현장 직원들의 불편사항 및 개선 아이디어를 공유해주세요</p>
            </div>
            <button onClick={() => setWrite(true)}>+ 글쓰기</button>
            {write && (
              <BoardWrite
                user={JSON.parse(localStorage.getItem("auth_user"))}
                onClose={() => setWrite(false)}
                onSubmit={async (formData) => {
                  try {
                    const user = JSON.parse(localStorage.getItem("auth_user"));
                    if (user) {
                      formData.append("user_id", user.user_id);
                      formData.append("department_id", user.department_id);
                    }

                    await fetch(`${API}:5000/api/suggestions`, {
                      method: "POST",
                      body: formData,
                    });

                    const res = await fetch(`${API}:5000/api/suggestions`);
                    const data = await res.json();
                    const server = Array.isArray(data)
                      ? data.map(adaptFromDB)
                      : [];
                    // 새 글 작성 후에도 캐시 병합
                    const cache = loadCache();
                    setSuggestions(
                      cache.length ? mergeById(server, cache) : server
                    );
                    setWrite(false);
                  } catch (err) {
                    console.error(err);
                    alert("저장 중 오류가 발생했습니다.");
                  }
                }}
              />
            )}
          </div>

          <div className={styles.boardContents}>
            <div className={styles.boardColumn}>
              <div>Proposal</div>
              <div className={styles.cardRow}>
                {proposals.length > 0 ? (
                  proposals.map((s) => (
                    <BoardContent
                      key={s.id ?? s.suggestion_id}
                      suggestion={{
                        ...s,
                        title: cleanText(s.title),
                        description: cleanText(s.description),
                        comment_count: s.comment_count,
                        vote_count: s.vote_count,
                      }}
                      onClick={() => setSelected(s)}
                    />
                  ))
                ) : (
                  <div className={styles.noContent}>
                    {isSearching
                      ? "검색 결과가 없습니다."
                      : "등록된 제안이 없습니다."}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.boardColumn}>
              <div>In Progress</div>
              <div className={styles.cardRow}>
                {inProgress.length > 0 ? (
                  inProgress.map((s) => (
                    <BoardContent
                      key={s.id ?? s.suggestion_id}
                      suggestion={{
                        ...s,
                        title: cleanText(s.title),
                        description: cleanText(s.description),
                      }}
                      onClick={() => setSelected(s)}
                    />
                  ))
                ) : (
                  <div className={styles.noContent}>
                    {isSearching
                      ? "검색 결과가 없습니다."
                      : "진행 중인 제안이 없습니다."}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.boardColumn}>
              <div>Complete</div>
              <div className={styles.cardRow}>
                {completed.length > 0 ? (
                  completed.map((s) => (
                    <BoardContent
                      key={s.id ?? s.suggestion_id}
                      suggestion={{
                        ...s,
                        title: cleanText(s.title),
                        description: cleanText(s.description),
                      }}
                      onClick={() => setSelected(s)}
                    />
                  ))
                ) : (
                  <div className={styles.noContent}>
                    {isSearching
                      ? "검색 결과가 없습니다."
                      : "완료된 제안이 없습니다."}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {selected && (
        <BoardDetail suggestion={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

export default BoardPage;
