const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentsController");



// IMPORTANT: POST routes should come before GET routes with parameters
// POST: Bulk reschedule - MUST BE FIRST to avoid conflict with /:id
router.post("/bulk-reschedule", appointmentController.bulkReschedule);

// POST: Create a new appointment
router.post("/", appointmentController.createAppointment);

// GET: All appointments - MUST BE BEFORE /:id
router.get("/", appointmentController.getAllAppointments);

// SPECIFIC ROUTES (before /:id to avoid conflicts)
// Get upcoming appointments
router.get("/upcoming", appointmentController.getUpcomingAppointments);

// Get appointments by status
router.get("/status/:status", appointmentController.getAppointmentsByStatus);

// Get appointments by service ID
router.get("/service/:service_id", appointmentController.getAppointmentsByServiceId);

// Get appointments by patient ID
router.get("/patient/:patient_id", appointmentController.getAppointmentsByPatientId);

// Get appointments by specific date
router.get("/date/:date", appointmentController.getAppointmentsByDate);

// PARAMETERIZED ROUTES LAST
// Get appointment by ID - MUST BE AFTER all specific routes
router.get("/:id", appointmentController.getAppointmentById);

// Update appointment
router.put("/:id", appointmentController.updateAppointment);

// Delete appointment
router.delete("/:id", appointmentController.deleteAppointment);

module.exports = router;