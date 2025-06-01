const ContactForm = require("../models/contactSchema/contactFormSchema");

const { sendContactNotification } = require("../util/contactService");

const submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Create and save contact form entry
    const contact = new ContactForm({ name, email, subject, message });
    await contact.save(); // Send email notifications asynchronously without waiting
    sendContactNotification({ name, email, subject, message }).catch(
      (emailError) => {
        console.error("Error sending notifications:", emailError);
      }
    );

    res.status(201).json({
      message:
        "Form submitted successfully. You will receive a confirmation email shortly.",
    });
  } catch (error) {
    console.error("Error in submitContactForm:", error);
    res.status(500).json({ error: "Server error while submitting form" });
  }
};
// Get all contacts
const getContact = async (req, res) => {
  try {
    const contacts = await ContactForm.find();
    res.status(200).json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get a contact by ID
const getContactId = async (req, res) => {
  try {
    const contact = await ContactForm.findById(req.params.id);
    if (!contact) return res.status(404).json({ message: "Contact not found" });
    res.status(200).json(contact);
  } catch (error) {
    console.error("Error fetching contact:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update a contact by ID
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
    console.error("Error updating contact:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a contact by ID
const deleteContact = async (req, res) => {
  try {
    const deleted = await ContactForm.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Contact not found" });
    res.status(200).json({ message: "Contact deleted successfully" });
  } catch (error) {
    console.error("Error deleting contact:", error.message);
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
