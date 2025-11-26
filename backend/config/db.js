const mysql = require("mysql2");
const initializeTables = require("./initTables");

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

db.getConnection((err, connection) => {
  if(err) {
    console.error("Database connection failed:", err);
  } 
  else {
    console.log("Connected to MySQL database");
    connection.release();
    // Initialize tables after successful connection
    initializeTables();
  }
});

module.exports = db;


/*  For SQLite

const Database = require("better-sqlite3");
const initializeTables = require("./initTables");

// Connect to local SQLite database file (will create if it doesn't exist)
const db = new Database("./database.db", { verbose: console.log });
db.pragma("foreign_keys = ON");

// Initialize tables
initializeTables(db);

console.log("Connected to SQLite database");

module.exports = db;
*/