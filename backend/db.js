const mysql = require('mysql2/promise');

let pool = null;

const dbInit = async () => {
    const config = {
    host: 'localhost',
    user: 'root',
    password: 'admin',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };

  const connection = await mysql.createConnection(config);
  await connection.query('CREATE DATABASE IF NOT EXISTS massage');
  console.log('✅ Database đã tạo hoặc tồn tại');
  await connection.end();

  pool = mysql.createPool({
    ...config,
    database: 'shopping',
  });

  // Tạo bảng nếu chưa có
  const conn = await pool.getConnection();
  try {

    await conn.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'USER'
    )
  `);

    console.log('✅ Các bảng đã tạo hoặc tồn tại');
  } finally {
    conn.release(); 
  }
};

const getDb = () => pool;

module.exports = { dbInit, getDb };
