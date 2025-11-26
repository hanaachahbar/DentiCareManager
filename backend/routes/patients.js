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
router.get("/", getPatients);

// GET patient by ID
router.get("/:id", getPatientById);

// POST create new patient
router.post("/", addPatient);

// PUT update patient
router.put("/:id", updatePatient);

// DELETE patient
router.delete("/:id", deletePatient);

module.exports = router;

