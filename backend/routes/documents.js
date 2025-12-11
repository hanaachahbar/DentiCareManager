// routes/documents.js
const express = require("express");
const router = express.Router();
const documentsController = require("../controllers/documentsController");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Upload documents
router.post("/upload", upload.array("documents", 10), documentsController.uploadDocuments);

// Get documents for an appointment
router.get("/appointment/:appointment_id", documentsController.getDocumentsByAppointment);

// Get documents for a patient
router.get("/patient/:patient_id", documentsController.getDocumentsByPatient);

// Download document
router.get("/download/:document_id", documentsController.downloadDocument);

// Delete document
router.delete("/:document_id", documentsController.deleteDocument);

module.exports = router;