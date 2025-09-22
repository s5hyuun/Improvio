import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config(); // 또는 애플리케이션 진입점(server.js)에서 호출해도 됩니다.

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
