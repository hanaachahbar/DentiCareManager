// routes/serviceDetails.js
const express = require("express");
const router = express.Router();
const serviceDetailsController = require("../controllers/serviceDetailsController");

// Get comprehensive service details
router.get("/:service_id/details", serviceDetailsController.getServiceDetails);

module.exports = router;