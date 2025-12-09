const express = require('express');
const router = express.Router();
const {
    getAllLabServices,
    getServicesByLabId,
    addLabService,
    deleteLabService
} = require('../controllers/labServiceController');

router.get("/", getAllLabServices);

router.get("/lab/:lab_id", getServicesByLabId);

router.post("/", addLabService);

router.delete("/:lab_service_id", deleteLabService);

module.exports = router;
