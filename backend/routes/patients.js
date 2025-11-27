const express = require("express");
const router = express.Router();
const {
  getPatients,
  getPatientById,
  addPatient,
  updatePatient,
  deletePatient,
} = require("../controllers/patientsController");

// GET all patients
router.get("/addPatient", getPatients);

// GET patient by ID
router.get("/addPatient/:id", getPatientById);

// POST create new patient
router.post("/addPatient", addPatient);

// PUT update patient
router.put("/addPatient/:id", updatePatient);

// DELETE patient
router.delete("/addPatient/:id", deletePatient);

module.exports = router;