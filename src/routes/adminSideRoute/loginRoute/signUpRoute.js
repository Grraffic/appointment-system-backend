const express = require("express");
const router = express.Router();
const hashPassword = require("../../../middleware/hashPassword");
const {
  signup,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../../../controllers/adminSideController/loginController/signUpController");
const authMiddleware = require("../../../middleware/authMiddleware");

// Public route
router.post("/", signup);

// Protected routes
router.get("/", authMiddleware, getAllUsers);
router.get("/:id", authMiddleware, getUserById);
router.put("/:id", authMiddleware, updateUser);
router.delete("/:id", authMiddleware, deleteUser);

module.exports = router;
