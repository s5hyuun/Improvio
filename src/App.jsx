// App.jsx
import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import BoardPage from "../src/pages/Board/BoardPage.jsx";
import ManagerPage from "../src/pages/manager/Manager.jsx";
import Community from "../src/pages/community/Community.jsx";
import LoginPage from "./pages/Login/Login.jsx";

// ✅ 자유/장터 공통 목록 컴포넌트
import MarketList from "../src/pages/community/components/MarketList.jsx";
// ✅ 상세 페이지 컴포넌트 (반드시 생성 및 default export)
import MarketDetail from "../src/pages/community/components/MarketDetail.jsx";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/board" element={<BoardPage />} />
        <Route path="/manager" element={<ManagerPage />} />

        {/* 커뮤니티 레이아웃 */}
        <Route path="/community" element={<Community />}>
          {/* /community → 자유게시판 목록 (MarketList가 URL로 보드 판별) */}
          <Route index element={<MarketList />} />

          {/* /community/market → 장터게시판 목록 */}
          <Route path="market" element={<MarketList />} />

          {/* ✅ /community/market/:postId → 상세 페이지 */}
          <Route path="market/:postId" element={<MarketDetail />} />

          {/* 커뮤니티 내부 404 대응(선택) */}
          <Route path="*" element={<div style={{ padding: 20 }}>페이지를 찾을 수 없습니다.</div>} />
        </Route>

        {/* 전역 404(선택) */}
        <Route path="*" element={<div style={{ padding: 20 }}>페이지를 찾을 수 없습니다.</div>} />
      </Routes>
    </BrowserRouter>
  );
}
