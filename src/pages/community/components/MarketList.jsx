import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "../../../styles/Market.module.css";

const LS_KEY = "market_meta_v1";
const readStore = () => { try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch { return {}; } };
const writeStore = (obj) => localStorage.setItem(LS_KEY, JSON.stringify(obj));

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
  const ms = m[2] === "분" ? n*MS.m : m[2] === "시간" ? n*MS.h : n*MS.d;
  return Date.now() - ms;
};

export default function MarketList({ boardKey }) {
  const nav = useNavigate();
  const { pathname } = useLocation();

  const isMarket = boardKey ? boardKey === "market" : pathname.includes("/market");

  const boardMeta = isMarket
    ? { title: "장터게시판", count: 67, icon: "fa-solid fa-cart-shopping" }
    : { title: "자유게시판", count: 324, icon: "fa-solid fa-message" };

  const showThumb = isMarket;

  const base = useMemo(() => ([
    { id: 88156, title: "제목 자리 입니다..", body: "내용 자리 입니다….", time: "6시간 전",  comments: 34, likes: 67, views: 888 },
    { id: 81113, title: "제목 자리 입니다..", body: "내용 자리 입니다….", time: "12시간 전", comments: 14, likes: 11, views: 911 },
    { id: 80421, title: "제목 자리 입니다..", body: "내용 자리 입니다….", time: "2일 전",   comments: 23, likes: 45, views: 567 },
  ]), []);

  const [meta, setMeta] = useState(() => {
    const store = readStore(); let dirty = false;
    for (const it of base) {
      if (!store[it.id]) {
        store[it.id] = {
          createdAt: parseRel(it.time),
          likes: it.likes ?? 0, comments: it.comments ?? 0, views: it.views ?? 0, liked: false,
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

  const goDetail = (id) => nav(`/community/market/${id}`);

  return (
    <>
      <div className={styles.header}>
        <i className={boardMeta.icon} aria-hidden="true" />
        {boardMeta.title}
        <span> ({boardMeta.count})</span>
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
                  <div className={styles.title}>{it.title}</div>
                </div>

                <div className={styles.body}>{it.body}</div>

                <div className={styles.metaRow}>
                  <div className={styles.metaLeft}>
                    <div className={styles.metaItem}>익명 <strong>{it.id}</strong></div>
                    <span className={styles.dot} aria-hidden="true" />
                    <div className={styles.metaItem}>
                      <i className="fa-regular fa-clock" aria-hidden="true" />
                      {timeText}
                    </div>
                  </div>

                  <div className={styles.metaRight}>
                    <div className={styles.metaItem}><i className="fa-regular fa-comment" aria-hidden="true" />{m.comments ?? 0}</div>
                    <div className={styles.metaItem}><i className="fa-regular fa-eye" aria-hidden="true" />{m.views ?? 0}</div>
                    <div className={styles.metaItem}><i className="fa-regular fa-heart" aria-hidden="true" />{m.likes ?? 0}</div>
                  </div>
                </div>
              </div>

              {showThumb && <div className={styles.thumb} aria-hidden="true">사진</div>}
            </div>
          );
        })}
      </div>
    </>
  );
}
