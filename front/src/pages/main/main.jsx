// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import axios from "axios";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";

// const COLORS = ["#4a6cf7", "#69bff8", "#ff9f43", "#e3eaf5", "#b0c4ff"];

const COLORS = [
  "#dbeafe", // 연한 하늘빛 블루
  "#93c5fd", // 중간 밝기 블루
  "#3b82f6", // 진한 파랑
  "#1e40af", // 네이비 블루
  "#334155", // 블루그레이 다크
];

// const COLORS = [
//   "#e0e7ff", // 연보라빛 연청색 (배경용)
//   "#a5b4fc", // 라벤더 톤 블루
//   "#6366f1", // 인디고 블루
//   "#4338ca", // 진한 블루 퍼플
//   "#1e1b4b", // 다크 네이비 퍼플
// ];






const DEPT_MAP = {
  1: "생산",
  2: "품질",
  3: "설계",
  4: "안전",
  5: "기타",
};

const Dashboard = () => {
  const [suggestionTrend, setSuggestionTrend] = useState([]);
  const [deptToday, setDeptToday] = useState([]);
  const [deptSolved, setDeptSolved] = useState([]);
  const [effects, setEffects] = useState({});
  const [recentSolved, setRecentSolved] = useState(null);

  useEffect(() => {
    async function fetchAll() {
      try {
        // 일 단위 데이터 (월~금, 영어 요일)
        const trendRes = await axios.get("http://localhost:5000/api/performance/weekly-trend");
        const dayOfWeekMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        const dayData = (trendRes.data || [])
          .map((item) => {
            const d = new Date(item.day);
            const dayLabel = dayOfWeekMap[d.getDay()];
            return {
              day: dayLabel,
              total: Number(item.total),
              solved: Number(item.solved || 0),
              status: item.status,
            };
          })
          .filter((item) => ["Mon", "Tue", "Wed", "Thu", "Fri"].includes(item.day));

        setSuggestionTrend({ day: dayData });

        // 부서별 전체 건의 수
        const dtRes = await axios.get("http://localhost:5000/api/performance/dept-today");
        setDeptToday((dtRes.data || []).map((r) => ({
          name: DEPT_MAP[r.id] || `부서-${r.id}`,
          value: Number(r.value),
        })));

        // 부서별 해결된 건의 수
        const dsRes = await axios.get("http://localhost:5000/api/performance/dept-solved");
        setDeptSolved((dsRes.data || []).map((r) => ({
          name: DEPT_MAP[r.id] || `부서-${r.id}`,
          value: Number(r.value),
        })));

        // 기대효과
        const efRes = await axios.get("http://localhost:5000/api/performance/expected-effects");
        setEffects(efRes.data || { avg_productivity: null, total_cost_saving: 0, safety_improvements: 0 });

        // 최근 해결된 건
        const recentRes = await axios.get("http://localhost:5000/api/performance/recent-solved");
        setRecentSolved(recentRes.data || null);
      } catch (err) {
        console.error("데이터 로드 오류:", err);
      }
    }

    fetchAll();
  }, []);

  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        <Header />
        <div className="dashboard-container">

          {/* 일 단위 건의 수 - BarChart */}
          <div className="card">
            <div className="card-title">일 단위 건의 수</div>
            <div className="card-content" style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={suggestionTrend.day || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e3eaf5" />
                  <XAxis dataKey="day" stroke="#333" />
                  <YAxis stroke="#333" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#4a6cf7" name="총 건의" />
                  <Bar dataKey="solved" fill="#69bff8" name="완료 건의" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 일 단위 LineChart */}
          <div className="card">
            <div className="card-title">해결된 이슈 흐름</div>
            <div className="card-content" style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={suggestionTrend.day || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e3eaf5" />
                  <XAxis dataKey="day" stroke="#333" />
                  <YAxis stroke="#333" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#4a6cf7" strokeWidth={3} />
                  <Line type="monotone" dataKey="solved" stroke="#69bff8" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 최근 해결된 문제 */}
          <div className="card">
            <div className="card-title">최신 해결 사례</div>
            <div className="card-content">
  {recentSolved ? (
    <div className="recent-solved-box">
      <div className="recent-solved-summary">
        {recentSolved.effect_summary} <br />
        <small>({new Date(recentSolved.resolved_at).toLocaleString()})</small>
      </div>
      <img
        src="http://localhost:5000/uploads/14.png"
        alt="모니터링 개선 이미지"
        className="recent-solved-image"
      />
    </div>
  ) : (
    <span>데이터 없음</span>
  )}
</div>
          </div>

          {/* 부서별 전체 건의 수 - Pie */}
          <div className="card">
            <div className="card-title">부서별 전체 건의 수</div>
            <div className="card-content" style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={deptToday} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={false}>
                    {deptToday.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" height={3} wrapperStyle={{ marginTop: 10 }} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 부서별 해결된 건의 수 - 도넛 */}
          <div className="card">
            <div className="card-title">부서별 해결된 건의 수</div>
            <div className="card-content" style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={deptSolved} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={false}>
                    {deptSolved.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" height={3} wrapperStyle={{ marginTop: 10 }} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 기대효과 */}
          <div className="card">
  <div className="card-title">실적 지표</div>
  <div className="card-content">
    <ul className="effect-list">
  <li className="effect-item efficiency">
    <div className="effect-label">작업 효율성 평균</div>
    <div className="effect-box">
      <span className="effect-icon">📈</span>
      <div className="effect-value">
        {effects.avg_productivity ? Number(effects.avg_productivity).toFixed(2) : "데이터 없음"}%
      </div>
    </div>
  </li>
  <li className="effect-item safety">
    <div className="effect-label">안전 개선 완료 건수</div>
    <div className="effect-box">
      <span className="effect-icon">🛡️</span>
      <div className="effect-value">{effects.safety_improvements ?? 0} 건</div>
    </div>
  </li>
  <li className="effect-item saving">
    <div className="effect-label">총 원가 절감</div>
    <div className="effect-box">
      <span className="effect-icon">💰</span>
      <div className="effect-value">
        {effects.total_cost_saving ? Number(effects.total_cost_saving).toLocaleString() : 0} 원
      </div>
    </div>
  </li>
</ul>


  </div>
</div>


        </div>
      </main>
    </div>
  );
};

export default Dashboard;