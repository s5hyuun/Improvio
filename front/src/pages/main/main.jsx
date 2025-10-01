// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./Dashboard.css";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer
} from "recharts";

const COLORS = ["#4a6cf7", "#69bff8", "#ff9f43", "#e3eaf5", "#b0c4ff"];
const DEPT_MAP = { 1: "생산", 2: "품질", 3: "설계", 4: "안전", 5: "기타" };

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const [suggestionTrend, setSuggestionTrend] = useState([]);
  const [deptToday, setDeptToday] = useState([]);
  const [deptSolved, setDeptSolved] = useState([]);
  const [effects, setEffects] = useState({});
  const [recentSolved, setRecentSolved] = useState(null);
  const [totalCount, setTotalCount] = useState({ total: 0, today: 0 });

  async function translateText(text, targetLang) {
    try {
      const res = await axios.post("http://localhost:5000/api/translate", { text, targetLang });
      return res.data.translatedText;
    } catch (err) {
      console.error("번역 실패:", err);
      return text;
    }
  }

  useEffect(() => {
    async function fetchAll() {
      try {
        // 1. 총 건수
        const countsRes = await axios.get("http://localhost:5000/api/performance/counts");
        setTotalCount(countsRes.data || { total: 0, today: 0 });

        // 2. 주간 트렌드
        const trendRes = await axios.get("http://localhost:5000/api/performance/weekly-trend");
        const trendFormatted = (trendRes.data || []).map(item => {
          const d = new Date(item.day);
          const label = `${d.getMonth() + 1}-${String(d.getDate()).padStart(2, "0")}`;
          return { day: label, total: Number(item.total), solved: Number(item.solved) };
        });
        setSuggestionTrend(trendFormatted);

        // 3. 부서별 오늘 건의
        const dtRes = await axios.get("http://localhost:5000/api/performance/dept-today");
        let dtFormatted = (dtRes.data || []).map(r => ({
          name: DEPT_MAP[r.id] || `Dept-${r.id}`,
          value: Number(r.value),
        }));
        if (i18n.language !== "ko") {
          dtFormatted = await Promise.all(dtFormatted.map(async r => ({
            ...r,
            name: await translateText(r.name, i18n.language)
          })));
        }
        setDeptToday(dtFormatted);

        // 4. 부서별 해결 건의
        const dsRes = await axios.get("http://localhost:5000/api/performance/dept-solved");
        let dsFormatted = (dsRes.data || []).map(r => ({
          name: DEPT_MAP[r.id] || `Dept-${r.id}`,
          value: Number(r.value),
        }));
        if (i18n.language !== "ko") {
          dsFormatted = await Promise.all(dsFormatted.map(async r => ({
            ...r,
            name: await translateText(r.name, i18n.language)
          })));
        }
        setDeptSolved(dsFormatted);

        // 5. 기대효과
        const efRes = await axios.get("http://localhost:5000/api/performance/expected-effects");
        setEffects(efRes.data || { avg_productivity: null, total_cost_saving: 0, safety_improvements: 0 });

        // 6. 최근 해결된 건
        const recentRes = await axios.get("http://localhost:5000/api/performance/recent-solved");
        let recentData = recentRes.data || null;
        if (recentData && i18n.language !== "ko") {
          recentData.effect_summary = await translateText(recentData.effect_summary, i18n.language);
        }
        setRecentSolved(recentData);

      } catch (err) {
        console.error("데이터 로드 오류:", err);
      }
    }

    fetchAll();
  }, [i18n.language]);

  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        <Header />

        <div className="dashboard-container">
          {/* 오늘/전체 건의 수 */}
          <div className="card">
            <div className="card-title">{t("dashboard.todayCount")}</div>
            <div className="card-content">
              {t("dashboard.totalCount")}: <b>{totalCount.total}</b> / ({t("dashboard.today")}: <b>{totalCount.today}</b>)
            </div>
          </div>

          {/* 선 그래프 */}
          <div className="card">
            <div className="card-title">{t("dashboard.trendChart")}</div>
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
            <div className="card-title">{t("dashboard.recentSolved")}</div>
            <div className="card-content">
              {recentSolved ? (
                <>
                  <b style={{ display: "block", marginBottom: "12px", marginTop: "8px" }}>
                    {recentSolved.effect_summary} ({new Date(recentSolved.resolved_at).toLocaleString()})
                  </b>
                  <div style={{ display: "flex", justifyContent: "center", marginTop: "12px", flexGrow: 1 }}>
                    <img
                      src="/monitor.png"
                      alt={t("dashboard.monitorAlt", "Monitoring image")}
                      style={{ maxWidth: "100%", maxHeight: "250px", objectFit: "contain" }}
                    />
                  </div>
                </>
              ) : (
                <span>{t("dashboard.noData")}</span>
              )}
            </div>
          </div>

          {/* 부서별 전체 건의 수 */}
          <div className="card">
            <div className="card-title">{t("dashboard.deptToday")}</div>
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

          {/* 부서별 해결된 건의 수 */}
          <div className="card">
            <div className="card-title">{t("dashboard.deptSolved")}</div>
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
            <div className="card-title">{t("dashboard.expectedEffects")}</div>
            <div className="card-content">
              <ul>
                <li>{t("dashboard.avgProductivity")}: <b>{effects.avg_productivity ? Number(effects.avg_productivity).toFixed(2) : t("dashboard.noData")}%</b></li>
                <li>{t("dashboard.safetyImprovements")}: <b>{effects.safety_improvements ?? 0}</b></li>
                <li>{t("dashboard.totalCostSaving")}: <b>{effects.total_cost_saving ? Number(effects.total_cost_saving).toLocaleString() : 0}</b></li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
