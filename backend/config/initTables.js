const db = require("./db");

module.exports = (db) => {
  // Enable foreign keys
  db.run("PRAGMA foreign_keys = ON;", (err) => {
    if (err) console.error("Failed to enable foreign keys:", err.message);
    else console.log("Foreign key enforcement enabled");
  });

  // PATIENT
  const createPatientTable = `
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
    );
  `;

  // SERVICES
  const createServicesTable = `
    CREATE TABLE IF NOT EXISTS Services (
      service_id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER,
      service_name TEXT NOT NULL,
      status TEXT CHECK(status IN ('active', 'not_active')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES Patient(patient_id) ON DELETE CASCADE
    );
  `;

  // APPOINTMENT
  const createAppointmentTable = `
    CREATE TABLE IF NOT EXISTS Appointment (
      appointment_id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_id INTEGER,
      appointment_date TEXT NOT NULL,
      status TEXT CHECK(status IN ('cancelled', 'pending', 'checked-in')),
      description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (service_id) REFERENCES Services(service_id) ON DELETE CASCADE
    );
  `;

  // DOCUMENTS
  const createDocumentsTable = `
    CREATE TABLE IF NOT EXISTS Documents (
      document_id INTEGER PRIMARY KEY AUTOINCREMENT,
      appointment_id INTEGER,
      path TEXT NOT NULL,
      saved_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (appointment_id) REFERENCES Appointment(appointment_id) ON DELETE CASCADE
    );
  `;

  // MEDICATION
  const createMedicationTable = `
    CREATE TABLE IF NOT EXISTS Medication (
      medication_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      common_uses TEXT
    );
  `;

  // PRESCRIPTION
  const createPrescriptionTable = `
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
    );
  `;

  // PAYMENT - CORRECTED VERSION
  const createPaymentTable = `
    CREATE TABLE IF NOT EXISTS Payment (
      payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_id INTEGER UNIQUE,
      total_amount REAL NOT NULL,
      paid_amount REAL DEFAULT 0,
      status TEXT DEFAULT 'unpaid' CHECK(status IN ('unpaid', 'partially_paid', 'completed')),
      description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (service_id) REFERENCES Services(service_id) ON DELETE CASCADE
    );
  `;


  // INVOICES - CORRECTED VERSION
  const createInvoicesTable = `
    CREATE TABLE IF NOT EXISTS Invoices (
      invoice_id INTEGER PRIMARY KEY AUTOINCREMENT,
      payment_id INTEGER,
      appointment_id INTEGER UNIQUE,
      amount REAL NOT NULL,
      description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (payment_id) REFERENCES Payment(payment_id) ON DELETE CASCADE,
      FOREIGN KEY (appointment_id) REFERENCES Appointment(appointment_id) ON DELETE CASCADE
    );
  `;

  // LABS
  const createLabsTable = `
    CREATE TABLE IF NOT EXISTS Labs (
      lab_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      contact_person TEXT,
      phone_number TEXT,
      email TEXT UNIQUE,
      address TEXT
    );
  `;

  // LAB WORK
  const createLabWorkTable = `
    CREATE TABLE IF NOT EXISTS Lab_work (
      lab_work_id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_id INTEGER,
      lab_id INTEGER,
      delivery_date TEXT,
      status TEXT CHECK(status IN ('done', 'in progress', 'cancelled')),
      description TEXT,
      FOREIGN KEY (service_id) REFERENCES Services(service_id) ON DELETE CASCADE,
      FOREIGN KEY (lab_id) REFERENCES Labs(lab_id) ON DELETE CASCADE
    );
  `;


  // Helper table for services inside lab
  const createLabServiceTable = `
    CREATE TABLE IF NOT EXISTS Lab_Service (
      lab_service_id INTEGER PRIMARY KEY AUTOINCREMENT,
      lab_id INTEGER NOT NULL,
      service_id INTEGER NOT NULL,
      FOREIGN KEY (lab_id) REFERENCES Labs(lab_id) ON DELETE CASCADE,
      FOREIGN KEY (service_id) REFERENCES Services(service_id) ON DELETE CASCADE,
      UNIQUE(lab_id, service_id)
    );
  `;

  // Creating tables by respecting their order (important because of Foreign Key dependencies)
  const tables = [
    createPatientTable,
    createServicesTable,
    createAppointmentTable,
    createDocumentsTable,
    createMedicationTable,
    createPrescriptionTable,
    createPaymentTable,
    createInvoicesTable,
    createLabsTable,
    createLabWorkTable,
    createLabServiceTable
  ];

  tables.forEach((query) => {
    db.run(query, (err) => {
      if (err) console.error("Error creating table:", err.message);
    });
  });

  console.log("✓ All tables initialized");
};