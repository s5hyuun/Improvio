import { Outlet, Link, useLocation } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import HotPost from "./components/HotPost";
import styles from "../../styles/Community.module.css";

function Boards() {
  return (
    <div className={styles.commBoards}>
      <div className={styles.sectionTitle}>게시판 목록</div>
      <ul className={styles.boardList}>
        <li>
          <div className={styles.commBoardsName}>
            <i className="fa-solid fa-message" />
            <div>자유게시판</div>
          </div>
          <span className={styles.badge}>324</span>
        </li>

        <li>
          <div className={styles.commBoardsName}>
            <i className="fa-solid fa-clock" />
            <div>신입게시판</div>
          </div>
          <span className={styles.badge}>89</span>
        </li>

        <li>
          <div className={styles.commBoardsName}>
            <i className="fa-solid fa-lock" />
            <div>비밀게시판</div>
          </div>
          <span className={styles.badge}>156</span>
        </li>

        <li>
          <div className={styles.commBoardsName}>
            <i className="fa-solid fa-circle-info" />
            <div>정보게시판</div>
          </div>
          <span className={styles.badge}>203</span>
        </li>

        <li className={styles.noActive}>
          <Link to="market" className={styles.commBoardsName}>
            <i className="fa-solid fa-cart-shopping" />
            <div>장터게시판</div>
          </Link>
          <span className={styles.badge}>67</span>
        </li>

        <li>
          <div className={styles.commBoardsName}>
            <i className="fa-solid fa-newspaper" />
            <div>시사/이슈</div>
          </div>
          <span className={styles.badge}>134</span>
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
        <HotPost /><HotPost /><HotPost /><HotPost />
      </div>
      <div className={styles.ad}>광고 자리</div>
    </aside>
  );
}

export default function Community() {
  const loc = useLocation();
  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <Header />
        <div className={styles.commContainer}>
          <Boards />
          <div className={styles.commPostsContainer}>
            <Outlet key={loc.pathname} />
          </div>
          <Rightbar />
        </div>
      </div>
    </div>
  );
}
