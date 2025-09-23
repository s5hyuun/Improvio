import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import BoardPage from "../src/pages/Board/BoardPage.jsx";
import ManagerPage from "../src/pages/manager/Manager.jsx";
import Header from "./components/Header.jsx";

function LoginPage({ setIsLoggedIn }) {
  return (
    <div className="p-4">
      <h2>로그인 페이지</h2>
      <button className="btn" onClick={() => setIsLoggedIn(true)}>
        로그인하기
      </button>
    </div>
  );
}

function SignupPage() {
  return (
    <div className="p-4">
      <h2>회원가입 페이지</h2>
    </div>
  );
}

export default function App() {
  // 👉 처음엔 로그인된 상태
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  return (
    <BrowserRouter>
      <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />

      <Routes>
        <Route path="/board" element={<BoardPage />} />
        <Route path="/manager" element={<ManagerPage />} />
        <Route
          path="/login"
          element={<LoginPage setIsLoggedIn={setIsLoggedIn} />}
        />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </BrowserRouter>
  );
}
