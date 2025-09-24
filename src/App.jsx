import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import BoardPage from "../src/pages/Board/BoardPage.jsx";
import ManagerPage from "../src/pages/manager/Manager.jsx";
import LoginPage from "./pages/Login/Login.jsx";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/board" element={<BoardPage />} />
        <Route path="/manager" element={<ManagerPage />} />
        <Route path="/" element={<LoginPage setIsLoggedIn={setIsLoggedIn} />} />
      </Routes>
    </BrowserRouter>
  );
}
