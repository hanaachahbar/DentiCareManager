const express = require('express');
const router = express.Router();

const {
    getAllLabWorks,
    getByLabId_ServiceId,
    getLabWorkById,
    addLabWork,
    updateLabWork,
    deleteLabWork,
    deleteWorksByService
} = require('../controllers/labWorksController');

router.get("/lab-work/:lab_id/:service_id", getByLabId_ServiceId);
router.get("/", getAllLabWorks);
router.get("/:id", getLabWorkById);
router.post("/", addLabWork);
router.put("/:id", updateLabWork);
router.delete("/:id", deleteLabWork);
router.delete("/lab-work/:service_id/:lab_id", deleteWorksByService);

module.exports = router;