const express = require('express');
const router = express.Router();
const {
    getPrescriptionByAppointmentId,
    addPrescription,
    deletePrescription,
    updatePrescription,
    getAllMedicationsByAppointmentId,  //used to get the medication that not used in any prescription with this appointment
    getPatientByAppointmentId
} = require("../controllers/prescriptionsController");

router.get("/:appointment_id", getPrescriptionByAppointmentId);
router.get("/:appointment_id/available-medications", getAllMedicationsByAppointmentId);
router.get("/:appointment_id/patient-data", getPatientByAppointmentId);
router.put("/:appointment_id/:medication_id", updatePrescription);
router.post("/:appointment_id/:medication_id", addPrescription);
router.delete("/:appointment_id/:medication_id", deletePrescription);

module.exports = router;