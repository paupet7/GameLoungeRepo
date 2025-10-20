const sql = require('mssql');

// Azure SQL Database configuration
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER, // e.g., 'your-server.database.windows.net'
  database: process.env.DB_NAME,
  options: {
    encrypt: true, // Required for Azure
    trustServerCertificate: false,
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// Connection pool
let pool = null;

// Get database connection
async function getConnection() {
  try {
    if (!pool) {
      pool = await sql.connect(config);
      console.log('✅ Connected to Azure SQL Database');
    }
    return pool;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

// Close connection
async function closeConnection() {
  try {
    if (pool) {
      await pool.close();
      pool = null;
      console.log('Database connection closed');
    }
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
}

module.exports = {
  sql,
  getConnection,
  closeConnection
};