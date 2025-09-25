import { useParams, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function PostDetail() {
  const { postId } = useParams();
  const nav = useNavigate();
  const [post, setPost] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/posts/${postId}`)
      .then((res) => setPost(res.data))
      .catch((err) => console.error(err));
  }, [postId]);

  if (!post) return <div>Loading...</div>;

  return (
    <div>
      <button onClick={() => nav(-1)}>← 목록</button>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </div>
  );
}

export default PostDetail;
