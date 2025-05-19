const express = require("express");
const router = express.Router();
const {
  signin,
} = require("../../../controllers/adminSideController/loginController/signInController");

router.post("/", signin);

module.exports = router;
