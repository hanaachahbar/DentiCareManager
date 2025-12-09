const initializeTables = (db) => {
  console.log("\n🔧 Initializing database tables...\n");

  // Enable foreign keys first
  db.run("PRAGMA foreign_keys = ON;", (err) => {
    if (err) {
      console.error("❌ Failed to enable foreign keys:", err.message);
    } else {
      console.log("✓ Foreign key enforcement enabled");
    }
  });

  db.serialize(() => {
    // PATIENT TABLE
    db.run(`
      CREATE TABLE IF NOT EXISTS Patient (
        patient_id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        date_of_birth TEXT,
        gender TEXT,
        phone_number TEXT,
        emergency_call TEXT,
        email TEXT UNIQUE,
        address TEXT,
        city TEXT,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        allergies TEXT,
        chronic_conditions TEXT,
        hereditary_conditions TEXT,
        current_medications TEXT
      )
    `, (err) => {
      if (err) console.error("❌ Patient table:", err.message);
      else console.log("✓ Patient table ready");
    });

    // SERVICES TABLE
    db.run(`
      CREATE TABLE IF NOT EXISTS Services (
        service_id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER,
        service_name TEXT NOT NULL,
        status TEXT CHECK(status IN ('active', 'not_active')),
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES Patient(patient_id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) console.error("❌ Services table:", err.message);
      else console.log("✓ Services table ready");
    });

    // APPOINTMENT TABLE
    db.run(`
      CREATE TABLE IF NOT EXISTS Appointment (
        appointment_id INTEGER PRIMARY KEY AUTOINCREMENT,
        service_id INTEGER,
        appointment_date TEXT NOT NULL,
        status TEXT CHECK(status IN ('cancelled', 'pending', 'checked-in')),
        description TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (service_id) REFERENCES Services(service_id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) console.error("❌ Appointment table:", err.message);
      else console.log("✓ Appointment table ready");
    });

    // DOCUMENTS TABLE
    db.run(`
      CREATE TABLE IF NOT EXISTS Documents (
        document_id INTEGER PRIMARY KEY AUTOINCREMENT,
        appointment_id INTEGER,
        path TEXT NOT NULL,
        saved_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (appointment_id) REFERENCES Appointment(appointment_id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) console.error("❌ Documents table:", err.message);
      else console.log("✓ Documents table ready");
    });

    // MEDICATION TABLE
    db.run(`
      CREATE TABLE IF NOT EXISTS Medication (
        medication_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        common_uses TEXT
      )
    `, (err) => {
      if (err) console.error("❌ Medication table:", err.message);
      else console.log("✓ Medication table ready");
    });

    // PRESCRIPTION TABLE
    db.run(`
      CREATE TABLE IF NOT EXISTS Prescription (
        appointment_id INTEGER,
        medication_id INTEGER,
        dosage TEXT,
        frequency_per_day TEXT,
        duration_by_days TEXT,
        description TEXT,
        PRIMARY KEY (appointment_id, medication_id),
        FOREIGN KEY (appointment_id) REFERENCES Appointment(appointment_id) ON DELETE CASCADE,
        FOREIGN KEY (medication_id) REFERENCES Medication(medication_id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) console.error("❌ Prescription table:", err.message);
      else console.log("✓ Prescription table ready");
    });

    // PAYMENT TABLE - UPDATED VERSION
    db.run(`
      CREATE TABLE IF NOT EXISTS Payment (
        payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
        service_id INTEGER UNIQUE,
        total_amount REAL NOT NULL,
        paid_amount REAL DEFAULT 0,
        status TEXT DEFAULT 'unpaid' CHECK(status IN ('unpaid', 'partially_paid', 'completed')),
        description TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (service_id) REFERENCES Services(service_id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) console.error("❌ Payment table:", err.message);
      else console.log("✓ Payment table ready");
    });

    // INVOICES TABLE - UPDATED VERSION
    db.run(`
      CREATE TABLE IF NOT EXISTS Invoices (
        invoice_id INTEGER PRIMARY KEY AUTOINCREMENT,
        payment_id INTEGER,
        appointment_id INTEGER UNIQUE,
        amount REAL NOT NULL,
        description TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (payment_id) REFERENCES Payment(payment_id) ON DELETE CASCADE,
        FOREIGN KEY (appointment_id) REFERENCES Appointment(appointment_id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) console.error("❌ Invoices table:", err.message);
      else console.log("✓ Invoices table ready");
    });

    // LABS TABLE
    db.run(`
      CREATE TABLE IF NOT EXISTS Labs (
        lab_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        contact_person TEXT,
        phone_number TEXT,
        email TEXT UNIQUE,
        address TEXT
      )
    `, (err) => {
      if (err) console.error("❌ Labs table:", err.message);
      else console.log("✓ Labs table ready");
    });

    // LAB_WORK TABLE
    db.run(`
      CREATE TABLE IF NOT EXISTS Lab_work (
        lab_work_id INTEGER PRIMARY KEY AUTOINCREMENT,
        service_id INTEGER,
        lab_id INTEGER,
        delivery_date TEXT,
        status TEXT CHECK(status IN ('done', 'in progress', 'cancelled')),
        description TEXT,
        FOREIGN KEY (service_id) REFERENCES Services(service_id) ON DELETE CASCADE,
        FOREIGN KEY (lab_id) REFERENCES Labs(lab_id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) console.error("❌ Lab_work table:", err.message);
      else console.log("✓ Lab_work table ready");
    });

    // LAB_SERVICE TABLE
    db.run(`
      CREATE TABLE IF NOT EXISTS Lab_Service (
        lab_service_id INTEGER PRIMARY KEY AUTOINCREMENT,
        lab_id INTEGER NOT NULL,
        service_id INTEGER NOT NULL,
        FOREIGN KEY (lab_id) REFERENCES Labs(lab_id) ON DELETE CASCADE,
        FOREIGN KEY (service_id) REFERENCES Services(service_id) ON DELETE CASCADE,
        UNIQUE(lab_id, service_id)
      )
    `, (err) => {
      if (err) console.error("❌ Lab_Service table:", err.message);
      else console.log("✓ Lab_Service table ready");
      console.log("\n✅ Database initialization complete!\n");
    });
  });
};

module.exports = initializeTables;