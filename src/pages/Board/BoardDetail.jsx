import styles from "../../styles/Board.module.css";

function BoardDetail({ suggestion, onClose }) {
  if (!suggestion) return null;
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3>제목</h3>
        <p>여기에 게시글 내용이 들어갑니다.</p>

        <button onClick={onClose}>닫기</button>
      </div>
    </div>
  );
}
export default BoardDetail;
