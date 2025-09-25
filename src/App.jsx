import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import BoardPage from "../src/pages/Board/BoardPage.jsx";
import ManagerPage from "../src/pages/manager/Manager.jsx";
import Community from "../src/pages/community/Community.jsx";
import LoginPage from "./pages/Login/Login.jsx";
import PostList from "./pages/community/components/PostList.jsx";
import PostDetail from "./pages/community/components/PostDetail.jsx";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/board" element={<BoardPage />} />
        <Route path="/manager" element={<ManagerPage />} />
        {/* <Route path="/community" element={<Community />} /> */}
        <Route path="/" element={<LoginPage setIsLoggedIn={setIsLoggedIn} />} />

        <Route path="/community" element={<Community />}>
          <Route index element={<PostList />} />
          <Route path=":postId" element={<PostDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
