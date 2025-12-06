const db = require("../config/db");

// GET all patients
exports.getPatients = (req, res) => {
  db.all("SELECT * FROM Patient ORDER BY created_at DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

// GET patient by ID
exports.getPatientById = (req, res) => {
  const { id } = req.params;

  db.get("SELECT * FROM Patient WHERE patient_id = ?", [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Patient not found" });
    res.json(row);
  });
};

// POST create new patient
exports.addPatient = (req, res) => {
  const {
    firstName, lastName, dateOfBirth, gender, phoneNumber,
    emergencyCall, emailAddress, Address, city, notes,
    allergies, chronicConditions, hereditary, currentMedications
  } = req.body;

  const sql = `
    INSERT INTO Patient (
      first_name, last_name, date_of_birth, gender, phone_number,
      emergency_call, email, address, city, notes,
      allergies, chronic_conditions, hereditary_conditions, current_medications
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    firstName, lastName, dateOfBirth || null, gender || null,
    phoneNumber || null, emergencyCall || null, emailAddress || null,
    Address || null, city || null, notes || null,
    allergies || null, chronicConditions || null, hereditary || null,
    currentMedications || null
  ];

  db.run(sql, values, function(err) {
    if (err) return res.status(500).json({ error: err.message });

    res.status(201).json({
      status: true,
      patient_data: {
        patient_id: this.lastID,
        firstName, lastName, dateOfBirth, gender, phoneNumber,
        emergencyCall, emailAddress, Address, city, notes,
        allergies, chronicConditions, hereditary, currentMedications
      }
    });
  });
};

// PUT update patient
exports.updatePatient = (req, res) => {
  const { id } = req.params;
  const fields = req.body;

  const updates = [];
  const values = [];

  for (let key in fields) {
    updates.push(`${key} = ?`);
    values.push(fields[key]);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }

  values.push(id);

  db.run(`UPDATE Patient SET ${updates.join(", ")} WHERE patient_id = ?`, values, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Patient not found" });

    db.get("SELECT * FROM Patient WHERE patient_id = ?", [id], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(row);
    });
  });
};

// DELETE patient
exports.deletePatient = (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM Patient WHERE patient_id = ?", [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Patient not found" });
    res.json({ message: "Patient deleted successfully" });
  });
};