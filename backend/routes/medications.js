const express = require('express');
const router = express.Router();

const {
    getAllMedications,
    updateMedication,
    deleteMedication,
    insertMedication
} = require('../controllers/medicationsController');

router.get("/", getAllMedications);

router.put("/:medication_id", updateMedication)

router.post("/", insertMedication)

router.delete("/:medication_id", deleteMedication)

module.exports = router;