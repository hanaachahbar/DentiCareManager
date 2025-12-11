// controllers/documentsController.js
const db = require("../config/db");
const path = require("path");
const fs = require("fs");

// Upload documents
exports.uploadDocuments = (req, res) => {
  console.log("📤 uploadDocuments called!");
  console.log("Files:", req.files);
  console.log("Body:", req.body);
  
  const { appointment_id } = req.body;
  
  if (!appointment_id) {
    return res.status(400).json({ error: "appointment_id is required" });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }

  // Check if appointment exists
  db.get("SELECT * FROM Appointment WHERE appointment_id = ?", [appointment_id], (err, appointment) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    const uploadedDocuments = [];

    // Process each file
    req.files.forEach((file, index) => {
      const query = "INSERT INTO Documents (appointment_id, path) VALUES (?, ?)";
      
      db.run(query, [appointment_id, file.filename], function(err) {
        if (err) {
          console.error("Error saving to database:", err);
        } else {
          uploadedDocuments.push({
            document_id: this.lastID,
            filename: file.filename,
            original_name: file.originalname,
            path: `/uploads/${file.filename}`
          });
        }

        // When all files are processed, send response
        if (index === req.files.length - 1) {
          res.status(201).json({
            message: "Files uploaded successfully",
            count: uploadedDocuments.length,
            documents: uploadedDocuments
          });
        }
      });
    });
  });
};

// Get documents for an appointment
exports.getDocumentsByAppointment = (req, res) => {
  const { appointment_id } = req.params;

  db.all(
    "SELECT * FROM Documents WHERE appointment_id = ? ORDER BY saved_at DESC",
    [appointment_id],
    (err, documents) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      // Add full URL to documents
      const documentsWithUrl = documents.map(doc => ({
        ...doc,
        url: `${req.protocol}://${req.get('host')}/uploads/${doc.path}`
      }));

      res.json({ documents: documentsWithUrl });
    }
  );
};

// Get all documents for a patient
exports.getDocumentsByPatient = (req, res) => {
  const { patient_id } = req.params;

  const query = `
    SELECT 
      d.*,
      a.appointment_id,
      a.appointment_date,
      s.service_name,
      p.first_name,
      p.last_name
    FROM Documents d
    JOIN Appointment a ON d.appointment_id = a.appointment_id
    JOIN Services s ON a.service_id = s.service_id
    JOIN Patient p ON s.patient_id = p.patient_id
    WHERE p.patient_id = ?
    ORDER BY d.saved_at DESC
  `;

  db.all(query, [patient_id], (err, documents) => {
    if (err) {
      console.error("Database error fetching documents for patient:", err);
      // Return empty documents array if there's an error (no documents or table issue)
      return res.json({ 
        count: 0,
        documents: [] 
      });
    }

    // Handle case where documents is null or undefined
    const documentsList = documents || [];

    // Add full URL to documents
    const documentsWithUrl = documentsList.map(doc => ({
      ...doc,
      url: `${req.protocol}://${req.get('host')}/uploads/${doc.path}`
    }));

    res.json({ 
      count: documentsWithUrl.length,
      documents: documentsWithUrl 
    });
  });
};

// Download document
exports.downloadDocument = (req, res) => {
  const { document_id } = req.params;

  db.get("SELECT * FROM Documents WHERE document_id = ?", [document_id], (err, document) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    const filePath = path.join(__dirname, '../../uploads', document.path);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found on server" });
    }

    // Send file
    res.download(filePath, document.path);
  });
};

// Delete document
exports.deleteDocument = (req, res) => {
  const { document_id } = req.params;

  db.get("SELECT * FROM Documents WHERE document_id = ?", [document_id], (err, document) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    const filePath = path.join(__dirname, '../../uploads', document.path);

    // Delete from database first
    db.run("DELETE FROM Documents WHERE document_id = ?", [document_id], function(err) {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      // Then delete the actual file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      res.json({ 
        message: "Document deleted successfully",
        document_id: document_id 
      });
    });
  });
};