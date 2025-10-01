import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Post from "./Post";
import styles from "../../../styles/Community.module.css";
import { useTranslation } from "react-i18next";

function PostList() {
  const { boardId } = useParams();
  const nav = useNavigate();
  const [posts, setPosts] = useState([]);
  const { i18n } = useTranslation();

  // 번역 함수
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
    async function fetchPosts() {
      try {
        const res = await fetch(
          `http://localhost:4000/api/posts?board_id=${boardId}`
        );
        const data = await res.json();

        const lang = i18n.language || "ko";

        if (lang === "ko") {
          setPosts(data);
          return;
        }

      
        const translatedData = await Promise.all(
          data.map(async (post) => {
            const title = await translateText(post.title, lang);
            const content = await translateText(post.content, lang);
            return { ...post, title, content };
          })
        );

        setPosts(translatedData);
      } catch (err) {
        console.error(err);
      }
    }

    fetchPosts();
  }, [boardId, i18n.language]);

  return (
    <div className={styles.commPosts}>
      {posts.map((post) => (
        <Post
          key={post.post_id}
          onClick={() => nav(`/community/${post.post_id}`)}
          post={post}
        />
      ))}
    </div>
  );
}

export default PostList;
