import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import HotPost from "./components/HotPost";
import styles from "../../styles/Community.module.css";
import { useTranslation } from "react-i18next";

function Community() {
  const [boards, setBoards] = useState([]);
  const [hotPosts, setHotPosts] = useState([]);
  const nav = useNavigate();
  const { t, i18n } = useTranslation();

  //  번역 함수
  async function translateText(text, lang) {
    const res = await fetch("http://localhost:4000/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, targetLang: lang.toUpperCase() }),
    });
    const data = await res.json();
    return data.translatedText || text;
  }

  useEffect(() => {
    async function fetchBoards() {
      try {
        const res = await fetch("http://localhost:4000/api/boards");
        const data = await res.json();

        const lang = i18n.language || "ko";

        if (lang === "ko") {
          setBoards(data);
          return;
        }

       
        const translatedData = await Promise.all(
          data.map(async (board) => {
            const name = await translateText(board.name, lang);
            return { ...board, name };
          })
        );

        setBoards(translatedData);
      } catch (err) {
        console.error(err);
      }
    }

    fetchBoards();
  }, [i18n.language]);

  useEffect(() => {
    async function fetchHotPosts() {
      try {
        const res = await fetch("http://localhost:4000/api/hot-posts");
        const data = await res.json();

        const lang = i18n.language || "ko";

        if (lang === "ko") {
          setHotPosts(data);
          return;
        }

        
        const translatedData = await Promise.all(
          data.map(async (post) => {
            const title = await translateText(post.title, lang);
            const content = await translateText(post.content, lang);
            return { ...post, title, content };
          })
        );

        setHotPosts(translatedData);
      } catch (err) {
        console.error(err);
      }
    }

    fetchHotPosts();
  }, [i18n.language]);

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <Header />
        <div className={styles.commContainer}>
          <div className={styles.commBoards}>
            <div>{t("community.boardList")}</div>
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
              <div>{t("community.hotPosts")}</div>
              {hotPosts.map((post) => (
                <HotPost key={post.post_id} post={post} />
              ))}
            </div>

            <div className={styles.ad}>{t("community.adArea")}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Community;
