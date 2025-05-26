const express = require("express");
const router = express.Router();
const forgotPasswordController = require("../../../controllers/adminSideController/loginController/forgotPasswordController");

router.post("/request-otp", forgotPasswordController.requestOTP);
router.post("/verify-otp", forgotPasswordController.verifyOTP);
router.post("/reset-password", forgotPasswordController.resetPassword);

module.exports = router;
