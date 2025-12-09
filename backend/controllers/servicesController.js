const db = require("../config/db");

// Create a service (and automatically create payment)
exports.createService = (req, res) => {
  const { patient_id, service_name, total_cost, status, payment_description } = req.body;

  if (!patient_id || !service_name || !total_cost) {
    return res.status(400).json({ 
      error: "patient_id, service_name, and total_cost are required" 
    });
  }

  // Check if patient exists first
  db.get("SELECT * FROM Patient WHERE patient_id = ?", [patient_id], (err, patient) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    // Create service
    const serviceSQL = `
      INSERT INTO Services (patient_id, service_name, status)
      VALUES (?, ?, ?)
    `;

    const serviceStatus = status || 'active';
    db.run(serviceSQL, [patient_id, service_name, serviceStatus], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const service_id = this.lastID;

      // Create associated payment - FIXED: Added paid_amount column
      const paymentSQL = `
        INSERT INTO Payment (service_id, total_amount, paid_amount, description, status)
        VALUES (?, ?, ?, ?, 'unpaid')
      `;

      db.run(paymentSQL, [service_id, total_cost, 0, payment_description || ''], function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        res.status(201).json({
          status: true,
          service_data: {
            service_id,
            patient_id,
            service_name,
            total_cost,
            payment_status: 'unpaid'
          }
        });
      });
    });
  });
};

// Get all services
exports.getAllServices = (req, res) => {
  const query = `
    SELECT 
      s.*,
      p.payment_id,
      p.total_amount,
      p.paid_amount,
      (p.total_amount - p.paid_amount) as remaining_amount,
      p.status as payment_status,
      pat.first_name,
      pat.last_name
    FROM Services s
    LEFT JOIN Payment p ON s.service_id = p.service_id
    LEFT JOIN Patient pat ON s.patient_id = pat.patient_id
    ORDER BY s.created_at DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ services: rows });
  });
};

// Get service by ID with full details
exports.getServiceById = (req, res) => {
  const { id } = req.params;

  const serviceQuery = `
    SELECT 
      s.*,
      p.payment_id,
      p.total_amount,
      p.paid_amount,
      (p.total_amount - p.paid_amount) as remaining_amount,
      p.status as payment_status,
      p.description as payment_description,
      pat.first_name,
      pat.last_name,
      pat.phone_number,
      pat.email
    FROM Services s
    LEFT JOIN Payment p ON s.service_id = p.service_id
    LEFT JOIN Patient pat ON s.patient_id = pat.patient_id
    WHERE s.service_id = ?
  `;

  db.get(serviceQuery, [id], (err, service) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    // Get appointments for this service
    const appointmentsQuery = `
      SELECT * FROM Appointment 
      WHERE service_id = ? 
      ORDER BY appointment_date ASC
    `;

    db.all(appointmentsQuery, [id], (err, appointments) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Get invoices for this service's payment
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

      db.all(invoicesQuery, [service.payment_id], (err, invoices) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.amount, 0);

        res.json({
          service,
          appointments,
          invoices,
          summary: {
            appointment_count: appointments.length,
            invoice_count: invoices.length,
            total_invoiced: totalInvoiced,
            total_amount: service.total_amount,
            paid_amount: service.paid_amount,
            remaining_amount: service.remaining_amount
          }
        });
      });
    });
  });
};

// Get services by patient ID
exports.getServicesByPatientId = (req, res) => {
  const { patient_id } = req.params;

  // Check if patient exists
  db.get("SELECT * FROM Patient WHERE patient_id = ?", [patient_id], (err, patient) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    const query = `
      SELECT 
        s.*,
        p.payment_id,
        p.total_amount,
        p.paid_amount,
        (p.total_amount - p.paid_amount) as remaining_amount,
        p.status as payment_status
      FROM Services s
      LEFT JOIN Payment p ON s.service_id = p.service_id
      WHERE s.patient_id = ?
      ORDER BY s.created_at DESC
    `;

    db.all(query, [patient_id], (err, services) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({ 
        patient: {
          patient_id: patient.patient_id,
          first_name: patient.first_name,
          last_name: patient.last_name
        },
        services 
      });
    });
  });
};



exports.getServicesByPatIdNoPayment = (req, res) => {
  const { patient_id } = req.params;

  // Check if patient exists
  db.get("SELECT * FROM Patient WHERE patient_id = ?", [patient_id], (err, patient) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    const query = `SELECT * FROM Services WHERE patient_id = ?`;

    db.all(query, [patient_id], (err, services) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({ 
        patient: {
          patient_id: patient.patient_id,
          first_name: patient.first_name,
          last_name: patient.last_name
        },
        services 
      });
    });
  });
};


// Update service
exports.updateService = (req, res) => {
  const { id } = req.params;
  const { service_name, status } = req.body;

  db.get("SELECT * FROM Services WHERE service_id = ?", [id], (err, service) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    const updates = [];
    const values = [];

    if (service_name !== undefined) {
      updates.push("service_name = ?");
      values.push(service_name);
    }

    if (status !== undefined) {
      if (!['active', 'not_active'].includes(status)) {
        return res.status(400).json({ error: "Invalid status. Must be 'active' or 'not_active'" });
      }
      updates.push("status = ?");
      values.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    values.push(id);
    const query = `UPDATE Services SET ${updates.join(", ")} WHERE service_id = ?`;

    db.run(query, values, function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      db.get("SELECT * FROM Services WHERE service_id = ?", [id], (err, updatedService) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        res.json({
          message: "Service updated successfully",
          service: updatedService
        });
      });
    });
  });
};

// Delete service (will cascade delete payment, appointments, invoices)
exports.deleteService = (req, res) => {
  const { id } = req.params;

  db.get("SELECT * FROM Services WHERE service_id = ?", [id], (err, service) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    db.run("DELETE FROM Services WHERE service_id = ?", [id], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({
        message: "Service deleted successfully (including related payment, appointments, and invoices)",
        service_id: id
      });
    });
  });
};
