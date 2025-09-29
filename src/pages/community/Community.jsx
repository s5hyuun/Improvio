import { useEffect, useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import HotPost from "./components/HotPost";
import styles from "../../styles/Community.module.css";

function Boards({ counts }) {
  return (
    <div className={styles.commBoards}>
      <div className={styles.sectionTitle}>게시판 목록</div>

      <ul className={styles.boardList}>
        <li>
          <Link to="/community" className={styles.commBoardsName}>
            <i className="fa-solid fa-message" />
            <div>자유게시판</div>
          </Link>
          <span className={styles.badge}>{counts.free ?? 0}</span>
        </li>

        <li>
          <div className={styles.commBoardsName}>
            <i className="fa-solid fa-clock" />
            <div>신입게시판</div>
          </div>
          <span className={styles.badge}>{counts.rookie ?? 0}</span>
        </li>

        <li>
          <div className={styles.commBoardsName}>
            <i className="fa-solid fa-lock" />
            <div>비밀게시판</div>
          </div>
          <span className={styles.badge}>{counts.secret ?? 0}</span>
        </li>

        <li>
          <div className={styles.commBoardsName}>
            <i className="fa-solid fa-circle-info" />
            <div>정보게시판</div>
          </div>
          <span className={styles.badge}>{counts.info ?? 0}</span>
        </li>

        <li>
          <Link to="market" className={styles.commBoardsName}>
            <i className="fa-solid fa-cart-shopping" />
            <div>장터게시판</div>
          </Link>
          <span className={styles.badge}>{counts.market ?? 0}</span>
        </li>

        <li>
          <div className={styles.commBoardsName}>
            <i className="fa-solid fa-newspaper" />
            <div>시사/이슈</div>
          </div>
          <span className={styles.badge}>{counts.issue ?? 0}</span>
        </li>
      </ul>
    </div>
  );
}

function Rightbar() {
  return (
    <aside className={styles.commRightbar}>
      <div className={styles.commHot}>
        <div className={styles.sectionTitle}>🔥HOT 게시글</div>
        <HotPost />
        <HotPost />
        <HotPost />
        <HotPost />
      </div>
      <div className={styles.ad}>광고 자리</div>
    </aside>
  );
}

export default function Community() {
  const loc = useLocation();

  const [counts, setCounts] = useState({
    free: 0,
    rookie: 0,
    secret: 0,
    info: 0,
    market: 0,
    issue: 0,
  });

  useEffect(() => {
    const onCount = (e) => {
      const { key, count } = e.detail || {};
      if (!key) return;
      setCounts((prev) => ({ ...prev, [key]: Number(count) || 0 }));
    };
    window.addEventListener("board:count", onCount);
    return () => window.removeEventListener("board:count", onCount);
  }, []);

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <Header />
        <div className={styles.commContainer}>
          <Boards counts={counts} />

          <div className={styles.commPostsContainer}>
            <Outlet key={loc.pathname} />
          </div>

          <Rightbar />
        </div>
      </div>
    </div>
  );
}
