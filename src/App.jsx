import React, { useState } from "react";
import Header from "./pages/manager/components/Header.jsx";
import Sidebar from "./pages/manager/components/Sidebar.jsx";
import "./index.css";

export default function App() {
  const [dept, setDept] = useState("rd"); 

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="flex">
        <Sidebar
          selectedDepartment={dept}
          onDepartmentChange={setDept}
        />

        <div className="flex-1 min-h-screen flex flex-col">
          <Header />

          <main className="p-6">
            <section className="rounded-2xl bg-white/70 backdrop-blur border border-blue-100 p-6">
              <h2 className="text-2xl font-semibold text-blue-900 mb-2">대시보드</h2>
              <p className="text-blue-800">
                현재 선택된 부서:{" "}
                <span className="font-semibold">{dept}</span>
              </p>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-36 rounded-2xl border border-blue-100 bg-white/60"
                  />
                ))}
              </div>

              <div className="h-[1200px]" />
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
