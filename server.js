import express from "express";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "./db.js";
import cors from "cors";

const SECRET_KEY = "secret_key";

const app = express();
app.use(cors());
app.use(express.json());

// GET /api/suggestions?department=rd
app.get("/api/suggestions", async (req, res) => {
  try {
    const { department } = req.query; // query param 가져오기
    let query = `
      SELECT s.*, u.name AS user_name, d.department_name
      FROM Suggestion s
      JOIN User u ON s.user_id = u.user_id
      LEFT JOIN Department d ON s.department_id = d.department_id
    `;
    const params = [];

    if (department) {
      query += " WHERE d.department_name = ?";
      params.push(department);
    }

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/suggestions/:id
app.get("/api/suggestions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `
      SELECT s.*, u.name AS user_name, d.department_name
      FROM Suggestion s
      JOIN User u ON s.user_id = u.user_id
      LEFT JOIN Department d ON s.department_id = d.department_id
      WHERE s.suggestion_id = ?
      `,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/suggestions
app.post("/api/suggestions", async (req, res) => {
  try {
    const { title, description, expected_effect, user_id, department_id } =
      req.body;
    const [result] = await pool.query(
      `
      INSERT INTO Suggestion (title, description, expected_effect, user_id, department_id)
      VALUES (?, ?, ?, ?, ?)
      `,
      [title, description, expected_effect, user_id, department_id]
    );
    res.status(201).json({ suggestion_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/comments/:suggestion_id
app.get("/api/comments/:suggestion_id", async (req, res) => {
  try {
    const { suggestion_id } = req.params;
    const [rows] = await pool.query(
      `
      SELECT c.*, u.name AS user_name
      FROM Comment c
      JOIN User u ON c.user_id = u.user_id
      WHERE c.suggestion_id = ?
      ORDER BY c.created_at ASC
      `,
      [suggestion_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/comments
app.post("/api/comments", async (req, res) => {
  try {
    const { content, user_id, suggestion_id } = req.body;
    const [result] = await pool.query(
      `INSERT INTO Comment (content, user_id, suggestion_id) VALUES (?, ?, ?)`,
      [content, user_id, suggestion_id]
    );
    res.status(201).json({ comment_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/votes
app.post("/api/votes", async (req, res) => {
  try {
    const { user_id, suggestion_id, score } = req.body;
    const [result] = await pool.query(
      `INSERT INTO Vote (user_id, suggestion_id, score) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE score = ?`,
      [user_id, suggestion_id, score, score] // 이미 투표한 경우 업데이트
    );
    res.status(201).json({ vote_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/performance
app.post("/api/performance", async (req, res) => {
  try {
    const {
      suggestion_id,
      expected_reduction_rate,
      actual_reduction_rate,
      expected_productivity,
      actual_productivity,
      expected_cost_saving,
      actual_cost_saving,
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO Performance
       (suggestion_id, expected_reduction_rate, actual_reduction_rate, expected_productivity, actual_productivity, expected_cost_saving, actual_cost_saving)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        suggestion_id,
        expected_reduction_rate,
        actual_reduction_rate,
        expected_productivity,
        actual_productivity,
        expected_cost_saving,
        actual_cost_saving,
      ]
    );

    res.status(201).json({ performance_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => {
  console.log("http://localhost:5000");
});
