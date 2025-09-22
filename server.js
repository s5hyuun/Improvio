// server.js
import express from 'express';
import pool from './db.js'; // .js 확장자 필수
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
/** ✅ 모든 Best Suggestions 조회 */
app.get("/api/best-suggestions", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT b.*, s.title, s.description, u.name AS user_name
       FROM Best_Suggestions b
       JOIN Suggestion s ON b.suggestion_id = s.suggestion_id
       JOIN User u ON s.user_id = u.user_id`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** ✅ 특정 Best Suggestion 조회 */
app.get("/api/best-suggestions/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM Best_Suggestions WHERE best_id = ?",
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** ✅ 추천/투표 추가 */
app.post("/api/best-suggestions", async (req, res) => {
  const { suggestion_id, vote_count = 1, avg_star_score = 0.0 } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO Best_Suggestions (suggestion_id, vote_count, avg_star_score)
       VALUES (?, ?, ?)`,
      [suggestion_id, vote_count, avg_star_score]
    );
    res.json({ best_id: result.insertId, suggestion_id, vote_count, avg_star_score });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** ✅ 투표 수/별점 업데이트 */
app.put("/api/best-suggestions/:id", async (req, res) => {
  const { vote_count, avg_star_score } = req.body;
  try {
    await pool.query(
      `UPDATE Best_Suggestions
       SET vote_count = ?, avg_star_score = ?
       WHERE best_id = ?`,
      [vote_count, avg_star_score, req.params.id]
    );
    res.json({ message: "Updated successfully", best_id: req.params.id, vote_count, avg_star_score });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** ✅ 추천 삭제 */
app.delete("/api/best-suggestions/:id", async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM Best_Suggestions WHERE best_id = ?",
      [req.params.id]
    );
    res.json({ message: "Deleted successfully", best_id: req.params.id });
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
