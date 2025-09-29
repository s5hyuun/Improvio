import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "../../../styles/Market.module.css";
import PostWrite from "./PostWrite"; 

const LS_KEY = "market_meta_v1";
const SCHEMA_V = 2;
const HEART_COLOR = "rgb(239, 68, 68)";

const readStore = () => {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; }
  catch { return {}; }
};
const writeStore = (obj) => localStorage.setItem(LS_KEY, JSON.stringify(obj));
const patchStore = (id, patch) => {
  const store = readStore();
  store[id] = { ...(store[id] || {}), ...patch };
  writeStore(store);
  window.dispatchEvent(new CustomEvent("market_meta_updated", { detail: { id, meta: store[id] } }));
  return store[id];
};

const MS = { m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
const timeAgo = (t) => {
  const diff = Date.now() - t;
  if (diff < MS.m) return "방금 전";
  if (diff < MS.h) return `${Math.floor(diff / MS.m)}분 전`;
  if (diff < MS.d) return `${Math.floor(diff / MS.h)}시간 전`;
  return `${Math.floor(diff / MS.d)}일 전`;
};
const parseRel = (s) => {
  const m = /(\d+)\s*(분|시간|일)/.exec(s || "");
  if (!m) return Date.now();
  const n = +m[1];
  const ms = m[2] === "분" ? n * MS.m : m[2] === "시간" ? n * MS.h : n * MS.d;
  return Date.now() - ms;
};

function MarketList({ boardKey }) {
  const nav = useNavigate();
  const { pathname } = useLocation();

  const isMarket = boardKey ? boardKey === "market" : pathname.includes("/board/5");
  const boardMeta = isMarket
    ? { title: "장터게시판", count: 67, icon: "fa-solid fa-cart-shopping" }
    : { title: "자유게시판", count: 324, icon: "fa-solid fa-message" };

  const showThumb = isMarket;
  const [showWrite, setShowWrite] = useState(false);

  const base = useMemo(
    () => [
      { id: 88156, title: "제목 자리 입니다..", body: "내용 자리 입니다….", time: "6시간 전", comments: 0, likes: 0, views: 0 },
      { id: 81113, title: "제목 자리 입니다..", body: "내용 자리 입니다….", time: "12시간 전", comments: 0, likes: 0, views: 0 },
      { id: 80421, title: "제목 자리 입니다..", body: "내용 자리 입니다….", time: "2일 전",   comments: 0, likes: 0, views: 0 },
    ],
    []
  );

  const migrate = (store) => {
    if (store.__v === SCHEMA_V) return store;
    const next = { ...store };
    for (const it of base) {
      next[it.id] = { createdAt: parseRel(it.time), likes: 0, comments: 0, views: 0, liked: false };
    }
    next.__v = SCHEMA_V;
    writeStore(next);
    return next;
  };

  const [meta, setMeta] = useState(() => {
    const seeded = migrate(readStore());
    let dirty = false;
    const next = { ...seeded };
    for (const it of base) {
      if (!next[it.id]) {
        next[it.id] = { createdAt: parseRel(it.time), likes: 0, comments: 0, views: 0, liked: false };
        dirty = true;
      }
    }
    if (dirty) writeStore(next);
    return next;
  });

  useEffect(() => {
    const sync = () => setMeta(readStore());
    window.addEventListener("focus", sync);
    window.addEventListener("market_meta_updated", sync);
    return () => {
      window.removeEventListener("focus", sync);
      window.removeEventListener("market_meta_updated", sync);
    };
  }, []);

  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 60 * 1000);
    return () => clearInterval(t);
  }, []);

  const goDetail = (id) => {
    const curr = readStore()[id] || {};
    const next = patchStore(id, { views: (curr.views || 0) + 1 });
    setMeta((prev) => ({ ...prev, [id]: next }));
    nav(`/community/board/5/${id}`);
  };

  const handleSubmit = async ({ title, content, images = [], anonymous = false }) => {
    try {
      const form = new FormData();
      form.append("board_id", "5"); 
      form.append("title", title);
      form.append("content", content);
      form.append("anonymous", String(anonymous));
      for (const f of images) form.append("images", f);

      const res = await fetch("http://localhost:3000/api/posts", { method: "POST", body: form });
      if (!res.ok) throw new Error(`POST /api/posts failed: ${res.status}`);

      const saved = await res.json();
      setShowWrite(false);
      alert("등록되었습니다.");
    } catch (e) {
      console.error(e);
      alert("등록에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  useEffect(() => {
    if (!showWrite) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [showWrite]);

  return (
    <>
      <div className={styles.mkheader} style={{ position: "relative" }}>
        <i className={boardMeta.icon} aria-hidden="true" />
        {boardMeta.title}
        <span> ({boardMeta.count})</span>

        <button
          type="button"
          className={styles.mkwriteBtn}
          onClick={() => setShowWrite(true)}
          style={{ cursor: "pointer", zIndex: 1 }}
        >
          <i className="fa-solid fa-pen" aria-hidden="true" />
          글쓰기
        </button>
      </div>

      <div className={styles.mklist}>
        {base.map((it, idx) => {
          const m = meta[it.id] || {};
          const timeText = timeAgo(m.createdAt || Date.now());
          const liked = !!m.liked;
          const heartClass = liked ? "fa-solid fa-heart" : "fa-regular fa-heart";
          const heartStyle = liked ? { color: HEART_COLOR } : undefined;

          return (
            <div
              key={it.id}
              className={`${styles.mkcard} ${idx === 0 ? styles.mkfirstCard : ""}`}
              onClick={() => goDetail(it.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && goDetail(it.id)}
            >
              <div className={styles.mkcardContent}>
                <div className={styles.mktitleRow}>
                  <div className={styles.mktitle}>{it.title}</div>
                </div>

                <div className={styles.mkbody}>{it.body}</div>

                <div className={styles.mkmetaRow}>
                  <div className={styles.mkmetaLeft}>
                    <div className={styles.mkmetaItem}>
                      익명 <strong>{it.id}</strong>
                    </div>
                    <span className={styles.mkdot} aria-hidden="true" />
                    <div className={styles.mkmetaItem}>
                      <i className="fa-regular fa-clock" aria-hidden="true" />
                      {timeText}
                    </div>
                  </div>

                  <div className={styles.mkmetaRight}>
                    <div className={styles.mkmetaItem}>
                      <i className="fa-regular fa-comment" aria-hidden="true" />
                      {m.comments ?? 0}
                    </div>
                    <div className={styles.mkmetaItem}>
                      <i className="fa-regular fa-eye" aria-hidden="true" />
                      {m.views ?? 0}
                    </div>
                    <div className={styles.mkmetaItem}>
                      <i className={heartClass} aria-hidden="true" style={heartStyle} />
                      {m.likes ?? 0}
                    </div>
                  </div>
                </div>
              </div>

              {showThumb && <div className={styles.mkthumb} aria-hidden="true">사진</div>}
            </div>
          );
        })}
      </div>

      {showWrite && (
        <PostWrite
          onSubmit={handleSubmit}
          onCancel={() => setShowWrite(false)}
        />
      )}
    </>
  );
}

export default function CommunityMarketOnly() {
  return <MarketList boardKey="market" />;
}
