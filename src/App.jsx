import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import BoardPage from "../src/pages/Board/BoardPage.jsx";
import ManagerPage from "../src/pages/manager/Manager.jsx";
import Header from "./components/Header.jsx";
import LoginPage from "./pages/login/login.jsx";
import SignupallPage from "./pages/signupall/signupall.jsx";
import SignupPage from "./pages/signup(employee)/signup.jsx";
import SignupPage2 from "./pages/signup(admin)/signup4.jsx";
import Dashboard from "./pages/main/main.jsx";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/board" element={<BoardPage />} />
        <Route path="/manager" element={<ManagerPage />} />
        <Route path="/" element={<LoginPage setIsLoggedIn={setIsLoggedIn} />} />
        {/* <Route path="/login" element={<Login />} /> */}
        <Route path="/main" element={<Dashboard />} />
        <Route path="/signupall" element={<SignupallPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/signup4" element={<SignupPage2 />} />
        <Route
          path="/login"
          element={<LoginPage setIsLoggedIn={setIsLoggedIn} />}
        />
      </Routes>
    </BrowserRouter>
  );
}
