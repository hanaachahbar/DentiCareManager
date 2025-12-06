// routes/payments.js
const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentsController");

// Create a new payment
router.post("/", paymentController.createPayment);

// Get all payments
router.get("/", paymentController.getAllPayments);

// Get payment by ID
router.get("/:id", paymentController.getPaymentById);

// Get payment by service ID
router.get("/service/:service_id", paymentController.getPaymentByServiceId);

// Update payment details
router.put("/:id", paymentController.updatePayment);

// Delete payment
router.delete("/:id", paymentController.deletePayment);

module.exports = router;