import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import axios from "axios";
import styles from "../../styles/Community.module.css";

function Community() {
  const [posts, setPosts] = useState([]);
  const [hotPosts, setHotPosts] = useState([]);

  useEffect(() => {
    // 1️⃣ 자유게시판 게시글 가져오기
    axios
      .get("http://localhost:5000/api/posts")
      .then((res) => setPosts(res.data))
      .catch((err) => console.error(err));

    // 2️⃣ HOT 게시글 가져오기 (예: vote_count 기준 상위 4개)
    axios
      .get("http://localhost:5000/api/suggestions") // 예시로 Suggestion API 사용
      .then((res) => {
        const sorted = res.data
          .sort((a, b) => b.vote_count - a.vote_count)
          .slice(0, 4);
        setHotPosts(sorted);
      })
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
              {[
                { name: "자유게시판", icon: "fa-message", count: 324 },
                { name: "신입게시판", icon: "fa-clock", count: 89 },
                { name: "비밀게시판", icon: "fa-lock", count: 156 },
                { name: "정보게시판", icon: "fa-circle-info", count: 203 },
                { name: "장터게시판", icon: "fa-cart-shopping", count: 67 },
                { name: "시사/이슈", icon: "fa-newspaper", count: 134 },
              ].map((board) => (
                <li key={board.name}>
                  <div className={styles.commBoardsName}>
                    <i className={`fa-solid ${board.icon}`}></i>
                    <div>{board.name}</div>
                  </div>
                  <span>{board.count}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 게시글 리스트 */}
          <div className={styles.commPostsContainer}>
            {posts.map((post) => (
              <div key={post.post_id} className={styles.postCard}>
                <h3>{post.title}</h3>
                <p>{post.content}</p>
                <div className={styles.postInfo}>
                  <span>작성자: {post.username}</span>
                  <span>
                    작성일: {new Date(post.created_at).toLocaleString()}
                  </span>
                </div>
                {post.comments && post.comments.length > 0 && (
                  <div className={styles.postComments}>
                    <strong>댓글:</strong>
                    <ul>
                      {post.comments.map((c) => (
                        <li key={c.postcomment_id}>
                          {c.username}: {c.content}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 오른쪽 HOT 게시글 */}
          <div className={styles.commRightbar}>
            <div className={styles.commHot}>
              <div>🔥HOT 게시글</div>
              {hotPosts.map((hp) => (
                <div key={hp.suggestion_id} className={styles.hotPost}>
                  <span>{hp.title}</span>
                  <span>👍 {hp.vote_count}</span>
                </div>
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
