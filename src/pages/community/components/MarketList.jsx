// src/pages/Community/CommunityMarketOnly.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPortal } from "react-dom";
import styles from "../../../styles/Market.module.css";

const LS_KEY = "market_meta_v1";
const SCHEMA_V = 2;
const HEART_COLOR = "rgb(239, 68, 68)";

const readStore = () => {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || {};
  } catch {
    return {};
  }
};
const writeStore = (obj) => localStorage.setItem(LS_KEY, JSON.stringify(obj));
const patchStore = (id, patch) => {
  const store = readStore();
  store[id] = { ...(store[id] || {}), ...patch };
  writeStore(store);
  window.dispatchEvent(
    new CustomEvent("market_meta_updated", { detail: { id, meta: store[id] } })
  );
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

function MarketWrite({ onClose }) {
  const [mounted, setMounted] = useState(false);

  const [productName, setProductName] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("0");
  const [isNegotiable, setIsNegotiable] = useState(false);
  const [condition, setCondition] = useState("");
  const [desc, setDesc] = useState("");
  const [dealDirect, setDealDirect] = useState(false);
  const [dealParcel, setDealParcel] = useState(false);
  const [contact, setContact] = useState("");
  const [files, setFiles] = useState([]);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const isValid =
    productName.trim() &&
    title.trim() &&
    category &&
    condition &&
    price !== "" &&
    (dealDirect || dealParcel);

  const submit = (e) => {
    e.preventDefault();
    if (!isValid) {
      alert("필수 항목을 확인해주세요.");
      return;
    }
    // 실제 저장 로직은 제외 (UI만 닫기)
    onClose?.();
  };

  if (!mounted) return null;

  const FieldLabel = ({ icon, text, req }) => (
    <div className={styles.mwLabelRow}>
      {icon && <i className={icon} aria-hidden="true" />}
      <span>{text}</span>
      {req && <em className={styles.reqStar}>*</em>}
    </div>
  );

  const body = (
    <div
      className={styles.modalOverlay}
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className={styles.modalPanel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>장터 글쓰기</h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <form className={styles.writeForm} onSubmit={submit}>
          <div className={styles.mwField}>
            <FieldLabel icon="fa-solid fa-box" text="상품명" req />
            <input
              className={styles.inputLike}
              placeholder="판매하실 상품명을 입력해주세요"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>

          <div className={styles.mwField}>
            <FieldLabel icon="fa-solid fa-tag" text="제목" req />
            <input
              className={styles.inputLike}
              placeholder="제목을 입력해주세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className={styles.mwRow2}>
            <div className={styles.mwField}>
              <FieldLabel text="카테고리" req />
              <select
                className={styles.inputLike}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">카테고리를 선택해주세요</option>
                <option>디지털/가전</option>
                <option>가구/인테리어</option>
                <option>생활/주방</option>
                <option>남성패션</option>
                <option>여성패션</option>
                <option>스포츠/레저</option>
                <option>취미/게임/음반</option>
                <option>도서</option>
                <option>반려동물</option>
                <option>기타</option>
              </select>
            </div>

            <div className={styles.mwField}>
              <div className={styles.mwLabelRow}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span style={{ fontWeight: 700 }}>$</span> 가격
                </span>
                <em className={styles.reqStar}>*</em>
              </div>
              <div className={styles.mwPriceRow}>
                <input
                  className={styles.inputLike}
                  type="number"
                  min="0"
                  step="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                />
                <span className={styles.mwWon}>원</span>
              </div>
              <label className={styles.mwCheckLine}>
                <input
                  type="checkbox"
                  checked={isNegotiable}
                  onChange={(e) => setIsNegotiable(e.target.checked)}
                />
                가격 협의 가능
              </label>
            </div>
          </div>

          <div className={styles.mwField}>
            <FieldLabel text="상품 상태" req />
            <select
              className={styles.inputLike}
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            >
              <option value="">상품 상태를 선택해주세요</option>
              <option>미개봉</option>
              <option>거의 새것</option>
              <option>좋음</option>
              <option>보통</option>
              <option>사용감 있음</option>
            </select>
          </div>

          <div className={styles.mwField}>
            <FieldLabel text="상품 설명" req />
            <textarea
              className={styles.inputLike}
              rows={6}
              placeholder="상품에 대한 자세한 설명을 작성해주세요..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>

          <div className={styles.mwField}>
            <FieldLabel icon="fa-solid fa-camera" text="상품 사진" />
            <label htmlFor="market-file" className={styles.fileDrop}>
              <input
                id="market-file"
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) =>
                  setFiles(Array.from(e.target.files || []).slice(0, 5))
                }
              />
              <i className="fa-solid fa-upload" aria-hidden="true" />
              <span>사진 업로드 (최대 5장)</span>
            </label>
          </div>

          <div className={styles.mwField}>
            <FieldLabel icon="fa-solid fa-truck" text="거래 방법" req />
            <div className={styles.mwChecks}>
              <label className={styles.mwCheckLine}>
                <input
                  type="checkbox"
                  checked={dealDirect}
                  onChange={(e) => setDealDirect(e.target.checked)}
                />
                직거래
              </label>
              <label className={styles.mwCheckLine}>
                <input
                  type="checkbox"
                  checked={dealParcel}
                  onChange={(e) => setDealParcel(e.target.checked)}
                />
                택배거래
              </label>
            </div>
          </div>

          <div className={styles.mwField}>
            <FieldLabel icon="fa-solid fa-phone" text="연락처" />
            <input
              className={styles.inputLike}
              placeholder="연락 가능한 번호나 이메일을 입력해주세요"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.backBtn} onClick={onClose}>
              취소
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={!isValid}
            >
              등록하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(body, document.body);
}

function MarketList({ boardKey }) {
  const nav = useNavigate();
  const { pathname } = useLocation();

  const isMarket = boardKey
    ? boardKey === "market"
    : pathname.includes("/market");
  const boardMeta = isMarket
    ? { title: "장터게시판", count: 67, icon: "fa-solid fa-cart-shopping" }
    : { title: "자유게시판", count: 324, icon: "fa-solid fa-message" };

  const showThumb = isMarket;
  const [showWrite, setShowWrite] = useState(false);

  const base = useMemo(
    () => [
      {
        id: 88156,
        title: "제목 자리 입니다..",
        body: "내용 자리 입니다….",
        time: "6시간 전",
        comments: 0,
        likes: 0,
        views: 0,
      },
      {
        id: 81113,
        title: "제목 자리 입니다..",
        body: "내용 자리 입니다….",
        time: "12시간 전",
        comments: 0,
        likes: 0,
        views: 0,
      },
      {
        id: 80421,
        title: "제목 자리 입니다..",
        body: "내용 자리 입니다….",
        time: "2일 전",
        comments: 0,
        likes: 0,
        views: 0,
      },
    ],
    []
  );

  const migrate = (store) => {
    if (store.__v === SCHEMA_V) return store;
    const next = { ...store };
    for (const it of base) {
      next[it.id] = {
        createdAt: parseRel(it.time),
        likes: 0,
        comments: 0,
        views: 0,
        liked: false,
      };
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
        next[it.id] = {
          createdAt: parseRel(it.time),
          likes: 0,
          comments: 0,
          views: 0,
          liked: false,
        };
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
    nav(`/community/market/${id}`);
  };

  return (
    <>
      {/* 가운데 헤더 + 리스트 + 글쓰기 모달만 남김 */}
      <div className={styles.header} style={{ position: "relative" }}>
        <i className={boardMeta.icon} aria-hidden="true" />
        {boardMeta.title}
        <span> ({boardMeta.count})</span>

        <button
          type="button"
          className={styles.writeBtn}
          onClick={() => setShowWrite(true)}
          style={{ cursor: "pointer", zIndex: 1 }}
        >
          <i className="fa-solid fa-pen" aria-hidden="true" />
          글쓰기
        </button>
      </div>

      <div className={styles.list}>
        {base.map((it, idx) => {
          const m = meta[it.id] || {};
          const timeText = timeAgo(m.createdAt || Date.now());
          const liked = !!m.liked;
          const heartClass = liked
            ? "fa-solid fa-heart"
            : "fa-regular fa-heart";
          const heartStyle = liked ? { color: HEART_COLOR } : undefined;

          return (
            <div
              key={it.id}
              className={`${styles.card} ${idx === 0 ? styles.firstCard : ""}`}
              onClick={() => goDetail(it.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") && goDetail(it.id)
              }
            >
              <div className={styles.cardContent}>
                <div className={styles.titleRow}>
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
                      <i
                        className={heartClass}
                        aria-hidden="true"
                        style={heartStyle}
                      />
                      {m.likes ?? 0}
                    </div>
                  </div>
                </div>
              </div>

              {showThumb && (
                <div className={styles.thumb} aria-hidden="true">
                  사진
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showWrite && <MarketWrite onClose={() => setShowWrite(false)} />}
    </>
  );
}

export default function CommunityMarketOnly() {
  // 사이드바/우측 핫게시물 바 제거 → 가운데만 렌더
  return <MarketList boardKey="market" />;
}
