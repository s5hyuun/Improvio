import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "improvio_db",
  port:3307,
  waitForConnections: true,
  connectionLimit: 5,
});

export default pool;
