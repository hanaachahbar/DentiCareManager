// routes/services.js
const express = require("express");
const router = express.Router();
const servicesController = require("../controllers/servicesController");

// Create a new service (automatically creates payment)
router.post("/", servicesController.createService);

// Get all services
router.get("/", servicesController.getAllServices);

// Get total completed services
router.get("/completeServices", servicesController.getTotalCompletedServices);

// Get service by ID
router.get("/:id", servicesController.getServiceById);

// Get services by patient ID
router.get("/patient/:patient_id", servicesController.getServicesByPatientId);

// Get services by patient ID but without payments
router.get("/servicePatient/:patient_id", servicesController.getServicesByPatIdNoPayment);

// Update service
router.put("/:id", servicesController.updateService);

// Delete service
router.delete("/:id", servicesController.deleteService);

module.exports = router;