const db = require("../config/db");

// Create an appointment
exports.createAppointment = (req, res) => {
  const { service_id, appointment_date, status, description } = req.body;

  if (!service_id || !appointment_date) {
    return res.status(400).json({ 
      error: "service_id and appointment_date are required" 
    });
  }

  // Validate status if provided
  const validStatuses = ['cancelled', 'pending', 'checked-in'];
  const appointmentStatus = status || 'pending';
  
  if (!validStatuses.includes(appointmentStatus)) {
    return res.status(400).json({ 
      error: "Invalid status. Must be 'cancelled', 'pending', or 'checked-in'" 
    });
  }

  // Check if service exists
  db.get("SELECT * FROM Services WHERE service_id = ?", [service_id], (err, service) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    // Create appointment
    const sql = `
      INSERT INTO Appointment (service_id, appointment_date, status, description)
      VALUES (?, ?, ?, ?)
    `;

    db.run(sql, [service_id, appointment_date, appointmentStatus, description || ''], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const appointment_id = this.lastID;

      // Get the created appointment with service and patient details
      const getAppointmentQuery = `
        SELECT 
          a.*,
          s.service_name,
          s.patient_id,
          p.first_name,
          p.last_name,
          p.phone_number
        FROM Appointment a
        JOIN Services s ON a.service_id = s.service_id
        JOIN Patient p ON s.patient_id = p.patient_id
        WHERE a.appointment_id = ?
      `;

      db.get(getAppointmentQuery, [appointment_id], (err, appointment) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        res.status(201).json({
          message: "Appointment created successfully",
          appointment
        });
      });
    });
  });
};

// Get all appointments
exports.getAllAppointments = (req, res) => {
  const query = `
    SELECT 
      a.*,
      s.service_name,
      s.patient_id,
      p.first_name,
      p.last_name,
      p.phone_number,
      p.email
    FROM Appointment a
    JOIN Services s ON a.service_id = s.service_id
    JOIN Patient p ON s.patient_id = p.patient_id
    ORDER BY a.appointment_date DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ 
      count: rows.length,
      appointments: rows 
    });
  });
};

// Get appointment by ID
exports.getAppointmentById = (req, res) => {
  const { id } = req.params;

  const appointmentQuery = `
    SELECT 
      a.*,
      s.service_name,
      s.service_id,
      s.patient_id,
      p.first_name,
      p.last_name,
      p.phone_number,
      p.email,
      p.date_of_birth,
      p.allergies,
      p.chronic_conditions
    FROM Appointment a
    JOIN Services s ON a.service_id = s.service_id
    JOIN Patient p ON s.patient_id = p.patient_id
    WHERE a.appointment_id = ?
  `;

  db.get(appointmentQuery, [id], (err, appointment) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Get documents for this appointment
    const documentsQuery = `
      SELECT * FROM Documents 
      WHERE appointment_id = ?
      ORDER BY saved_at DESC
    `;

    db.all(documentsQuery, [id], (err, documents) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Get prescriptions for this appointment
      const prescriptionsQuery = `
        SELECT 
          pr.*,
          m.name as medication_name,
          m.common_uses
        FROM Prescription pr
        JOIN Medication m ON pr.medication_id = m.medication_id
        WHERE pr.appointment_id = ?
      `;

      db.all(prescriptionsQuery, [id], (err, prescriptions) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        // Get invoice for this appointment
        const invoiceQuery = `
          SELECT * FROM Invoices 
          WHERE appointment_id = ?
        `;

        db.get(invoiceQuery, [id], (err, invoice) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          res.json({
            appointment,
            documents,
            prescriptions,
            invoice: invoice || null
          });
        });
      });
    });
  });
};

// Get appointments by service ID
exports.getAppointmentsByServiceId = (req, res) => {
  const { service_id } = req.params;

  // Check if service exists
  db.get("SELECT * FROM Services WHERE service_id = ?", [service_id], (err, service) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    const query = `
      SELECT 
        a.*,
        s.service_name,
        p.first_name,
        p.last_name
      FROM Appointment a
      JOIN Services s ON a.service_id = s.service_id
      JOIN Patient p ON s.patient_id = p.patient_id
      WHERE a.service_id = ?
      ORDER BY a.appointment_date DESC
    `;

    db.all(query, [service_id], (err, appointments) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({ 
        service: {
          service_id: service.service_id,
          service_name: service.service_name
        },
        count: appointments.length,
        appointments 
      });
    });
  });
};

// Get appointments by patient ID
exports.getAppointmentsByPatientId = (req, res) => {
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
        a.*,
        s.service_name,
        s.service_id
      FROM Appointment a
      JOIN Services s ON a.service_id = s.service_id
      WHERE s.patient_id = ?
      ORDER BY a.appointment_date DESC
    `;

    db.all(query, [patient_id], (err, appointments) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({ 
        patient: {
          patient_id: patient.patient_id,
          first_name: patient.first_name,
          last_name: patient.last_name
        },
        count: appointments.length,
        appointments 
      });
    });
  });
};

// Update appointment
exports.updateAppointment = (req, res) => {
  const { id } = req.params;
  const { appointment_date, status, description } = req.body;

  db.get("SELECT * FROM Appointment WHERE appointment_id = ?", [id], (err, appointment) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    const updates = [];
    const values = [];

    if (appointment_date !== undefined) {
      updates.push("appointment_date = ?");
      values.push(appointment_date);
    }

    if (status !== undefined) {
      const validStatuses = ['cancelled', 'pending', 'checked-in'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          error: "Invalid status. Must be 'cancelled', 'pending', or 'checked-in'" 
        });
      }
      updates.push("status = ?");
      values.push(status);
    }

    if (description !== undefined) {
      updates.push("description = ?");
      values.push(description);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    values.push(id);
    const query = `UPDATE Appointment SET ${updates.join(", ")} WHERE appointment_id = ?`;

    db.run(query, values, function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Get updated appointment with details
      const getAppointmentQuery = `
        SELECT 
          a.*,
          s.service_name,
          s.patient_id,
          p.first_name,
          p.last_name
        FROM Appointment a
        JOIN Services s ON a.service_id = s.service_id
        JOIN Patient p ON s.patient_id = p.patient_id
        WHERE a.appointment_id = ?
      `;

      db.get(getAppointmentQuery, [id], (err, updatedAppointment) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        res.json({
          message: "Appointment updated successfully",
          appointment: updatedAppointment
        });
      });
    });
  });
};

// Delete appointment
exports.deleteAppointment = (req, res) => {
  const { id } = req.params;

  db.get("SELECT * FROM Appointment WHERE appointment_id = ?", [id], (err, appointment) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    db.run("DELETE FROM Appointment WHERE appointment_id = ?", [id], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({
        message: "Appointment deleted successfully (including related documents, prescriptions, and invoices)",
        appointment_id: id
      });
    });
  });
};

// Get appointments by status
exports.getAppointmentsByStatus = (req, res) => {
  const { status } = req.params;

  const validStatuses = ['cancelled', 'pending', 'checked-in'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ 
      error: "Invalid status. Must be 'cancelled', 'pending', or 'checked-in'" 
    });
  }

  const query = `
    SELECT 
      a.*,
      s.service_name,
      s.patient_id,
      p.first_name,
      p.last_name,
      p.phone_number
    FROM Appointment a
    JOIN Services s ON a.service_id = s.service_id
    JOIN Patient p ON s.patient_id = p.patient_id
    WHERE a.status = ?
    ORDER BY a.appointment_date DESC
  `;

  db.all(query, [status], (err, appointments) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({ 
      status,
      count: appointments.length,
      appointments 
    });
  });
};

// Get upcoming appointments (future dates)
exports.getUpcomingAppointments = (req, res) => {
  const query = `
    SELECT 
      a.*,
      s.service_name,
      s.patient_id,
      p.first_name,
      p.last_name,
      p.phone_number,
      p.email
    FROM Appointment a
    JOIN Services s ON a.service_id = s.service_id
    JOIN Patient p ON s.patient_id = p.patient_id
    WHERE a.appointment_date >= date('now')
    AND a.status != 'cancelled'
    ORDER BY a.appointment_date ASC
  `;

  db.all(query, [], (err, appointments) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({ 
      count: appointments.length,
      appointments 
    });
  });
};
