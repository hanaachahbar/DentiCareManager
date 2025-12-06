const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const initializeTables = require("./initTables");

// Database file (will be created automatically if it doesn't exist)
const dbPath = path.resolve(__dirname, "../dentiCare.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if(err) {
    return console.error("Failed to connect to SQLite:", err.message);
  }
  console.log("Connected to SQLite database!");
  initializeTables(db);
});


module.exports = db;