import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'improvio_db',
    waitForConnections: true,
    connectionLimit: 10,
});


