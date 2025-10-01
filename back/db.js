import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "1234",
  port:3307,
  database: "improvio_db",
  waitForConnections: true,
  connectionLimit: 5,
});

export default pool;
