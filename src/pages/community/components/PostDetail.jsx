import { useParams, useNavigate } from "react-router-dom";
import styles from "../../../styles/Community.module.css";
import PostComment from "../components/PostComment";
function PostDetail() {
  const { postId } = useParams();
  const nav = useNavigate();
  return (
    <>
      <div className={styles.postDetailContainer}>
        <div>
          <button onClick={() => nav(-1)} className={styles.backButton}>
            <i class="fa-solid fa-arrow-left"></i>자유게시판 목록
          </button>
        </div>
        <div className={styles.postDetailContent}>
          <h2>젬옥 입니다.(#{postId})</h2>
          <p>
            안녕하세요 반갑습니다 처음 뵙겟습니다 잘부탁드립니다
            <br />
            안녕하세요 반갑습니다 처음 뵙겟습니다 잘부탁드립니다
            <br />
            안녕하세요 반갑습니다 처음 뵙겟습니다 잘부탁드립니다
            <br />
            안녕하세요 반갑습니다 처음 뵙겟습니다 잘부탁드립니다
            <br />
            안녕하세요 반갑습니다 처음 뵙겟습니다 잘부탁드립니다
            <br />
          </p>
        </div>
        <div className={styles.postDetailIcons}>
          <i class="fa-regular fa-thumbs-up"></i>
          <span>좋아요</span>
          <i class="fa-solid fa-message"></i>
          <span>댓글 23</span>
          <i class="fa-solid fa-eye"></i>
          <span>567</span>
          <i class="fa-regular fa-heart"></i>
          <span>45</span>
        </div>
        <div className={styles.postAd}>광고자리</div>
        <div className={styles.postDetailComments}>
          <PostComment />
          <PostComment />
          <PostComment />
        </div>
      </div>
    </>
  );
}
export default PostDetail;
