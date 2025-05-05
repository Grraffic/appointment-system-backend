const express = require("express");
const router = express.Router();
const hashPassword = require("../../middleware/hashPassword");
const {
  signup,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../../controllers/adminSideController/loginController/signUpController.js");

router.post("/", hashPassword, signup);
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
