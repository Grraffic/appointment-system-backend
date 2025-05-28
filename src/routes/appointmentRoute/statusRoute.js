const express = require("express");
const router = express.Router();
const {
  updateStatus,
  getAllStatuses,
  deleteStatus,
} = require("../../controllers/appointmentController/status.controller");

router.get("/", getAllStatuses);
router.put("/status/:transactionNumber", updateStatus);
router.delete("/status/:transactionNumber", deleteStatus);

module.exports = router;