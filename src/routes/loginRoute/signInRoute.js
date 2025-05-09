const express = require("express");
const router = express.Router();
const {
  signIn,
} = require("../../controllers/adminSideController/loginController/signInController");

// Add debug to confirm this file is loaded
console.log("✅ Signin routes loaded");

router.post("/", signIn);

module.exports = router;
