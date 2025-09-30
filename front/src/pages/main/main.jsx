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

const COLORS = [
  "#dbeafe", // 연한 하늘빛 블루
  "#93c5fd", // 중간 밝기 블루
  "#3b82f6", // 진한 파랑
  "#1e40af", // 네이비 블루
  "#334155", // 블루그레이 다크
];

const CustomLegend = ({ payload }) => {
  return (
    <ul
      style={{
        listStyle: "none",
        display: "flex",
        justifyContent: "center",
        paddingLeft: 0,
        marginTop: 10,
        marginBottom: 10,
        gap: "16px",
      }}
    >
      {payload.map((entry, index) => (
        <li
          key={`item-${index}`}
          style={{
            display: "flex",
            alignItems: "center",
            color: "#333",
            fontWeight: "bold",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 12,
              height: 12,
              backgroundColor: entry.color,
              borderRadius: "50%",
              marginRight: 6,
            }}
          />
          {entry.value}
        </li>
      ))}
    </ul>
  );
};

const CustomLineLegend = ({ payload }) => {
  return (
    <ul
      style={{
        listStyle: "none",
        display: "flex",
        justifyContent: "center",
        paddingLeft: 0,
        marginTop: 10,
        marginBottom: 10,
        gap: "16px",
      }}
    >
      {payload.map((entry, index) => (
        <li
          key={`line-item-${index}`}
          style={{
            display: "flex",
            alignItems: "center",
            color: "#333",
            fontWeight: "bold",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 20,
              height: 4,
              backgroundColor: entry.color,
              marginRight: 8,
              borderRadius: 2,
            }}
          />
          {entry.value}
        </li>
      ))}
    </ul>
  );
};

const CustomBarLegend = ({ payload }) => {
  return (
    <ul
      style={{
        listStyle: "none",
        display: "flex",
        justifyContent: "center",
        paddingLeft: 0,
        marginTop: 10,
        marginBottom: 0,
        gap: "16px",
      }}
    >
      {payload.map((entry, index) => (
        <li
          key={`bar-item-${index}`}
          style={{
            display: "flex",
            alignItems: "center",
            color: "#333",
            fontWeight: "bold",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 12,
              height: 12,
              backgroundColor: entry.color,
              borderRadius: 2,
              marginRight: 6,
            }}
          />
          {entry.value}
        </li>
      ))}
    </ul>
  );
};

const DEPT_MAP = {
  1: "생산",
  2: "품질",
  3: "설계",
  4: "안전",
  5: "기타",
};

const Dashboard = () => {
  const [suggestionTrend, setSuggestionTrend] = useState({ day: [], cum: [] });
  const [deptToday, setDeptToday] = useState([]);
  const [deptSolved, setDeptSolved] = useState([]);
  const [effects, setEffects] = useState({});
  const [recentSolved, setRecentSolved] = useState(null);

  useEffect(() => {
    async function fetchAll() {
      try {
        // 1) 일 단위 데이터 (전체 기간)
        const trendRes = await axios.get("http://localhost:5000/api/performance/weekly-trend");
        const rows = (trendRes.data || [])
          .map((r) => ({
            dateObj: new Date(r.day),
            dayStr: String(r.day), // YYYY-MM-DD
            total: Number(r.total),
            solved: Number(r.solved || 0),
            status: r.status,
          }))
          .sort((a, b) => a.dateObj - b.dateObj); // 날짜 오름차순

        // (A) BarChart용: 요일 라벨(월~금만)
        const dayOfWeekMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const dayData = rows
          .map((item) => ({
            day: dayOfWeekMap[item.dateObj.getDay()],
            total: item.total,
            solved: item.solved,
            status: item.status,
          }))
          .filter((item) => ["Mon", "Tue", "Wed", "Thu", "Fri"].includes(item.day));

        // (B) LineChart용: 누적 합 + X축 '일(1~31)'만
        let runningTotal = 0;
        let runningSolved = 0;
        const cumData = rows.map((item) => {
          runningTotal += item.total;
          runningSolved += item.solved;
          return {
            date: item.dayStr, // 툴팁에 보여줄 전체 날짜
            d: item.dateObj.getDate(), // X축 표시에 사용할 '일(1~31)'
            total: runningTotal, // 누적 총 건의
            solved: runningSolved, // 누적 완료 건의
          };
        });

        setSuggestionTrend({ day: dayData, cum: cumData });

        // 2) 부서별 전체 건의 수
        const dtRes = await axios.get("http://localhost:5000/api/performance/dept-today");
        setDeptToday((dtRes.data || []).map((r) => ({
          name: DEPT_MAP[r.id] || `부서-${r.id}`,
          value: Number(r.value),
        })));

        // 3) 부서별 해결된 건의 수
        const dsRes = await axios.get("http://localhost:5000/api/performance/dept-solved");
        setDeptSolved((dsRes.data || []).map((r) => ({
          name: DEPT_MAP[r.id] || `부서-${r.id}`,
          value: Number(r.value),
        })));

        // 4) 기대효과
        const efRes = await axios.get("http://localhost:5000/api/performance/expected-effects");
        setEffects(efRes.data || { avg_productivity: null, total_cost_saving: 0, safety_improvements: 0 });

        // 5) 최근 해결된 건
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
          {/* 일 단위 건의 수 - BarChart (월~금) */}
          <div className="card">
            <div className="card-title">일 단위 건의 수</div>
            <div className="card-content" style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={suggestionTrend.day || []}
                  margin={{ top: 10, right: 28, left: 0, bottom: 0 }} // ✅ 오른쪽 마진
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e3eaf5" />
                  <XAxis dataKey="day" stroke="#333" />
                  <YAxis stroke="#333" />
                  <Tooltip />
                  <Legend content={<CustomBarLegend />} />
                  <Bar dataKey="total" fill="#1e40af" name="총 건의" />
                  <Bar dataKey="solved" fill="#60a5fa" name="완료 건의" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 해결된 이슈 흐름 - LineChart (누적/우상향, X축=일, 점 표시) */}
          <div className="card">
            <div className="card-title">해결된 이슈 흐름(누적)</div>
            <div className="card-content" style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={suggestionTrend.cum || []}
                  margin={{ top: 10, right: 28, left: 0, bottom: 0 }} // ✅ 오른쪽 마진
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e3eaf5" />
                  <XAxis dataKey="d" stroke="#333" />
                  <YAxis stroke="#333" />
                  <Tooltip
                    labelFormatter={(label, payload) => {
                      const full = payload?.[0]?.payload?.date; // YYYY-MM-DD
                      return full || `${label}일`;
                    }}
                  />
                  <Legend content={<CustomLineLegend />} />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5, stroke: "#3b82f6", fill: "#fff" }}
                    name="누적 총 건의"
                  />
                  <Line
                    type="monotone"
                    dataKey="solved"
                    stroke="#1e40af"
                    strokeWidth={3}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5, stroke: "#1e40af", fill: "#fff" }}
                    name="누적 완료 건의"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 최신 해결 사례 */}
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

          {/* 부서별 전체 건의 수 */}
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
                  <Legend content={<CustomLegend />} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 부서별 해결된 건의 수 */}
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
                  <Legend content={<CustomLegend />} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 실적 지표 */}
          <div className="card">
            <div className="card-title">실적 지표</div>
            <div className="card-content">
              <ul className="effect-list">
                <li className="effect-item efficiency">
                  <div className="effect-label">작업 효율성 평균</div>
                  <div className="effect-box">
                    <span className="effect-icon"><i className="fa-solid fa-gear"></i></span>
                    <div className="effect-value">
                      {effects.avg_productivity ? Number(effects.avg_productivity).toFixed(2) : "데이터 없음"}%
                    </div>
                  </div>
                </li>
                <li className="effect-item safety">
                  <div className="effect-label">안전 개선 완료 건수</div>
                  <div className="effect-box">
                    <span className="effect-icon"><i className="fa-solid fa-helmet-safety"></i></span>
                    <div className="effect-value">{effects.safety_improvements ?? 0} 건</div>
                  </div>
                </li>
                <li className="effect-item saving">
                  <div className="effect-label">총 원가 절감</div>
                  <div className="effect-box">
                    <span className="effect-icon"><i className="fa-solid fa-sack-dollar"></i></span>
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
