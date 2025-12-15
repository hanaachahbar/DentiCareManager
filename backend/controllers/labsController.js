const db = require('../config/db');

exports.getAllLabs = (req, res) => {
    db.all('SELECT * FROM Labs', [], (err, rows) => {
        if(err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};


exports.getLabById = (req, res) => {
    const {id} = req.params;
    db.get('SELECT * FROM Labs WHERE lab_id = ?', [id], (err, row) => {
        if(err) return res.status(500).json({ error: err.message });
        if(!row) return res.status(404).json({ error: "Lab not found!" });
        res.json(row);
    });
};


exports.addLab = (req, res) => {
    const {name, phone, email, address, personalContact} = req.body;
    
    const sql = `INSERT INTO Labs (name, contact_person,
    phone_number, email, address) VALUES (?, ?, ?, ?, ?)`;

    const values = [name, personalContact || null, phone, email, address];

    db.run(sql, values, function(err) {
        if(err) return res.status(500).json({ error: err.message });

        res.status(201).json({
            status: true,
            lab_data: {
                lab_id: this.lastID,
                name, phone, email, address, personalContact
            }
        });
    });
};


exports.updateLab = (req, res) => {
    const {id} = req.params;
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

    db.run(`UPDATE Lab SET ${updates.join(", ")} WHERE lab_id = ?`, values, function(err) {
        if(err) return res.status(500).json({ error: err.message });
        if(this.changes === 0) return res.status(404).json({ error: "Lab not found" });

        db.get("SELECT * FROM Labs WHERE lab_id = ?", [id], (err, row) => {
        if(err) return res.status(500).json({ error: err.message });
        res.json(row);
        });
    });
};


exports.deleteLab = (req, res) => {
    const {id} = req.params;
    db.run('DELETE FROM Labs WHERE lab_id = ?', [id], function(err) {
        if(err) return res.status(500).json({ error: err.message });
        if(this.changes === 0) return res.status(404).json({ error: "Lab not found" });
        res.json({ message: "Lab deleted successfully" });
    })
};