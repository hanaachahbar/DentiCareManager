// controllers/paymentController.js
const db = require("../config/db");

// Create a payment for a service
exports.createPayment = (req, res) => {
  const { service_id, total_amount, description } = req.body;

  if (!service_id || !total_amount) {
    return res.status(400).json({ error: "service_id and total_amount are required" });
  }

  if (total_amount <= 0) {
    return res.status(400).json({ error: "total_amount must be greater than 0" });
  }

  // Check if service exists
  db.get("SELECT * FROM Services WHERE service_id = ?", [service_id], (err, service) => {
    if (err) {
      return res.status(500).json({ error: `Database error: ${err.message}` });
    }
    if (!service) {
      return res.status(404).json({ error: `Service with ID ${service_id} not found. Please check if the service exists.` });
    }

    // Check if payment already exists for this service
    db.get("SELECT * FROM Payment WHERE service_id = ?", [service_id], (err, existingPayment) => {
      if (err) {
        return res.status(500).json({ error: `Database error: ${err.message}` });
      }
      if (existingPayment) {
        return res.status(400).json({ error: `Payment already exists for service_id ${service_id}. Each service can only have one payment record. Update the existing payment instead.` });
      }

      // Create payment
      const query = `
        INSERT INTO Payment (service_id, total_amount, paid_amount, status, description)
        VALUES (?, ?, 0, 'unpaid', ?)
      `;

      db.run(query, [service_id, total_amount, description], function (err) {
        if (err) {
          return res.status(500).json({ error: `Failed to create payment: ${err.message}` });
        }

        res.status(201).json({
          message: "Payment created successfully",
          payment: {
            payment_id: this.lastID,
            service_id,
            total_amount,
            paid_amount: 0,
            remaining_amount: total_amount,
            status: "unpaid",
            description
          }
        });
      });
    });
  });
};

// Get all payments
exports.getAllPayments = (req, res) => {
  const query = `
    SELECT 
      p.*,
      (p.total_amount - p.paid_amount) as remaining_amount,
      s.service_name,
      s.patient_id
    FROM Payment p
    LEFT JOIN Services s ON p.service_id = s.service_id
    ORDER BY p.created_at DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ payments: rows });
  });
};

// Get payment by ID with detailed information
exports.getPaymentById = (req, res) => {
  const { id } = req.params;

  const paymentQuery = `
    SELECT 
      p.*,
      (p.total_amount - p.paid_amount) as remaining_amount,
      s.service_name,
      s.patient_id,
      s.status as service_status
    FROM Payment p
    LEFT JOIN Services s ON p.service_id = s.service_id
    WHERE p.payment_id = ?
  `;

  db.get(paymentQuery, [id], (err, payment) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    // Get all invoices for this payment
    const invoicesQuery = `
      SELECT 
        i.*,
        a.appointment_date,
        a.status as appointment_status,
        a.description as appointment_description
      FROM Invoices i
      LEFT JOIN Appointment a ON i.appointment_id = a.appointment_id
      WHERE i.payment_id = ?
      ORDER BY i.created_at ASC
    `;

    db.all(invoicesQuery, [id], (err, invoices) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.amount, 0);

      res.json({
        payment,
        invoices,
        summary: {
          total_amount: payment.total_amount,
          paid_amount: payment.paid_amount,
          remaining_amount: payment.remaining_amount,
          total_invoiced: totalInvoiced,
          invoice_count: invoices.length
        }
      });
    });
  });
};

// Get payment by service ID
exports.getPaymentByServiceId = (req, res) => {
  const { service_id } = req.params;

  const paymentQuery = `
    SELECT 
      p.*,
      (p.total_amount - p.paid_amount) as remaining_amount,
      s.service_name,
      s.patient_id
    FROM Payment p
    LEFT JOIN Services s ON p.service_id = s.service_id
    WHERE p.service_id = ?
  `;

  db.get(paymentQuery, [service_id], (err, payment) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!payment) {
      return res.status(404).json({ error: "Payment not found for this service" });
    }

    // Get all invoices for this payment
    const invoicesQuery = `
      SELECT 
        i.*,
        a.appointment_date,
        a.status as appointment_status
      FROM Invoices i
      LEFT JOIN Appointment a ON i.appointment_id = a.appointment_id
      WHERE i.payment_id = ?
      ORDER BY i.created_at ASC
    `;

    db.all(invoicesQuery, [payment.payment_id], (err, invoices) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.amount, 0);

      res.json({
        payment,
        invoices,
        summary: {
          total_amount: payment.total_amount,
          paid_amount: payment.paid_amount,
          remaining_amount: payment.remaining_amount,
          total_invoiced: totalInvoiced,
          invoice_count: invoices.length
        }
      });
    });
  });
};

// Update payment details (total_amount, description ONLY - paid_amount is auto-calculated)
exports.updatePayment = (req, res) => {
  const { id } = req.params;
  const { total_amount, description } = req.body;

  db.get("SELECT * FROM Payment WHERE payment_id = ?", [id], (err, payment) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    const updates = [];
    const values = [];

    if (total_amount !== undefined) {
      if (total_amount <= 0) {
        return res.status(400).json({ error: "total_amount must be greater than 0" });
      }
      if (total_amount < payment.paid_amount) {
        return res.status(400).json({ 
          error: "total_amount cannot be less than already paid amount",
          paid_amount: payment.paid_amount
        });
      }
      updates.push("total_amount = ?");
      values.push(total_amount);
    }

    if (description !== undefined) {
      updates.push("description = ?");
      values.push(description);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    values.push(id);
    const query = `UPDATE Payment SET ${updates.join(", ")} WHERE payment_id = ?`;

    db.run(query, values, function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Get updated payment with new status
      db.get("SELECT * FROM Payment WHERE payment_id = ?", [id], (err, updatedPayment) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        // Recalculate status if total_amount changed
        let newStatus = updatedPayment.status;
        if (total_amount !== undefined) {
          if (updatedPayment.paid_amount >= total_amount) {
            newStatus = "completed";
          } else if (updatedPayment.paid_amount > 0) {
            newStatus = "partially_paid";
          } else {
            newStatus = "unpaid";
          }

          if (newStatus !== updatedPayment.status) {
            db.run("UPDATE Payment SET status = ? WHERE payment_id = ?", [newStatus, id]);
          }
        }

        res.json({
          message: "Payment updated successfully",
          payment: {
            ...updatedPayment,
            status: newStatus,
            remaining_amount: total_amount ? total_amount - updatedPayment.paid_amount : updatedPayment.total_amount - updatedPayment.paid_amount
          }
        });
      });
    });
  });
};

// Delete payment
exports.deletePayment = (req, res) => {
  const { id } = req.params;

  // Check if payment exists
  db.get("SELECT * FROM Payment WHERE payment_id = ?", [id], (err, payment) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    // Check if there are any invoices
    db.get("SELECT COUNT(*) as count FROM Invoices WHERE payment_id = ?", [id], (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (result.count > 0) {
        return res.status(400).json({ 
          error: "Cannot delete payment with existing invoices. Delete invoices first.",
          invoice_count: result.count
        });
      }

      // Delete payment
      db.run("DELETE FROM Payment WHERE payment_id = ?", [id], function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        res.json({ 
          message: "Payment deleted successfully",
          payment_id: id
        });
      });
    });
  });
};