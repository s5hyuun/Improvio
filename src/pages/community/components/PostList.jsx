import { useNavigate } from "react-router-dom";
import Post from "./Post";
import styles from "../../../styles/Community.module.css";

function PostList() {
  const nav = useNavigate();
  return (
    <>
      <div>
        <i class="fa-solid fa-message"></i>
        <div>자유게시판</div> <span>( 324 )</span>
      </div>
      <div className={styles.commPosts}>
        {/* <Post />
        <Post />
        <Post />
        <Post /> */}
        {[1, 2, 3, 4].map((id) => (
          <Post key={id} onClick={() => nav(`/community/${id}`)} />
        ))}
      </div>
    </>
  );
}
export default PostList;
