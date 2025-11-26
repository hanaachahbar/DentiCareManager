const db = require("./db");

// Initialize all database tables
const initializeTables = () => {
  // Create patients table with your exact schema
  const createPatientsTable = `
    CREATE TABLE IF NOT EXISTS patients (
      patient_id INT AUTO_INCREMENT PRIMARY KEY,
      first_name VARCHAR(255) NOT NULL,
      last_name VARCHAR(255) NOT NULL,
      date_of_birth DATE,
      gender VARCHAR(20),
      phone_number VARCHAR(20),
      emergency_call VARCHAR(20),
      email VARCHAR(255),
      address TEXT,
      city VARCHAR(255),
      notes TEXT,
      allergies TEXT,
      chronic_conditions TEXT,
      hereditary_conditions TEXT,
      current_medications TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  // Execute table creation queries
  db.query(createPatientsTable, (err) => {
    if (err) {
      console.error("Error creating patients table:", err);
    } else {
      console.log("✓ Patients table ready");
    }
  });
};

module.exports = initializeTables;

/*

module.exports = function initializeTables(db) {
  // Create patients table
  const createPatientsTable = `
    CREATE TABLE IF NOT EXISTS patients (
      patient_id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      date_of_birth TEXT,
      gender TEXT,
      phone_number TEXT,
      emergency_call TEXT,
      email TEXT,
      address TEXT,
      city TEXT,
      notes TEXT,
      allergies TEXT,
      chronic_conditions TEXT,
      hereditary_conditions TEXT,
      current_medications TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `;

  try {
    db.prepare(createPatientsTable).run();
    console.log("✓ Patients table ready");
  } catch (err) {
    console.error("Error creating patients table:", err);
  }
};


*/