const db = require("../config/db");

exports.getPrescriptionByAppointmentId = (req, res) => {
    const {appointment_id} = req.params
    const sql = `
        SELECT 
            p.appointment_id,
            p.medication_id,
            p.dosage,
            p.frequency_per_day,
            p.duration_by_days,
            p.description,
            m.name AS medication_name,
            m.common_uses
        FROM Prescription p
        JOIN Medication m 
            ON p.medication_id = m.medication_id
        WHERE p.appointment_id = ?
    `;


    db.all(sql, [appointment_id], function (err, rows) {
        if(err) return res.status(400).json({ error: err.message });

        res.status(200).json(rows);
    });
};

//create a new empty prescription
exports.addPrescription = (req, res) => {
    const {appointment_id, medication_id} = req.params;
    const sql = 'INSERT INTO Prescription(appointment_id, medication_id) VALUES (?, ?)';
    const values = [appointment_id, medication_id];

    db.run(sql, values, (err) => {
        if(err) {
            if(err.message.includes("UNIQUE constraint failed")) 
                return res.status(409).json({
                    error: "Prescription already exists for this appointment and medication"
                });

            return res.status(400).json({ error: err.message });
        }

        res.status(201).json({
            status: "prescription created",
            prescription_details: {
                appointment_id: appointment_id,
                medication_id: medication_id,
            }
        });
    });
};

exports.updatePrescription = (req, res) => {
    const {appointment_id, medication_id} = req.params;
    const fields = req.body;

    const updates = [];
    const values = [];

    for (let key in fields) {
        updates.push(`${key} = ?`);
        values.push(fields[key]);
    }

    if (updates.length === 0)
        return res.status(400).json({ error: "No fields to update" });

    const sql = `UPDATE Prescription SET ${updates.join(', ')} WHERE appointment_id = ? AND medication_id = ?`;
    values.push(appointment_id, medication_id);

    db.run(sql, values, function (err) {
        if (err) return res.status(400).json({ error: err.message });

        if (this.changes === 0)
            return res.status(404).json({ error: "Prescription not found" });

        res.status(200).json({
            status: "Prescription updated",
            appointment_id,
            medication_id,
            updated_fields: fields
        });
    });
};


exports.deletePrescription = (req, res) => {
    const {appointment_id, medication_id} = req.params;
    const sql = 'DELETE FROM Prescription WHERE appointment_id = ? and medication_id = ?';
    const values = [appointment_id, medication_id];

    db.run(sql, values, function (err) {
        if(err) return res.status(400).json({ error: err.message });
        if(this.changes === 0) return res.status(404).json({ error: "Prescription not found" });

        res.status(200).json({
            status: "prescription deleted",
            appointment_id: appointment_id,
            medication_id: medication_id
        });
    });

};

//medication with no prescription at this appointment
exports.getAllMedicationsByAppointmentId = (req, res) => {
    const {appointment_id}  = req.params;
    const sql = `
        SELECT m.medication_id, m.name, m.common_uses
        FROM Medication m
        LEFT JOIN Prescription p 
            ON m.medication_id = p.medication_id AND p.appointment_id = ?
        WHERE p.medication_id IS NULL
    `;

    db.all(sql, [appointment_id], function (err, rows) {
        if(err) return res.status(400).json({ error: err.message });
        if(!rows || this.changes === 0) 
            return res.status(404).json({ error: "All medications are using in this appiontment" });

        res.status(200).json(rows);
    });
};

exports.getPatientByAppointmentId = (req, res) => {
    const {appointment_id} = req.params;
    const sql = `
        SELECT p.* FROM Patient p
        JOIN Services s ON p.patient_id = s.patient_id
        JOIN Appointment a ON a.service_id = s.service_id
        WHERE a.appointment_id = ?
    `;

    db.all(sql, [appointment_id], function (err, rows) {
        if(err) return res.status(400).json({ error: err.message });
        if(!rows || this.changes === 0)
            return res.status(404).json({ error: "Appointment or Patient not found" });

        res.status(200).json(rows);
    });
};