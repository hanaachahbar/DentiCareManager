// const db = require("../config/db");

// // GET all patients



const db = require("../config/db");

exports.getPatients = (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  const offset = (page - 1) * limit;

  // Build search query
  let searchQuery = '';
  let searchParams = [];
  
  if (search) {
    searchQuery = `
      WHERE first_name LIKE ? 
      OR last_name LIKE ? 
      OR email LIKE ? 
      OR phone_number LIKE ?
    `;
    const searchTerm = `%${search}%`;
    searchParams = [searchTerm, searchTerm, searchTerm, searchTerm];
  }

  // Get total count for pagination
  const countQuery = `SELECT COUNT(*) as total FROM Patient ${searchQuery}`;
  
  db.get(countQuery, searchParams, (err, countResult) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Get paginated patients
    const query = `
      SELECT 
        patient_id,
        first_name,
        last_name,
        date_of_birth as dob,
        phone_number as contact,
        allergies,
        chronic_conditions as chronique,
        hereditary_conditions as hereditaire,
        email,
        created_at,
        CASE 
          WHEN date_of_birth IS NOT NULL 
          THEN strftime('%d-%m-%Y', date_of_birth)
          ELSE 'N/A'
        END as formatted_dob,
        CASE 
          WHEN created_at IS NOT NULL 
          THEN strftime('%d-%m-%Y', created_at)
          ELSE 'N/A'
        END as lastVisit
      FROM Patient 
      ${searchQuery}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    db.all(query, [...searchParams, limit, offset], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const formattedRows = rows.map(patient => ({
        ...patient,
        allergies: patient.allergies ? JSON.parse(patient.allergies) : [],
        chronic_conditions: patient.chronic_conditions ? JSON.parse(patient.chronic_conditions) : [],
        hereditary_conditions: patient.hereditary_conditions ? JSON.parse(patient.hereditary_conditions) : []
      }));
      res.json(formattedRows);
    });
  });
};

// // GET all patients with pagination and search
// exports.getPatientsWithPaginationAndSearch = (req, res) => {
//   const { page = 1, limit = 10, search = '' } = req.query;
//   const offset = (page - 1) * limit;

//   // Build search query
//   let searchQuery = '';
//   let searchParams = [];
  
//   if (search) {
//     searchQuery = `
//       WHERE first_name LIKE ? 
//       OR last_name LIKE ? 
//       OR email LIKE ? 
//       OR phone_number LIKE ?
//     `;
//     const searchTerm = `%${search}%`;
//     searchParams = [searchTerm, searchTerm, searchTerm, searchTerm];
//   }

//   // Get total count for pagination
//   const countQuery = `SELECT COUNT(*) as total FROM Patient ${searchQuery}`;
  
//   db.get(countQuery, searchParams, (err, countResult) => {
//     if (err) {
//       return res.status(500).json({ error: err.message });
//     }

//     // Get paginated patients
//     const query = `
//       SELECT 
//         patient_id as id,
//         first_name,
//         last_name,
//         date_of_birth as dob,
//         phone_number as contact,
//         allergies,
//         chronic_conditions as chronique,
//         hereditary_conditions as hereditaire,
//         email,
//         created_at,
//         CASE 
//           WHEN date_of_birth IS NOT NULL 
//           THEN strftime('%d-%m-%Y', date_of_birth)
//           ELSE 'N/A'
//         END as formatted_dob,
//         CASE 
//           WHEN created_at IS NOT NULL 
//           THEN strftime('%d-%m-%Y', created_at)
//           ELSE 'N/A'
//         END as lastVisit
//       FROM Patient 
//       ${searchQuery}
//       ORDER BY created_at DESC
//       LIMIT ? OFFSET ?
//     `;

//     db.all(query, [...searchParams, limit, offset], (err, rows) => {
//       if (err) {
//         return res.status(500).json({ error: err.message });
//       }

//       // Parse JSON fields
//       const formattedPatients = rows.map(patient => ({
//         ...patient,
//         name: `${patient.first_name} ${patient.last_name}`,
//         allergies: patient.allergies ? JSON.parse(patient.allergies).join(', ') || 'None' : 'None',
//         chronique: patient.chronique ? JSON.parse(patient.chronique).join(', ') || 'None' : 'None',
//         hereditaire: patient.hereditaire ? JSON.parse(patient.hereditaire).join(', ') || 'None' : 'None',
//         // Generate avatar based on name
//         avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(patient.first_name + ' ' + patient.last_name)}&background=random`
//       }));

//       res.json({
//         patients: formattedPatients,
//         pagination: {
//           currentPage: parseInt(page),
//           totalPages: Math.ceil(countResult.total / limit),
//           totalPatients: countResult.total,
//           patientsPerPage: parseInt(limit)
//         }
//       });
//     });
//   });
// };

// // GET all patients with pagination and search
// exports.getPatientsWithPaginationAndSearch = (req, res) => {
//   const { page = 1, limit = 10, search = '' } = req.query;
//   const offset = (page - 1) * limit;

//   // Build search query
//   let searchQuery = '';
//   let searchParams = [];
  
//   if (search) {
//     searchQuery = `
//       WHERE first_name LIKE ? 
//       OR last_name LIKE ? 
//       OR email LIKE ? 
//       OR phone_number LIKE ?
//     `;
//     const searchTerm = `%${search}%`;
//     searchParams = [searchTerm, searchTerm, searchTerm, searchTerm];
//   }

//   // Get total count for pagination
//   const countQuery = `SELECT COUNT(*) as total FROM Patient ${searchQuery}`;
  
//   db.get(countQuery, searchParams, (err, countResult) => {
//     if (err) {
//       return res.status(500).json({ error: err.message });
//     }

//     // Get paginated patients
//     const query = `
//       SELECT 
//         patient_id as id,
//         first_name,
//         last_name,
//         date_of_birth as dob,
//         phone_number as contact,
//         allergies,
//         chronic_conditions as chronique,
//         hereditary_conditions as hereditaire,
//         email,
//         created_at,
//         CASE 
//           WHEN date_of_birth IS NOT NULL 
//           THEN strftime('%d-%m-%Y', date_of_birth)
//           ELSE 'N/A'
//         END as formatted_dob,
//         CASE 
//           WHEN created_at IS NOT NULL 
//           THEN strftime('%d-%m-%Y', created_at)
//           ELSE 'N/A'
//         END as lastVisit
//       FROM Patient 
//       ${searchQuery}
//       ORDER BY created_at DESC
//       LIMIT ? OFFSET ?
//     `;

//     db.all(query, [...searchParams, limit, offset], (err, rows) => {
//       if (err) {
//         return res.status(500).json({ error: err.message });
//       }

//       // Parse JSON fields
//       const formattedPatients = rows.map(patient => ({
//         ...patient,
//         name: `${patient.first_name} ${patient.last_name}`,
//         allergies: patient.allergies ? JSON.parse(patient.allergies).join(', ') || 'None' : 'None',
//         chronique: patient.chronique ? JSON.parse(patient.chronique).join(', ') || 'None' : 'None',
//         hereditaire: patient.hereditaire ? JSON.parse(patient.hereditaire).join(', ') || 'None' : 'None',
//         // Generate avatar based on name
//         avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(patient.first_name + ' ' + patient.last_name)}&background=random`
//       }));

//       res.json({
//         patients: formattedPatients,
//         pagination: {
//           currentPage: parseInt(page),
//           totalPages: Math.ceil(countResult.total / limit),
//           totalPatients: countResult.total,
//           patientsPerPage: parseInt(limit)
//         }
//       });
//     });
//   });
// };


// GET patient by ID
exports.getPatientById = (req, res) => {
  const { id } = req.params;

  db.get("SELECT * FROM Patient WHERE patient_id = ?", [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Patient not found" });

    const parsedPatient = {
      ...row,
      allergies: row.allergies ? JSON.parse(row.allergies) : [],
      chronic_conditions: row.chronic_conditions ? JSON.parse(row.chronic_conditions) : [],
      hereditary_conditions: row.hereditary_conditions ? JSON.parse(row.hereditary_conditions) : []
    };
    res.json(parsedPatient);
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
    JSON.stringify(allergies || []), JSON.stringify(chronicConditions || []),
    JSON.stringify(hereditary || []), currentMedications || null
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
    let value = fields[key];
    // Convert arrays to JSON strings
    if (key === "allergies" || key === "chronic_conditions" || key === "hereditary_conditions") {
      value = JSON.stringify(value || []);
    }

    updates.push(`${key} = ?`);
    values.push(value);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }

  values.push(id);

  db.run(
    `UPDATE Patient SET ${updates.join(", ")} WHERE patient_id = ?`,
    values,
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: "Patient not found" });

      db.get("SELECT * FROM Patient WHERE patient_id = ?", [id], (err, row) => {
        if(err) return res.status(500).json({ error: err.message });
        const parsedPatient = {
          ...row,
          allergies: row.allergies ? JSON.parse(row.allergies) : [],
          chronic_conditions: row.chronic_conditions ? JSON.parse(row.chronic_conditions) : [],
          hereditary_conditions: row.hereditary_conditions ? JSON.parse(row.hereditary_conditions) : []
        };

        res.json(parsedPatient);
      });
    }
  );
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