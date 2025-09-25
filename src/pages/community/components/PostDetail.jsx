import { useParams, useNavigate } from "react-router-dom";

function PostDetail() {
  const { postId } = useParams();
  const nav = useNavigate();
  return (
    <div>
      <div>
        <button onClick={() => nav(-1)}>← 목록</button>
        <h1>제목 (#{postId})</h1>
        <p>내용...</p>
      </div>
    </div>
  );
}
export default PostDetail;
