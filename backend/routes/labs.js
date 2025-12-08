const express = require('express');
const router = express.Router();

const {
    getAllLabs,
    getLabById,
    addLab,
    updateLab,
    deleteLab
} = require('../controllers/labsController');

router.get("/", getAllLabs);
router.get("/:id", getLabById);
router.post("/", addLab);
router.put("/:id", updateLab);
router.delete("/:id", deleteLab);

module.exports = router;