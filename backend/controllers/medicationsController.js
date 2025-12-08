const db = require('../config/db');

exports.getMedications = (req, res) => {
    db.all('SELECT * FROM Medication', [], (err, rows) => {
        if(err) return res.status(500).json({error: err.message});
        res.json(rows);
    });
};


exports.getMedicationById = (req, res) => {
    const {id} = req.params;
    db.get('SELECT * FROM Medication WHERE medication_id = ?', [id], (err, row) => {
        if(err) return res.status(500).json({error: err.message});
        if(!row) return res.status(404).json({error: "Patient not found!"});
        res.json(row);
    });
};


exports.addMedication = (req, res) => {
    const {id} = req.params;
    const { name, common_uses } = req.body;
    const sql = "INSERT INTO Medication (name, common_uses) values ?, ?";
    const values = [name, common_uses];
    db.run(sql, values, (err) => {
        if(err) return res.status(500).json({ error: err.message });
        res.status(201).json({
            status: true,
            medication_data: {
                medication_id: this.lastID,
                medication_name: name,
                common_uses
            }
        });
    });
};


exports.updateMedication = (req, res) => {
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

    db.run(`UPDATE Medication SET ${updates.join(', ')} WHERE medication_id = ?`, values, (err) => {
        if(err) return res.status(500).json({ error: err.message });
        if(this.changes === 0) return res.status(404).json({ error: "Medication not found" });
    });
};


exports.deleteMedication = (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM Medication WHERE medication_id = ?", [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Medication not found" });
    res.json({ message: "Medication deleted successfully" });
  });
};