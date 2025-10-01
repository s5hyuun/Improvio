import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import styles from "../../styles/Board.module.css";
import BoardContent from "./components/BoardContent";
import BoardDetail from "./BoardDetail";
import BoardWrite from "./components/BoardWrite";
import { useTranslation } from "react-i18next";

const API = "http://localhost";
const STORAGE_KEY = "proposal_items_cache_v1";

function toAbsoluteUrl(raw, base = "http://localhost:5000") {
  if (!raw) return null;
  let s = String(raw).trim().replace(/['"]/g, "");
  s = s.replace(/\\/g, "/");
  if (!/^https?:\/\//i.test(s) && !s.startsWith("/")) s = `/${s}`;
  try {
    return new URL(s, base).href;
  } catch {
    return null;
  }
}

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

function resolveImage(row) {
  const base = "http://localhost:5000";
  const fromHtml =
    extractImgFromHtml(row.description) || extractImgFromHtml(row.body);
  if (fromHtml) {
    const u = toAbsoluteUrl(fromHtml, base);
    if (u) return u;
  }

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
  const author_id = row.author_id ?? row.user_id ?? null;
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
    image_url,
    author_id,
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
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [dept, setDept] = useState(""); 
  const { t, i18n } = useTranslation(); 

  // 번역 API 호출 함수
  async function translateText(text, lang) {
    try {
      const res = await fetch("http://localhost:4000/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetLang: lang.toUpperCase() }),
      });

      const data = await res.json();
      return data.translatedText || text; 
    } catch (err) {
      console.error("번역 실패:", err);
      return text; 
    }
  }

  useEffect(() => {
    async function fetchAndTranslate() {
      try {
        const res = await fetch("http://localhost:4000/api/suggestions");
        const data = await res.json();

        const lang = i18n.language || "ko";

        
        if (lang === "ko") {
          setSuggestions(data);
          return;
        }

      
        const translatedData = await Promise.all(
          data.map(async (s) => {
            const title = await translateText(s.title, lang);
            const description = await translateText(s.description, lang);
            return { ...s, title, description }; // 번역된 값을 suggestions 배열에 반영
          })
        );

        setSuggestions(translatedData);
      } catch (err) {
        console.error(err);
      }
    }

    fetchAndTranslate();
  }, [i18n.language]); 

  // dept 이벤트 구독
  useEffect(() => {
    function handler(e) {
      setDept(e.detail.dept); 
    }
    window.addEventListener("dept:changed", handler);
    return () => window.removeEventListener("dept:changed", handler);
  }, []);

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

  const dataSourceRaw = isSearching ? searchResults : suggestions;
  const dataSource = useMemo(
    () => (Array.isArray(dataSourceRaw) ? dataSourceRaw.map(adaptFromDB) : []),
    [dataSourceRaw]
  );

  const filtered = dept
    ? suggestions.filter((s) => s.department_name === dept)
    : suggestions;

  // status별 필터링
  const proposals = filtered.filter((s) => s.status === "pending");
  const inProgress = filtered.filter((s) => s.status === "approved");
  const completed = filtered.filter((s) => s.status === "completed");

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
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
              <p>{t("board.title")}</p>
              <p>{t("board.termsTitle")}</p>
            </div>
            <button onClick={() => setWrite(true)}>{t("board.writebtn")}</button>
            {write && (
              <BoardWrite
                onClose={() => setWrite(false)}
                onSubmit={async (formData) => {
                  try {
                    await fetch("http://localhost:4000/api/suggestions", {
                      method: "POST",
                      body: formData,
                    });

                    // ✅ 새 글 작성 후 바로 페이지 새로고침
                    window.location.reload();
                  } catch (err) {
                    console.error(err);
                    alert(t("board.alert.saveError"));
                  }
                }}
              />
            )}
          </div>

          <div className={styles.boardContents}>
            <div className={styles.boardColumn}>
              <div>{t("board.column.proposal")}</div>
              <div className={styles.cardRow}>
                {proposals.length > 0 ? (
                  proposals.map((s) => (
                    <BoardContent
                      key={s.suggestion_id}
                      suggestion={s} // 번역된 title/description 포함
                      onClick={() => setSelected(s)}
                    />
                  ))
                ) : (
                  <div className={styles.noContent}>
                    {t("board.empty.proposal")}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.boardColumn}>
              <div>{t("board.column.inProgress")}</div>
              <div className={styles.cardRow}>
                {inProgress.length > 0 ? (
                  inProgress.map((s) => (
                    <BoardContent
                      key={s.suggestion_id}
                      suggestion={s}
                      onClick={() => setSelected(s)}
                    />
                  ))
                ) : (
                  <div className={styles.noContent}>
                    {t("board.empty.inProgress")}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.boardColumn}>
              <div>{t("board.column.complete")}</div>
              <div className={styles.cardRow}>
                {completed.length > 0 ? (
                  completed.map((s) => (
                    <BoardContent
                      key={s.suggestion_id}
                      suggestion={s}
                      onClick={() => setSelected(s)}
                    />
                  ))
                ) : (
                  <div className={styles.noContent}>
                    {t("board.empty.complete")}
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
