import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import styles from "../../styles/Board.module.css";
import BoardContent from "./components/BoardContent";

function BoardPage() {
  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Header />
        <div className={styles.boardContainer}>
          <div className={styles.boardTitle}>
            <div>
              <p>개선 제안 시스템</p>
              <p>현장 직원들의 불편사항 및 개선 아이디어를 공유해주세요</p>
            </div>
            <button>+ 글쓰기</button>
          </div>
          <div className={styles.boardContents}>
            <div className={styles.boardColumn}>
              <div>Proposal</div>
              <div className={styles.cardRow}>
                <BoardContent />
              </div>
            </div>
            <div className={styles.boardColumn}>
              <div>In Progress</div>
              <div className={styles.cardRow}>
                <BoardContent />
                <BoardContent />
              </div>
            </div>
            <div className={styles.boardColumn}>
              <div>Complete</div>
              <div className={styles.cardRow}>
                <div className={styles.noContent}>완료된 제안이 없습니다.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BoardPage;
