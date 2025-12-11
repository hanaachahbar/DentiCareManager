const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const documentsController = require('../controllers/documentsController');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedMimes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Upload document for an appointment
router.post('/', upload.single('file'), documentsController.uploadDocument);

// Get all documents for a patient
router.get('/patient/:patient_id', documentsController.getDocumentsByPatient);

// Get documents for a specific appointment
router.get('/appointment/:appointment_id', documentsController.getDocumentsByAppointment);

// Download a document
router.get('/download/:document_id', documentsController.downloadDocument);

// Delete a document
router.delete('/:document_id', documentsController.deleteDocument);

module.exports = router;
