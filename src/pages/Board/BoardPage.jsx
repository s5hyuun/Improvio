import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import styles from "../../styles/Board.module.css";

function BoardPage() {
  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Header />
        <div className={styles.boardContainer}>a</div>
      </div>
    </div>
  );
}

export default BoardPage;
