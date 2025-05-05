const contactFormSchema = require("../models/contactSchema/contactFormSchema");

const submitContactForm = async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const newContact = new ContactForm({ name, email, subject, message });
    await newContact.save();
    res.status(200).json({ message: "Form submitted successfully." });
  } catch (err) {
    console.error("Error saving contact:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

//Get all the contacts
const getContact = async (req, res) => {
  try {
    const contacts = await ContactForm.find();
    res.status(200).json(contacts);
  } catch (error) {
    console.error("Error fetching students:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

//Get a specific ID
const getContactId = async (req, res) => {
  try {
    const contact = await ContactForm.findById(req.params.id);
    if (!contact) return res.status(404).json({ message: "Contact not found" });
    res.status(200).json(contact);
  } catch (error) {
    console.error("Error fetching student:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};

//update a Contact by ID
const updateContact = async (req, res) => {
  try {
    const updated = await ContactForm.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updated) return res.status(404).json({ message: "Contact not found" });
    res.status(200).json({ message: "Contact updated successfully", updated });
  } catch (error) {
    console.error("Error updating contact:", err.message);
    res.status(500).hson({ message: "Server error" });
  }
};

//Delete a Contact by using ID

const deleteContact = async (req, res) => {
  try {
    const deleted = await ContactForm.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Student not found" });
    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports = {
  submitContactForm,
  getContact,
  getContactId,
  updateContact,
  deleteContact,
};
