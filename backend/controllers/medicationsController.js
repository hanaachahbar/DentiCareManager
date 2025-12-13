const db = require('../config/db');

exports.getAllMedications = (req, res) => {
    const sql = 'SELECT * FROM Medication';

    db.all(sql, [], (err, rows) => {
        if(err) return res.status(400).json({ error: err.message });
        
        res.status(200).json(rows);
    });
};

exports.updateMedication = (req, res) => {
    const {medication_id} = req.params;
    const fields = req.body;
    const updates = [];
    const values = [];

    for(let key in fields) {
        updates.push(`${key} = ?`);           
        values.push(fields[key]);
    }

    if(updates.length === 0) return res.status(400).json({ error: "No feild to update" });
    const sql = `UPDATE Medication SET ${updates.join(', ')} WHERE medication_id = ?`;
    values.push(medication_id);

    db.run(sql, values, function (err) {
        if(err) return res.status(400).json({ error: err.message });
        if(this.changes === 0) return res.status(404).json({ error: "Medication not found" });
        
        res.status(200).json({
            status: "medication updated",
            MedicationDetails: {
                medication_id: medication_id,
                update_fields: fields
            }
        });
    });
};

exports.deleteMedication = (req, res) => {
    const {medication_id} = req.params;
    const sql = 'DELETE FROM Medication WHERE medication_id = ?';

    db.run(sql, medication_id, function (err) {
        if(err) return res.status(400).json({ error: err.message });
        if(this.changes === 0) return res.status(404).json({ error: "Medication not found" });
        res.json({
            status: "Medication deleted",
            medication_id: medication_id
        });
    });
};

exports.insertMedication = (req, res) => {
    const {name, common_uses} = req.body;
    if(!name) return res.status(400).json({ error: "Name is required" });

    const sql = 'INSERT INTO Medication(name, common_uses) VALUES (?, ?)';
    const values = [name, common_uses || null];

    db.run(sql, values, function (err) {
        if(err) return res.status(400).json({error: err.message})
        
        res.status(200).json({
            status: "New Medication create", 
            MedicationDetails: {
                medication_id: this.lastID,
                name: name,
                common_uses: common_uses
            }
        })
    });
};