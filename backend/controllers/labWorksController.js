const db = require("../config/db");

exports.getAllLabWorks = (req, res) => {
    db.all("SELECT * FROM Lab_work", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};


exports.getByLabId_ServiceId = (req, res) => {
    const { lab_id, service_id } = req.params;

    const query = `
        SELECT 
            Lab_work.*,
            Services.service_name,
            Labs.name AS lab_name,
            Patient.first_name || ' ' || Patient.last_name AS patient_name
        FROM Lab_work
        JOIN Services ON Lab_work.service_id = Services.service_id
        JOIN Labs ON Lab_work.lab_id = Labs.lab_id
        JOIN Patient ON Services.patient_id = Patient.patient_id
        WHERE Lab_work.lab_id = ? AND Lab_work.service_id = ?
    `;

    db.all(query, [lab_id, service_id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};


exports.getLabWorkById = (req, res) => {
    const { id } = req.params;

    db.get("SELECT * FROM Lab_work WHERE lab_work_id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "Lab work not found!" });

        res.json(row);
    });
};


exports.addLabWork = (req, res) => {
    const { service_id, lab_id, delivery_date, status, description } = req.body;
    const sql = `
        INSERT INTO Lab_work (service_id, lab_id, delivery_date, status, description)
        VALUES (?, ?, ?, ?, ?)
    `;
    const values = [
        service_id || null,
        lab_id || null,
        delivery_date || null,
        status || "in progress",
        description || null
    ];

    db.run(sql, values, function (err) {
        if (err) return res.status(500).json({ error: err.message });

        db.get("SELECT * FROM Lab_work WHERE lab_work_id = ?", [this.lastID], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json(row);
        });
    });
};


exports.updateLabWork = (req, res) => {
    const { id } = req.params;
    const fields = req.body;
    const updates = [];
    const values = [];

    for (let key in fields) {
        updates.push(`${key} = ?`);
        values.push(fields[key]);
    }
    if (updates.length === 0) {
        return res.status(400).json({ error: "No fields to update" });
    }
    values.push(id);

    const sql = `UPDATE Lab_work SET ${updates.join(", ")} WHERE lab_work_id = ?`;

    db.run(sql, values, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: "Lab work not found" });

        db.get("SELECT * FROM Lab_work WHERE lab_work_id = ?", [id], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(row);
        });
    });
};


exports.deleteLabWork = (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM Lab_work WHERE lab_work_id = ?", [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0)
            return res.status(404).json({ error: "Lab work not found" });

        res.json({ message: "Lab work deleted successfully" });
    });
};


exports.deleteWorksByService = (req, res) => {
  const { service_id, lab_id } = req.params;

  db.run(
    "DELETE FROM Lab_work WHERE service_id = ? AND lab_id = ?",
    [service_id, lab_id], (err) => {
      if(err) return res.status(500).json({ error: err.message });
      res.json({ message: "Lab works deleted successfully" });
    }
  );
};