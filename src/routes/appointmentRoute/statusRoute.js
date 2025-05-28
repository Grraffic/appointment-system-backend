const express = require("express");
const router = express.Router();
const {
  updateStatus,
  getAllStatuses,
} = require("../../controllers/appointmentController/status.controller");

router.get("/", getAllStatuses);
router.put("/:transactionNumber", updateStatus);

module.exports = router;
