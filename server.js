import express from "express";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "./db.js";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";

const SECRET_KEY = "secret_key";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// POST /api/suggestions (제안 + 첨부파일)
app.post("/api/suggestions", upload.array("files"), async (req, res) => {
  try {
    const { title, description, expected_effect, user_id, department_id } =
      req.body;

    // 1) Suggestion 저장
    const [result] = await pool.query(
      `
      INSERT INTO Suggestion (title, description, expected_effect, user_id, department_id)
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        title,
        description,
        expected_effect || null,
        user_id || null,
        department_id || null,
      ]
    );

    const suggestionId = result.insertId;

    // 2) 파일 있으면 Attachment 저장
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await pool.query(
          `INSERT INTO Attachment (suggestion_id, file_path) VALUES (?, ?)`,
          [suggestionId, file.filename]
        );
      }
    }

    res.status(201).json({
      suggestion_id: suggestionId,
      message: "제안이 등록되었습니다.",
    });
  } catch (err) {
    console.error("Error inserting suggestion:", err);
    res.status(500).json({ error: err.message });
  }
});

// 업로드된 파일 제공
app.use("/uploads", express.static("uploads"));
// GET /api/suggestions
app.get("/api/suggestions", async (req, res) => {
  try {
    const [suggestions] = await pool.query(`
      SELECT s.*,
             u.name AS user_name, d.department_name,
             -- 댓글 수
             (SELECT COUNT(*) 
              FROM Comment c 
              WHERE c.suggestion_id = s.suggestion_id) AS comment_count,
             -- 좋아요 수 (댓글별 좋아요 합계)
             (SELECT count(*) FROM Vote WHERE suggestion_id = s.suggestion_id) AS vote_count
      FROM Suggestion s
      LEFT JOIN User u ON s.user_id = u.user_id left join department d on s.department_id=d.department_id
      ORDER BY s.created_at DESC
    `);

    res.json(suggestions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// 제안 개수 조회
app.get("/api/suggestions/count", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT COUNT(*) AS count FROM suggestion");
    res.json({ count: rows[0].count });
  } catch (err) {
    console.error("Error fetching suggestion count:", err);
    res.status(500).json({ error: "Failed to fetch suggestion count" });
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

// POST /api/suggestions/:id/status
// This endpoint specifically updates the status of a suggestion.
app.post("/api/suggestions/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status is required." });
    }

    const [result] = await pool.query(
      `UPDATE Suggestion SET status = ? WHERE suggestion_id = ?`,
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Suggestion not found." });
    }

    res.json({ message: "Suggestion status updated successfully." });
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

// POST /api/comments/:id/like (좋아요 추가)
app.post("/api/comments/:id/like", async (req, res) => {
  try {
    const { id } = req.params; // comment_id
    const { user_id } = req.body;

    await pool.query(
      `INSERT INTO Comment_Like (user_id, comment_id)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE created_at = CURRENT_TIMESTAMP`,
      [user_id, id]
    );

    res.status(201).json({ message: "Liked" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/comments/:id/like (좋아요 취소)
app.delete("/api/comments/:id/like", async (req, res) => {
  try {
    const { id } = req.params; // comment_id
    const { user_id } = req.body;

    const [result] = await pool.query(
      `DELETE FROM Comment_Like WHERE user_id = ? AND comment_id = ?`,
      [user_id, id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Like not found" });

    res.json({ message: "Unliked" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/comments/:id/likes (좋아요 개수)
app.get("/api/comments/:id/likes", async (req, res) => {
  try {
    const { id } = req.params; // comment_id

    const [[row]] = await pool.query(
      `SELECT COUNT(*) AS like_count FROM Comment_Like WHERE comment_id = ?`,
      [id]
    );

    res.json({ comment_id: id, like_count: row.like_count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 회원가입
app.post("/api/auth/register", async (req, res) => {
  const { name, username, password, role, department_id } = req.body;

  try {
    // 중복 확인
    const [existing] = await pool.query(
      "SELECT * FROM User WHERE username = ?",
      [username]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: "이미 존재하는 아이디입니다." });
    }

    // 비밀번호 해싱
    const hashed = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO User (name, username, password, role, department_id) 
       VALUES (?, ?, ?, ?, ?)`,
      [name, username, hashed, role || "employee", department_id || null]
    );

    res.json({ message: "회원가입 성공" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT u.user_id, u.name, u.username, u.role, d.department_name
      FROM User u
      LEFT JOIN Department d ON u.department_id = d.department_id
      ORDER BY u.user_id ASC
    `);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 개인정보 수정 (이름, 부서, role)
app.put("/api/user/:id", async (req, res) => {
  const { id } = req.params;
  const { name, department_id, role } = req.body;

  try {
    await pool.query(
      `UPDATE User 
       SET name = ?, department_id = ?, role = ? 
       WHERE user_id = ?`,
      [name, department_id || null, role || "employee", id]
    );

    res.json({ message: "개인정보가 수정되었습니다." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/suggestions/:id
// This endpoint updates the status and/or an urgent flag for a suggestion.
app.put("/api/suggestions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, is_urgent } = req.body;

    // Build the query and parameters dynamically based on what's provided in the request body.
    const updates = [];
    const params = [];

    if (status) {
      updates.push("status = ?");
      params.push(status);
    }
    if (typeof is_urgent === "boolean") {
      updates.push("is_urgent = ?");
      params.push(is_urgent);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update." });
    }

    const query = `UPDATE Suggestion SET ${updates.join(
      ", "
    )} WHERE suggestion_id = ?`;
    params.push(id);

    const [result] = await pool.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Suggestion not found." });
    }

    res.json({ message: "Suggestion updated successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/suggestions/:id/votes
// This endpoint gets the total score for a given suggestion based on user votes.
app.get("/api/suggestions/:id/votes", async (req, res) => {
  try {
    const { id } = req.params; // suggestion_id
    const [[row]] = await pool.query(
      `SELECT SUM(score) AS total_score FROM Vote WHERE suggestion_id = ?`,
      [id]
    );

    const totalScore = row.total_score || 0; // If no votes, the sum is null, so default to 0.

    res.json({ suggestion_id: id, total_score: totalScore });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/suggestions/:id/details
// This endpoint retrieves all details for a specific suggestion, including votes,
// comments, and attachments, to populate the detailed view modal.
app.get("/api/suggestions/:id/details", async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Get suggestion and performance data
    const [suggestionRows] = await pool.query(
      `
      SELECT 
        s.suggestion_id, s.title, s.description, s.status, s.created_at, u.user_id,
        u.name AS user_name, d.department_name,
        p.expected_reduction_rate, p.actual_reduction_rate,
        p.expected_productivity, p.actual_productivity,
        p.expected_cost_saving, p.actual_cost_saving
      FROM Suggestion s
      JOIN User u ON s.user_id = u.user_id
      LEFT JOIN Department d ON s.department_id = d.department_id
      LEFT JOIN Performance p ON s.suggestion_id = p.suggestion_id
      WHERE s.suggestion_id = ?
      `,
      [id]
    );

    if (suggestionRows.length === 0) {
      return res.status(404).json({ error: "Suggestion not found" });
    }

    const suggestion = suggestionRows[0];

    // 2. Get total votes
    const [[voteRow]] = await pool.query(
      `SELECT SUM(score) AS total_score, COUNT(*) AS vote_count FROM Vote WHERE suggestion_id = ?`,
      [id]
    );

    suggestion.total_score = voteRow.total_score || 0;
    suggestion.vote_count = voteRow.vote_count || 0;

    // 3. Get comments
    const [commentRows] = await pool.query(
      `
  SELECT 
    c.*, 
    u.name AS user_name, 
    d.department_name,
    COUNT(cl.comment_id) AS like_count
  FROM Comment c
  JOIN User u ON c.user_id = u.user_id
  LEFT JOIN Department d ON u.department_id = d.department_id
  LEFT JOIN Comment_Like cl ON c.comment_id = cl.comment_id
  WHERE c.suggestion_id = ?
  GROUP BY c.comment_id
  ORDER BY c.created_at ASC
  `,
      [id]
    );
    suggestion.comments = commentRows;

    // 4. Get attachments
    const [attachmentRows] = await pool.query(
      `SELECT attachment_id, file_path FROM Attachment WHERE suggestion_id = ?`,
      [id]
    );
    suggestion.attachments = attachmentRows;

    res.json(suggestion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/suggestions/:id/vote
// This endpoint updates a user's vote on a suggestion.
app.put("/api/suggestions/:id/vote", async (req, res) => {
  try {
    const { id } = req.params; // suggestion_id
    const { user_id, score } = req.body;

    const [result] = await pool.query(
      `INSERT INTO Vote (user_id, suggestion_id, score)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE score = ?`,
      [user_id, id, score, score]
    );

    res.json({ message: "Vote updated successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/attachments
// This endpoint handles saving attachment file paths to the database.
// NOTE: A file upload middleware (e.g., multer) is required in a production environment
// to handle the file upload itself and get the file_path.
app.post("/api/attachments", async (req, res) => {
  try {
    const { suggestion_id, file_path } = req.body;

    if (!suggestion_id || !file_path) {
      return res
        .status(400)
        .json({ error: "Suggestion ID and file path are required." });
    }

    const [result] = await pool.query(
      `INSERT INTO Attachment (suggestion_id, file_path) VALUES (?, ?)`,
      [suggestion_id, file_path]
    );

    res.status(201).json({
      attachment_id: result.insertId,
      message: "Attachment added successfully.",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/departments
// This endpoint retrieves the full list of departments from the database.
app.get("/api/departments", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT department_id, department_name FROM Department`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/members", async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT u.user_id, u.name AS user_name, u.username, u.role,
             u.join_date, u.status,
             d.department_name, u.department_id
      FROM User u
      LEFT JOIN Department d ON u.department_id = d.department_id
      ORDER BY u.user_id ASC
    `);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => {
  console.log("http://localhost:5000");
});
