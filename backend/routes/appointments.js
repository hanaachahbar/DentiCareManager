const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentsController");

// Create a new appointment
router.post("/", appointmentController.createAppointment);

// Get all appointments - MUST BE BEFORE /:id
router.get("/", appointmentController.getAllAppointments);

// SPECIFIC ROUTES FIRST (before /:id)
// Get upcoming appointments
router.get("/upcoming", appointmentController.getUpcomingAppointments);

// Get appointments by status
router.get("/status/:status", appointmentController.getAppointmentsByStatus);

// Get appointments by service ID
router.get("/service/:service_id", appointmentController.getAppointmentsByServiceId);

// Get appointments by patient ID
router.get("/patient/:patient_id", appointmentController.getAppointmentsByPatientId);

// PARAMETERIZED ROUTES LAST
// Get appointment by ID - MUST BE AFTER specific routes
router.get("/:id", appointmentController.getAppointmentById);

// Update appointment
router.put("/:id", appointmentController.updateAppointment);

// Delete appointment
router.delete("/:id", appointmentController.deleteAppointment);

module.exports = router;