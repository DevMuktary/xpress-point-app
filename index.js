const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

// 1. DATABASE CONNECTION
// It automatically finds the DATABASE_URL from Railway's variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// 2. CREATE 'users' TABLE ON STARTUP
// This runs once when the server starts to make sure our table exists
const createTables = async () => {
  const userTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      business_name VARCHAR(255),
      address TEXT,
      email VARCHAR(255) UNIQUE NOT NULL,
      phone_number VARCHAR(20) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'AGENT' NOT NULL,
      is_phone_verified BOOLEAN DEFAULT FALSE,
      is_email_verified BOOLEAN DEFAULT FALSE,
      is_identity_verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      bvn VARCHAR(11),
      nin VARCHAR(11)
    );
  `;
  try {
    await pool.query(userTableQuery);
    console.log("Database tables are ready.");
  } catch (err) {
    console.error("Error creating tables:", err);
  }
};

// 3. A TEST ENDPOINT
// This is to check if our server is running
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to Xpress Point API!' });
});

// 4. START THE SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  createTables(); // Create tables *before* we start listening
  console.log(`Server is running on port ${PORT}`);
});
