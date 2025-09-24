import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import BoardPage from "../src/pages/Board/BoardPage.jsx";
import ManagerPage from "../src/pages/manager/Manager.jsx";
import Header from "./components/Header.jsx";
<<<<<<< HEAD
import LoginPage from "./pages/login/login.jsx";
import SignupPage from "./pages/signup/signup.jsx";
=======
import LoginPage from "./pages/login/login.jsx"
>>>>>>> 63e0370fbb90575670f4aef217a2266f8b437677

export default function App() {
  // 👉 처음엔 로그인된 상태
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  return (
    <BrowserRouter>
<<<<<<< HEAD
      <Routes>
        <Route path="/board" element={<BoardPage />} />
        <Route path="/manager" element={<ManagerPage />} />
        <Route path="/" element={<LoginPage setIsLoggedIn={setIsLoggedIn} />} />
        {/* <Route path="/login" element={<Login />} /> */}
        <Route path="/signup" element={<SignupPage />} />
=======

      <Routes>
        <Route path="/board" element={<BoardPage />} />
        <Route path="/manager" element={<ManagerPage />} />
        <Route
          path="/"
          element={<LoginPage setIsLoggedIn={setIsLoggedIn} />}
        />
>>>>>>> 63e0370fbb90575670f4aef217a2266f8b437677
        {/* <Route path="/signup" element={<SignupPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
}
