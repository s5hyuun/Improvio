import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "../../../styles/Market.module.css";

const LS_KEY = "market_meta_v1";

function readStore() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; }
  catch { return {}; }
}
function writeStore(obj) { localStorage.setItem(LS_KEY, JSON.stringify(obj)); }

const MS = { m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
const timeAgo = (createdAt) => {
  const diff = Date.now() - createdAt;
  if (diff < MS.m) return "방금 전";
  if (diff < MS.h) return `${Math.floor(diff / MS.m)}분 전`;
  if (diff < MS.d) return `${Math.floor(diff / MS.h)}시간 전`;
  return `${Math.floor(diff / MS.d)}일 전`;
};
function parseRelativeToCreatedAt(str) {
  const m = /(\d+)\s*(분|시간|일)/.exec(str || "");
  if (!m) return Date.now();
  const n = Number(m[1]);
  const unit = m[2];
  const ms = unit === "분" ? n * MS.m : unit === "시간" ? n * MS.h : n * MS.d;
  return Date.now() - ms;
}

export default function MarketList({ boardKey }) {
  const nav = useNavigate();
  const { pathname } = useLocation();

  const isMarket = boardKey ? boardKey === "market" : pathname.includes("/market");
  const boardTitle = isMarket ? "장터게시판" : "자유게시판";
  const boardCount = isMarket ? 67 : 324;

  const base = useMemo(
    () => [
      { id: 88156, title: "제목 자리 입니다..", body: "내용 자리 입니다….", time: "6시간 전",  comments: 34, likes: 67, views: 888},
      { id: 81113, title: "제목 자리 입니다..", body: "내용 자리 입니다….", time: "12시간 전", comments: 14, likes: 11, views: 911 },
      { id: 80421, title: "제목 자리 입니다..", body: "내용 자리 입니다….", time: "2일 전",   comments: 23, likes: 45, views: 567},
    ],
    []
  );

  const [meta, setMeta] = useState(() => {
    const store = readStore();
    let dirty = false;
    for (const it of base) {
      if (!store[it.id]) {
        store[it.id] = {
          createdAt: parseRelativeToCreatedAt(it.time),
          likes: it.likes ?? 0,
          comments: it.comments ?? 0,
          views: it.views ?? 0,
          liked: false,
        };
        dirty = true;
      }
    }
    if (dirty) writeStore(store);
    return store;
  });

  useEffect(() => {
    const sync = () => setMeta(readStore());
    window.addEventListener("focus", sync);
    return () => window.removeEventListener("focus", sync);
  }, []);

  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 60 * 1000);
    return () => clearInterval(t);
  }, []);

  const goDetail = (id) => {
    nav(`/community/market/${id}`);
  };

  return (
    <>
      <div className={styles.header}>
        <i className="fa-regular fa-message" aria-hidden="true" />
        {boardTitle}
        <span>({boardCount})</span>
      </div>

      <div className={styles.list}>
        {base.map((it, idx) => {
          const m = meta[it.id] || {};
          const timeText = timeAgo(m.createdAt || Date.now());
          return (
            <div
              key={it.id}
              className={`${styles.card} ${idx === 0 ? styles.firstCard : ""}`}
              onClick={() => goDetail(it.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && goDetail(it.id)}
            >
              <div className={styles.cardContent}>
                <div className={styles.titleRow}>
                  {it.hot && <span className={styles.hotBadge}>HOT</span>}
                  <div className={styles.title}>{it.title}</div>
                </div>

                <div className={styles.body}>{it.body}</div>

                <div className={styles.metaRow}>
                  <div className={styles.metaLeft}>
                    <div className={styles.metaItem}>
                      익명 <strong>{it.id}</strong>
                    </div>
                    <span className={styles.dot} aria-hidden="true" />
                    <div className={styles.metaItem}>
                      <i className="fa-regular fa-clock" aria-hidden="true" />
                      {timeText}
                    </div>
                  </div>

                  <div className={styles.metaRight}>
                    <div className={styles.metaItem}>
                      <i className="fa-regular fa-comment" aria-hidden="true" />
                      {m.comments ?? 0}
                    </div>
                    <div className={styles.metaItem}>
                      <i className="fa-regular fa-eye" aria-hidden="true" />
                      {m.views ?? 0}
                    </div>
                    <div className={styles.metaItem}>
                      <i className="fa-regular fa-heart" aria-hidden="true" />
                      {m.likes ?? 0}
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.thumb} aria-hidden="true">사진</div>
            </div>
          );
        })}
      </div>
    </>
  );
}
