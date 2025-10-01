import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import HotPost from "./components/HotPost";
import styles from "../../styles/Community.module.css";

function Community() {
  const [boards, setBoards] = useState([]);
  const [hotPosts, setHotPosts] = useState([]);
  const nav = useNavigate();
  const location = useLocation(); // ✅ 현재 경로 사용

  // ✅ 현재 URL에서 board_id 추출 (예: /community/board/5)
  const currentBoardId = (() => {
    const m = location.pathname.match(/\/community\/board\/(\d+)/);
    return m ? Number(m[1]) : null;
  })();

  useEffect(() => {
    fetch("http://localhost:5000/api/boards")
      .then((res) => res.json())
      .then((data) => {
        setBoards(data);

        // ✅ boardId가 없으면 자유게시판으로 이동
        if (location.pathname === "/community") {
          const freeBoard = data.find((b) => b.name === "자유게시판") || data[0];
          if (freeBoard) nav(`/community/board/${freeBoard.board_id}`);
        }
      })
      .catch((err) => console.error(err));
  }, [nav, location.pathname]);

  useEffect(() => {
    fetch("http://localhost:5000/api/hot-posts")
      .then((res) => res.json())
      .then((data) => setHotPosts(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <Header />
        <div className={styles.commContainer}>
          <div className={styles.commBoards}>
            <div>게시판 목록</div>
            <ul>
              {boards.map((board) => {
                const isActive = currentBoardId === Number(board.board_id);
                return (
                  <li
                    key={board.board_id}
                    className={isActive ? styles.activeBoard : undefined} // ✅ 활성화 클래스
                    onClick={() => nav(`/community/board/${board.board_id}`)}
                  >
                    <div className={styles.commBoardsName}>
                      <i className="fa-solid fa-message"></i>
                      <div>{board.name}</div>
                    </div>
                    <span>{board.post_count}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className={styles.commPostsContainer}>
            <Outlet />
          </div>

          <div className={styles.commRightbar}>
            <div className={styles.commHot}>
              <div>🔥HOT 게시글</div>
              {hotPosts.map((post) => (
                <HotPost key={post.post_id} post={post} />
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Community;
