const db = require("../config/db");

// GET all patients
exports.getPatients = (req, res) => {
  db.query("SELECT * FROM patients ORDER BY created_at DESC", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// GET patient by ID
exports.getPatientById = (req, res) => {
  const { id } = req.params;

  db.query(
    "SELECT * FROM patients WHERE patient_id = ?",
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) {
        return res.status(404).json({ error: "Patient not found" });
      }
      res.json(results[0]);
    }
  );
};

// POST create new patient
exports.addPatient = (req, res) => {
  const {
    first_name,
    last_name,
    date_of_birth,
    gender,
    phone_number,
    emergency_call,
    email,
    address,
    city,
    notes,
    allergies,
    chronic_conditions,
    hereditary_conditions,
    current_medications,
  } = req.body;

  db.query(
    `INSERT INTO patients (
      first_name, last_name, date_of_birth, gender, phone_number, 
      emergency_call, email, address, city, notes, allergies, 
      chronic_conditions, hereditary_conditions, current_medications
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      first_name,
      last_name,
      date_of_birth || null,
      gender || null,
      phone_number || null,
      emergency_call || null,
      email || null,
      address || null,
      city || null,
      notes || null,
      allergies || null,
      chronic_conditions || null,
      hereditary_conditions || null,
      current_medications || null,
    ],
    (err, result) => {
      if(err) {
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        patient_id: result.insertId,
        first_name,
        last_name,
        date_of_birth,
        gender,
        phone_number,
        emergency_call,
        email,
        address,
        city,
        notes,
        allergies,
        chronic_conditions,
        hereditary_conditions,
        current_medications,
      });
    }
  );
};

// PUT update patient
exports.updatePatient = (req, res) => {
  const { id } = req.params;
  const fields = req.body;

  const updates = [];
  const values = [];

  for(let key in fields) {
    updates.push(`${key} = ?`);
    values.push(fields[key]);
  }

  if(updates.length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }

  values.push(id);

  db.query(
    `UPDATE patients SET ${updates.join(", ")} WHERE patient_id = ?`,
    values,
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0)
        return res.status(404).json({ error: "Patient not found" });

      db.query(
        "SELECT * FROM patients WHERE patient_id = ?",
        [id],
        (err, results) => {
          if(err) return res.status(500).json({ error: err.message });
          res.json(results[0]);
        }
      );
    }
  );
};


// DELETE patient
exports.deletePatient = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM patients WHERE patient_id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Patient not found" });
    }
    res.json({ message: "Patient deleted successfully" });
  });
};