// routes/invoices.js
const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoicesController");

// Create a new invoice
router.post("/", invoiceController.createInvoice);

// Get all invoices
router.get("/", invoiceController.getAllInvoices);

// Get total daily amount from invoices
router.get("/total-amount", invoiceController.getdailyAmount);

// Get invoice by ID
router.get("/:id", invoiceController.getInvoiceById);

// Get all invoices for a payment
router.get("/payment/:payment_id", invoiceController.getInvoicesByPaymentId);

// Update invoice
router.put("/:id", invoiceController.updateInvoice);

// Delete invoice
router.delete("/:id", invoiceController.deleteInvoice);

module.exports = router;

