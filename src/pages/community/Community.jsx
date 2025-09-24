import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import styles from "../../styles/Community.module.css";

function Community() {
  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Header />
        <div>
          <div className={styles.commBoards}>
            <div>게시판 목록</div>
            <ul>
              <li>
                <i class="fa-solid fa-message"></i>
                <div>자유게시판</div> <span>324</span>
              </li>
              <li>
                <i class="fa-solid fa-clock"></i>
                <div>신입게시판</div>
                <span>89</span>
              </li>
              <li>
                <i class="fa-solid fa-lock"></i>
                <div>비밀게시판</div>
                <span>156</span>
              </li>
              <li>
                <i class="fa-solid fa-circle-info"></i>
                <div>정보게시판</div>
                <span>203</span>
              </li>
              <li>
                <i class="fa-solid fa-cart-shopping"></i>
                <div>장터게시판</div>
                <span>67</span>
              </li>
              <li>
                <i class="fa-solid fa-newspaper"></i>
                <div>시사/이슈</div>
                <span>134</span>
              </li>
            </ul>
          </div>
          <div className={styles.commPosts}></div>
          <div className={styles.commHot}></div>
        </div>
      </div>
    </div>
  );
}

export default Community;
