import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import HotPost from "./components/HotPost";
import styles from "../../styles/Community.module.css";

function Community() {
  const [boards, setBoards] = useState([]);
  const [hotPosts, setHotPosts] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/boards")
      .then((res) => res.json())
      .then((data) => setBoards(data))
      .catch((err) => console.error(err));
  }, []);

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
              {boards.map((board) => (
                <li
                  key={board.board_id}
                  onClick={() => nav(`/community/board/${board.board_id}`)}
                >
                  <div className={styles.commBoardsName}>
                    <i className="fa-solid fa-message"></i>
                    <div>{board.name}</div>
                  </div>
                  <span>{board.post_count}</span>
                </li>
              ))}
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

            <div className={styles.ad}>광고 자리</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Community;
