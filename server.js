// server.js
import express from 'express';
import pool from './config/db.js'; // .js 확장자 필수
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});


/** ✅ 제안 등록 */
app.post("/api/suggestions", async (req, res) => {
  const { title, description, expected_effect, user_id } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO Suggestion (title, description, expected_effect, user_id) VALUES (?, ?, ?, ?)",
      [title, description, expected_effect, user_id]
    );
    res.json({ suggestion_id: result.insertId, title, description, expected_effect, user_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** ✅ 제안 전체 조회 */
app.get("/api/suggestions", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT s.*, u.name AS user_name FROM Suggestion s JOIN User u ON s.user_id = u.user_id"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** ✅ 특정 제안 조회 */
app.get("/api/suggestions/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM Suggestion WHERE suggestion_id = ?",
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** ✅ 제안 상태 변경 (관리자 승인/반려/완료) */
app.put("/api/suggestions/:id/status", async (req, res) => {
  const { status } = req.body;
  try {
    await pool.query(
      "UPDATE Suggestion SET status = ? WHERE suggestion_id = ?",
      [status, req.params.id]
    );
    res.json({ message: "Status updated", suggestion_id: req.params.id, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => {
  console.log(`🚀 Server running on port 5000`);
});
