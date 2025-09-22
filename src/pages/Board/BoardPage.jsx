import Header from "../../components/Header";
import SideBar from "../../components/Sidebar";
import styles from "../../styles/Board.module.css";

function BoardPage() {
  return (
    <div className={styles.boardContainer}>
      <SideBar />
      <div className={styles.rightSide}>
        <Header />
        <div className={styles.main}>main</div>
      </div>
    </div>
  );
}

export default BoardPage;
