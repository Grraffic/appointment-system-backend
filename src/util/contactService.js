const nodemailer = require("nodemailer");

const sendContactNotification = async (contactDetails) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  // Email to registrar's office
  const registrarMailOptions = {
    from: `"LV AppointEase" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER, // Send to registrar's email
    subject: `New Contact Form Submission: ${contactDetails.subject}`,
    text: `
    New contact form submission received:
    
    Name: ${contactDetails.name}
    Email: ${contactDetails.email}
    Subject: ${contactDetails.subject}
    Message: ${contactDetails.message}
    
    Date: ${new Date().toLocaleString()}
    `,
    html: `
    <h2>New Contact Form Submission</h2>
    <p><strong>From:</strong> ${contactDetails.name}</p>
    <p><strong>Email:</strong> ${contactDetails.email}</p>
    <p><strong>Subject:</strong> ${contactDetails.subject}</p>
    <p><strong>Message:</strong></p>
    <p>${contactDetails.message}</p>
    <p><em>Submitted on: ${new Date().toLocaleString()}</em></p>
    `,
  };

  // Email to user (confirmation)
  const userMailOptions = {
    from: `"LV AppointEase" <${process.env.GMAIL_USER}>`,
    to: contactDetails.email,
    subject: "We've Received Your Message - La Verdad Christian College",
    text: `
    Dear ${contactDetails.name},

    Thank you for contacting La Verdad Christian College. This email confirms that we have received your message.

    Your message details:
    Subject: ${contactDetails.subject}
    Message: ${contactDetails.message}

    We will review your message and get back to you as soon as possible. Please note that our response time may vary depending on the volume of inquiries.

    Best regards,
    La Verdad Christian College
    Registrar's Office
    `,
    html: `
    <h2>Thank You for Contacting Us</h2>
    <p>Dear ${contactDetails.name},</p>
    <p>Thank you for contacting La Verdad Christian College. This email confirms that we have received your message.</p>
    
    <h3>Your message details:</h3>
    <p><strong>Subject:</strong> ${contactDetails.subject}</p>
    <p><strong>Message:</strong><br>${contactDetails.message}</p>
    
    <p>We will review your message and get back to you as soon as possible. Please note that our response time may vary depending on the volume of inquiries.</p>
    
    <p>Best regards,<br>
    La Verdad Christian College<br>
    Registrar's Office</p>
    `,
  };

  try {
    // Send email to registrar
    await transporter.sendMail(registrarMailOptions);
    console.log("Contact form notification sent to registrar");

    // Send confirmation email to user
    await transporter.sendMail(userMailOptions);
    console.log("Confirmation email sent to user");

    return true;
  } catch (error) {
    console.error("Error sending contact form emails:", error);
    throw error;
  }
};

module.exports = {
  sendContactNotification,
};
