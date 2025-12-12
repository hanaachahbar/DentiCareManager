// controllers/serviceDetailsController.js
const db = require("../config/db");

// Get comprehensive service details
exports.getServiceDetails = (req, res) => {
  const { service_id } = req.params;

  if (!service_id) {
    return res.status(400).json({ error: "Service ID is required" });
  }

  // Get service basic info
  const serviceQuery = `
    SELECT 
      s.service_id,
      s.service_name,
      s.status,
      s.created_at,
      s.patient_id,
      p.first_name,
      p.last_name,
      p.email,
      p.phone_number,
      pay.payment_id,
      pay.total_amount,
      pay.paid_amount,
      pay.status as payment_status,
      pay.description as payment_description
    FROM Services s
    LEFT JOIN Patient p ON s.patient_id = p.patient_id
    LEFT JOIN Payment pay ON s.service_id = pay.service_id
    WHERE s.service_id = ?
  `;

  db.get(serviceQuery, [service_id], (err, service) => {
    if (err) {
      console.error("Error fetching service:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    // Get appointments for this service
    const appointmentsQuery = `
      SELECT 
        a.appointment_id,
        a.appointment_date,
        a.appointment_time,
        a.description,
        a.status as appointment_status,
        a.created_at
      FROM Appointment a
      WHERE a.service_id = ?
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `;

    db.all(appointmentsQuery, [service_id], (err, appointments) => {
      if (err) {
        console.error("Error fetching appointments:", err);
        return res.status(500).json({ error: "Database error" });
      }

      // For each appointment, get related data
      if (appointments.length === 0) {
        return res.json({
          service: {
            ...service,
            patient_name: `${service.first_name} ${service.last_name}`,
            patient_id_formatted: `PT${String(service.patient_id).padStart(5, '0')}`,
            formatted_total_price: service.total_amount ? `$${service.total_amount.toFixed(2)}` : '$0.00'
          },
          appointments: [],
          summary: {
            total_appointments: 0,
            upcoming_appointments: 0,
            total_amount: service.total_amount || 0,
            paid_amount: service.paid_amount || 0,
            remaining_amount: (service.total_amount || 0) - (service.paid_amount || 0)
          }
        });
      }

      // Process appointments one by one
      const processedAppointments = [];
      let processedCount = 0;

      appointments.forEach((appointment, index) => {
        const appointmentId = appointment.appointment_id;

        // Get prescription for this appointment
        const prescriptionsQuery = `
          SELECT 
            m.name as medication_name,
            pr.dosage,
            pr.frequency_per_day,
            pr.duration_by_days,
            pr.description
          FROM Prescription pr
          LEFT JOIN Medication m ON pr.medication_id = m.medication_id
          WHERE pr.appointment_id = ?
        `;

        db.all(prescriptionsQuery, [appointmentId], (err, prescriptions) => {
          if (err) {
            console.error("Error fetching prescriptions:", err);
            prescriptions = [];
          }

          // Get invoice for this appointment
          const invoiceQuery = `
            SELECT 
              i.invoice_id,
              i.amount,
              i.description
            FROM Invoices i
            WHERE i.appointment_id = ?
          `;

          db.get(invoiceQuery, [appointmentId], (err, invoice) => {
            if (err) {
              console.error("Error fetching invoice:", err);
              invoice = null;
            }

            // Get documents for this appointment
            const documentsQuery = `
              SELECT 
                document_id,
                path as name,
                saved_at
              FROM Documents
              WHERE appointment_id = ?
              ORDER BY saved_at DESC
            `;

            db.all(documentsQuery, [appointmentId], (err, documents) => {
              if (err) {
                console.error("Error fetching documents:", err);
                documents = [];
              }

              // Format the appointment
              const appointmentDate = new Date(appointment.appointment_date);
              const formattedDate = appointmentDate.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              });

              const processedAppointment = {
                id: appointmentId,
                dateLabel: formattedDate,
                time: appointment.appointment_time ? appointment.appointment_time.substring(0, 5) : '10:00',
                title: appointment.description || 'Appointment',
                notes: appointment.description || '',
                status: appointment.appointment_status,
                prescription: prescriptions.length > 0 ? {
                  name: prescriptions[0].medication_name || 'Prescription',
                  date: formattedDate,
                  details: prescriptions[0]
                } : null,
                invoice: invoice ? {
                  amount: `$${parseFloat(invoice.amount).toFixed(2)}`,
                  description: invoice.description || 'Appointment fee',
                  invoice_id: invoice.invoice_id
                } : null,
                files: documents.map(doc => ({
                  document_id: doc.document_id,
                  name: doc.name,
                  uploaded_date: doc.saved_at
                }))
              };

              processedAppointments[index] = processedAppointment;
              processedCount++;

              // When all appointments are processed, send response
              if (processedCount === appointments.length) {
                // Sort appointments by date (newest first)
                processedAppointments.sort((a, b) => {
                  const dateA = new Date(a.dateLabel.split(' ').reverse().join('-'));
                  const dateB = new Date(b.dateLabel.split(' ').reverse().join('-'));
                  return dateB - dateA;
                });

                const upcomingCount = processedAppointments.filter(a => {
                  const appointmentDate = new Date(a.dateLabel.split(' ').reverse().join('-'));
                  return appointmentDate > new Date();
                }).length;

                res.json({
                  service: {
                    ...service,
                    patient_name: `${service.first_name} ${service.last_name}`,
                    patient_id_formatted: `PT${String(service.patient_id).padStart(5, '0')}`,
                    formatted_total_price: service.total_amount ? `$${service.total_amount.toFixed(2)}` : '$0.00',
                    description: `Treatment for ${service.first_name} ${service.last_name}. ${service.payment_description || 'Ongoing dental care.'}`
                  },
                  appointments: processedAppointments,
                  summary: {
                    total_appointments: processedAppointments.length,
                    upcoming_appointments: upcomingCount,
                    total_amount: service.total_amount || 0,
                    paid_amount: service.paid_amount || 0,
                    remaining_amount: (service.total_amount || 0) - (service.paid_amount || 0)
                  }
                });
              }
            });
          });
        });
      });
    });
  });
};