import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import BoardPage from "../src/pages/Board/BoardPage.jsx";
import ManagerPage from "../src/pages/manager/Manager.jsx";
import Community from "../src/pages/community/Community.jsx";
import LoginPage from "./pages/Login/Login.jsx";
import MarketList from "../src/pages/community/components/MarketList.jsx";
import MarketDetail from "../src/pages/community/components/MarketDetail.jsx";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/board" element={<BoardPage />} />
        <Route path="/manager" element={<ManagerPage />} />
        <Route path="/community" element={<Community />}>
          <Route index element={<MarketList />} />

          <Route path="market" element={<MarketList />} />
          <Route path="market/:postId" element={<MarketDetail />} />

          <Route path="*" element={<div style={{ padding: 20 }}>페이지를 찾을 수 없습니다.</div>} />
        </Route>

        <Route path="*" element={<div style={{ padding: 20 }}>페이지를 찾을 수 없습니다.</div>} />
      </Routes>
    </BrowserRouter>
  );
}