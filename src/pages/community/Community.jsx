import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Post from "../community/components/Post";
import HotPost from "./components/HotPost";

import styles from "../../styles/Community.module.css";

function Community() {
  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Header />
        <div className={styles.commContainer}>
          <div className={styles.commBoards}>
            <div>게시판 목록</div>
            <ul>
              <li>
                <div className={styles.commBoardsName}>
                  <i class="fa-solid fa-message"></i>
                  <div>자유게시판</div>
                </div>
                <span>324</span>
              </li>
              <li>
                <div className={styles.commBoardsName}>
                  <i class="fa-solid fa-clock"></i>
                  <div>신입게시판</div>
                </div>
                <span>89</span>
              </li>
              <li>
                <div className={styles.commBoardsName}>
                  <i class="fa-solid fa-lock"></i>
                  <div>비밀게시판</div>
                </div>
                <span>156</span>
              </li>
              <li>
                <div className={styles.commBoardsName}>
                  <i class="fa-solid fa-circle-info"></i>
                  <div>정보게시판</div>
                </div>
                <span>203</span>
              </li>
              <li>
                <div className={styles.commBoardsName}>
                  <i class="fa-solid fa-cart-shopping"></i>
                  <div>장터게시판</div>
                </div>
                <span>67</span>
              </li>
              <li>
                <div className={styles.commBoardsName}>
                  <i class="fa-solid fa-newspaper"></i>
                  <div>시사/이슈</div>
                </div>
                <span>134</span>
              </li>
            </ul>
          </div>
          <div className={styles.commPostsContainer}>
            <div>
              <i class="fa-solid fa-message"></i>
              <div>자유게시판</div> <span>( 324 )</span>
            </div>
            <div className={styles.commPosts}>
              <Post />
              <Post />
              <Post />
              <Post />
            </div>
          </div>
          <div className={styles.commRightbar}>
            <div className={styles.commHot}>
              <div>🔥HOT 게시글</div>
              <HotPost />
              <HotPost />
              <HotPost />
              <HotPost />
            </div>
            <div className={styles.ad}>궹고 자리</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Community;
