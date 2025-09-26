import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import performanceRouter from "./routes/performance.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS 설정
app.use(cors({
    origin: "http://localhost:5173"
}));

// JSON 파싱
app.use(express.json());

// API 라우터
app.use("/api/performance", performanceRouter);

// React 빌드 static 서빙
app.use(express.static(path.join(__dirname, "dist")));

// SPA 라우팅 (React 라우터 지원)
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// 서버 실행

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

