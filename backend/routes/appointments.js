const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentsController");

// Create a new appointment
router.post("/", appointmentController.createAppointment);

// Get all appointments
router.get("/", appointmentController.getAllAppointments);

// Get upcoming appointments
router.get("/upcoming", appointmentController.getUpcomingAppointments);

// Get appointments by status
router.get("/status/:status", appointmentController.getAppointmentsByStatus);

// Get appointment by ID
router.get("/:id", appointmentController.getAppointmentById);

// Get appointments by service ID
router.get("/service/:service_id", appointmentController.getAppointmentsByServiceId);

// Get appointments by patient ID
router.get("/patient/:patient_id", appointmentController.getAppointmentsByPatientId);

// Update appointment
router.put("/:id", appointmentController.updateAppointment);

// Delete appointment
router.delete("/:id", appointmentController.deleteAppointment);

module.exports = router;