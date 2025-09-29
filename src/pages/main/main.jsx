import React from "react";
import "./Dashboard.css"; // 외부 스타일 파일을 사용하는 경우
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

const Dashboard = () => {
  const cards = [
    "전체 건의 수, 오늘 건의 수",
    "총 해결된 건의 우선순위 그래프",
    "가장 최근 해결된 문제",
    "부서 별 오늘 올라온 건의 수(원그래프)",
    "부서 별 해결된 건의 수(원그래프)",
    "기타효과",
  ];

  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        <Header />
        <div className="dashboard-container">
          {cards.map((title, idx) => (
            <div key={idx} className="card">
              <div className="card-content">{title}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
