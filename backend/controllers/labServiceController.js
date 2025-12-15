const db = require('../config/db');

// Get all lab-service assignments with patient name
exports.getAllLabServices = (req, res) => {
    const query = `
        SELECT ls.lab_service_id, ls.lab_id, ls.service_id,
               l.name AS lab_name,
               s.service_name,
               s.patient_id,
               p.first_name || ' ' || p.last_name AS patient_name
        FROM Lab_Service ls
        JOIN Labs l ON ls.lab_id = l.lab_id
        JOIN Services s ON ls.service_id = s.service_id
        LEFT JOIN Patient p ON s.patient_id = p.patient_id
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};



//Get all services for a certain lab
exports.getServicesByLabId = (req, res) => {
    const { lab_id } = req.params;
    const query = `
        SELECT ls.lab_service_id, ls.service_id, s.patient_id
        FROM Lab_Service ls
        JOIN Services s ON ls.service_id = s.service_id
        WHERE ls.lab_id = ?
    `;
    db.all(query, [lab_id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

// Assign a service to a lab
exports.addLabService = (req, res) => {
    const { lab_id, service_id } = req.body;
    if (!lab_id || !service_id) return res.status(400).json({ error: "lab_id and service_id are required" });

    const query = `INSERT INTO Lab_Service (lab_id, service_id) VALUES (?, ?)`;
    db.run(query, [lab_id, service_id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ lab_service_id: this.lastID, lab_id, service_id });
    });
};

// Remove a service from a lab
exports.deleteLabService = (req, res) => {
    const { lab_service_id } = req.params;
    const query = `DELETE FROM Lab_Service WHERE lab_service_id = ?`;
    db.run(query, [lab_service_id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: this.changes });
    });
};