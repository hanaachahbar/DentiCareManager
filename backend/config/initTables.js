const db = require("./db");

module.exports = (db) => {
  // enabling foreign keys
  db.run("PRAGMA foreign_keys = ON;", (err) => {
    if (err) console.error("Failed to enable foreign keys:", err.message);
    else console.log("Foreign key enforcement enabled");
  });

  // Initialize all database tables
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
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `;

  db.run(createPatientsTable, (err) => {
    if (err) {
      console.error("Error creating patients table:", err.message);
    } else {
      console.log("✓ Patients table ready");
    }
  });
};