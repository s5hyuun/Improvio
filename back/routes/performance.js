// backend/routes/performance.js
import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// 1) counts - DB 전체 건수(총), (optional) today_count도 포함 (현재 날짜 기준)
router.get("/counts", async (req, res) => {
    try {
        const [[totalRow]] = await pool.query(`
      SELECT COUNT(*) AS total_count FROM performance
    `);
        // (옵션) 오늘 건수도 같이 보내고 싶으면 아래처럼 계산 (원하면 제거가능)
        const [[todayRow]] = await pool.query(`
      SELECT COUNT(*) AS today_count FROM performance WHERE DATE(recorded_at) = CURDATE()
    `);
        res.json({ total: totalRow.total_count, today: todayRow.today_count });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 2) weekly-trend - 전체 데이터를 날짜별로 집계한 결과 (날짜 필터 없음, DB에 있는 날짜 범위 전부)
router.get("/weekly-trend", async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT DATE(recorded_at) AS day,
             COUNT(*) AS total,
             SUM(status='completed') AS solved
      FROM performance
      GROUP BY DATE(recorded_at)
      ORDER BY DATE(recorded_at)
    `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 3) dept-today (여기서는 'today'가 아닌 전체 기준의 부서별 건수 반환)
router.get("/dept-today", async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT department_id AS id, COUNT(*) AS value
      FROM performance
      GROUP BY department_id
      ORDER BY department_id
    `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 4) dept-solved - 부서별 완료 건수 (전체 기준)
router.get("/dept-solved", async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT department_id AS id, COUNT(*) AS value
      FROM performance
      WHERE status='completed'
      GROUP BY department_id
      ORDER BY department_id
    `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 5) recent-solved - 가장 최근에 완료된 항목 (effect_summary + resolved_at)
router.get("/recent-solved", async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT effect_summary, resolved_at
      FROM performance
      WHERE status='completed'
      ORDER BY resolved_at DESC
      LIMIT 1
    `);
        res.json(rows[0] || null);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 6) expected-effects - 기대효과 집계 (전체 기준)
router.get("/expected-effects", async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT 
        AVG(actual_productivity) AS avg_productivity,
        SUM(actual_cost_saving) AS total_cost_saving,
        SUM(status='completed' AND department_id=4) AS safety_improvements
      FROM performance
    `);
        res.json(rows[0] || { avg_productivity: null, total_cost_saving: 0, safety_improvements: 0 });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 7) (옵션) 모든 performance 레코드 반환 (디버그/미리보기용)
router.get("/all-performance", async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT * FROM performance ORDER BY performance_id DESC LIMIT 1000`);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
