const express = require("express");
const router = express.Router();
const {
  submitContactForm,
  getContact,
  getContactId,
  updateContact,
  deleteContact,
} = require("../controllers/contact.Controller");

router.post("/", submitContactForm);
router.get("/", getContact);
router.get("/:id", getContactId);
router.put("/:id", updateContact);
router.delete("/:id", deleteContact);

module.exports = router;
