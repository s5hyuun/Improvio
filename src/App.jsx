import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import BoardPage from "../src/pages/Board/BoardPage.jsx";
import ManagerPage from "../src/pages/manager/Manager.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/board" element={<BoardPage />} />
        <Route path="/manager" element={<ManagerPage />} />
      </Routes>
    </BrowserRouter>
  );
}
