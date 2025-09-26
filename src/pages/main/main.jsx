import React from "react";
import "./Dashboard.css"; // 이 안에 스타일 넣는다고 가정
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

const Dashboard = () => {
  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        <Header />

        <div className="dashboard-container">
          <div className="card">
            <div className="card-title">오늘 건의 수</div>
            <div className="card-content">전체 건의 수, 오늘 건의 수</div>
          </div>

          <div className="card">
            <div className="card-title">그래프</div>
            <div className="card-content">총 해결된 건의 우선순위 그래프</div>
          </div>

          <div className="card">
            <div className="card-title">가장 최근 해결된 문제</div>
            <div className="card-content">가장 최근 해결된 문제</div>
          </div>

          <div className="card">
            <div className="card-title">
              부서별 오늘 올라온 건의 수(원그래프)
            </div>
            <div className="card-content">
              부서 별 오늘 올라온 건의 수(원그래프)
            </div>
          </div>

          <div className="card">
            <div className="card-title">부서별 해결된 건의 수(원그래프)</div>
            <div className="card-content">부서 별 해결된 건의 수(원그래프)</div>
          </div>

          <div className="card">
            <div className="card-title">기대효과</div>
            <div className="card-content">기대효과</div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
