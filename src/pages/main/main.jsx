// src/pages/Dashboard.jsx (혹은 위치에 맞게 붙여넣기)
import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

import {
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

import axios from "axios";

const COLORS = ["#4a6cf7", "#69bff8", "#ff9f43", "#e3eaf5", "#b0c4ff"];

// 부서 id -> 이름 매핑 (DB에 실제 department 테이블이 있으면 백엔드에서 이름을 내려주도록 바꾸셔도 됩니다)
const DEPT_MAP = {
  1: "생산",
  2: "품질",
  3: "설계",
  4: "안전",
  5: "기타"
};

const Dashboard = () => {
  const [suggestionTrend, setSuggestionTrend] = useState([]); // line chart
  const [deptToday, setDeptToday] = useState([]); // pie (전체 기준)
  const [deptSolved, setDeptSolved] = useState([]); // donut
  const [effects, setEffects] = useState({});
  const [recentSolved, setRecentSolved] = useState(null);
  const [totalCount, setTotalCount] = useState({ total: 0, today: 0 });

  useEffect(() => {
    async function fetchAll() {
      try {
        // counts
        const countsRes = await axios.get("http://localhost:4000/api/performance/counts");
        setTotalCount(countsRes.data || { total: 0, today: 0 });

        // weekly-trend (날짜별 집계) -> Recharts용으로 약간 포맷팅
        const trendRes = await axios.get("http://localhost:4000/api/performance/weekly-trend");
        // trendRes.data 형식: [{ day: "2025-09-18", total: 3, solved: 2 }, ...]
        const trendFormatted = (trendRes.data || []).map(item => {
          // 날짜를 보기좋게 (예: "09-18" 또는 요일)로 바꿔서 day 키에 넣음
          const d = new Date(item.day);
          const label = `${d.getMonth() + 1}-${String(d.getDate()).padStart(2, "0")}`; // "9-18" 형태
          return { day: label, total: Number(item.total), solved: Number(item.solved) };
        });
        setSuggestionTrend(trendFormatted);

        // deptToday (전체 기준 부서별 건수) -> { name, value } 형태
        const dtRes = await axios.get("http://localhost:4000/api/performance/dept-today");
        const dtFormatted = (dtRes.data || []).map(r => ({
          name: DEPT_MAP[r.id] || `부서-${r.id}`,
          value: Number(r.value)
        }));
        setDeptToday(dtFormatted);

        // deptSolved
        const dsRes = await axios.get("http://localhost:4000/api/performance/dept-solved");
        const dsFormatted = (dsRes.data || []).map(r => ({
          name: DEPT_MAP[r.id] || `부서-${r.id}`,
          value: Number(r.value)
        }));
        setDeptSolved(dsFormatted);

        // expected-effects
        const efRes = await axios.get("http://localhost:4000/api/performance/expected-effects");
        setEffects(efRes.data || { avg_productivity: null, total_cost_saving: 0, safety_improvements: 0 });

        // recent-solved
        const recentRes = await axios.get("http://localhost:4000/api/performance/recent-solved");
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
          {/* 오늘/전체 건의 수 (전체 기반) */}
          <div className="card">
            <div className="card-title">오늘 건의 수</div>
            <div className="card-content">
              전체 건의 수: <b>{totalCount.total}</b> / (오늘: <b>{totalCount.today}</b>)
            </div>
          </div>

          {/* 선 그래프 */}
          <div className="card">
            <div className="card-title">총 해결된 건의 우선순위 그래프</div>
            <div className="card-content" style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={suggestionTrend}>
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
            <div className="card-title">가장 최근 해결된 문제</div>
            <div className="card-content">
              {recentSolved ? (
                <>
                  <b
                    style={{
                      display: "block",
                      marginBottom: "12px", // 글자 아래 간격
                      marginTop: "8px",     // 글자 위 간격
                    }}
                  >
                    {recentSolved.effect_summary} (
                    {new Date(recentSolved.resolved_at).toLocaleString()})
                  </b>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginTop: "12px", // 텍스트와 이미지 사이 간격
                      flexGrow: 1,
                    }}
                  >
                    <img
                      src="/monitor.png"
                      alt="모니터링 개선 이미지"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "250px",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                </>
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
            <div className="card-title">기대효과 (DB 기준)</div>
            <div className="card-content">
              <ul>
                <li>작업 효율성 평균: <b>{effects.avg_productivity ? Number(effects.avg_productivity).toFixed(2) : "데이터 없음"}%</b></li>
                <li>안전 개선 완료 건수(예시 dept_id=4): <b>{effects.safety_improvements ?? 0}</b> 건</li>
                <li>총 원가 절감(합계): <b>{effects.total_cost_saving ? Number(effects.total_cost_saving).toLocaleString() : 0}</b> 원</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
