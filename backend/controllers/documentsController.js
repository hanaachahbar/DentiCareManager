const db = require("../config/db");
const path = require("path");
const fs = require("fs");

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Upload document for an appointment
exports.uploadDocument = (req, res) => {
  const { appointment_id } = req.body;

  if (!appointment_id || !req.file) {
    return res.status(400).json({ error: "appointment_id and file are required" });
  }

  // Store file path relative to backend
  const filePath = path.join("uploads", req.file.filename);

  const query = `
    INSERT INTO Documents (appointment_id, path, saved_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
  `;

  db.run(query, [appointment_id, filePath], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.status(201).json({
      message: "Document uploaded successfully",
      document: {
        document_id: this.lastID,
        appointment_id,
        path: filePath,
        filename: req.file.originalname,
        saved_at: new Date().toISOString(),
      },
    });
  });
};

// Get all documents for a patient (through their appointments and services)
exports.getDocumentsByPatient = (req, res) => {
  const { patient_id } = req.params;

  const query = `
    SELECT 
      d.*,
      a.appointment_id,
      a.appointment_date,
      a.appointment_time,
      a.status as appointment_status,
      s.service_id,
      s.service_name,
      p.patient_id,
      p.first_name,
      p.last_name
    FROM Documents d
    JOIN Appointment a ON d.appointment_id = a.appointment_id
    JOIN Services s ON a.service_id = s.service_id
    JOIN Patient p ON s.patient_id = p.patient_id
    WHERE p.patient_id = ?
    ORDER BY d.saved_at DESC
  `;

  db.all(query, [patient_id], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ documents: rows || [] });
  });
};

// Get documents for a specific appointment
exports.getDocumentsByAppointment = (req, res) => {
  const { appointment_id } = req.params;

  const query = `
    SELECT * FROM Documents
    WHERE appointment_id = ?
    ORDER BY saved_at DESC
  `;

  db.all(query, [appointment_id], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ documents: rows || [] });
  });
};

// Delete a document
exports.deleteDocument = (req, res) => {
  const { document_id } = req.params;

  db.get("SELECT * FROM Documents WHERE document_id = ?", [document_id], (err, doc) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, "..", doc.path);
    fs.unlink(filePath, (fsErr) => {
      if (fsErr) console.error("Error deleting file:", fsErr);
    });

    // Delete from database
    db.run("DELETE FROM Documents WHERE document_id = ?", [document_id], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "Document deleted successfully" });
    });
  });
};

// Download document
exports.downloadDocument = (req, res) => {
  const { document_id } = req.params;

  db.get("SELECT * FROM Documents WHERE document_id = ?", [document_id], (err, doc) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }

    const filePath = path.join(__dirname, "..", doc.path);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    res.download(filePath);
  });
};
