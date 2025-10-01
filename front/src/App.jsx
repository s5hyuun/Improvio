import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import BoardPage from "../src/pages/Board/BoardPage.jsx";
import ManagerPage from "../src/pages/manager/Manager.jsx";
import Community from "../src/pages/community/Community.jsx";
import LoginPage from "./pages/Login/Login.jsx";
import PostList from "./pages/community/components/PostList.jsx";
import PostDetail from "./pages/community/components/PostDetail.jsx";
import SignupallPage from "./pages/signupall/signupall.jsx";
import SignupPage from "./pages/signup(employee)/signup.jsx";
import SignupPage2 from "./pages/signup(admin)/signup4.jsx";
import Dashboard from "./pages/main/main.jsx";
import "./i18n"; // i18n 초기화

import MarketList from "./pages/community/components/MarketList.jsx";
import MarketDetail from "./pages/community/components/MarketDetail.jsx";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/main" element={<Dashboard />} />
        <Route path="/signupall" element={<SignupallPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/signup4" element={<SignupPage2 />} />
        <Route
          path="/login"
          element={<LoginPage setIsLoggedIn={setIsLoggedIn} />}
        />
        <Route path="/board" element={<BoardPage />} />
        <Route path="/manager" element={<ManagerPage />} />
        <Route path="/" element={<LoginPage setIsLoggedIn={setIsLoggedIn} />} />

        <Route path="/community" element={<Community />}>
          {/* <Route path="board/5" element={<MarketList />} /> */}
          {/* <Route path="board/5/:postId" element={<MarketDetail />} /> */}
          <Route path="board/:boardId" element={<PostList />} />
          <Route path=":postId" element={<PostDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
