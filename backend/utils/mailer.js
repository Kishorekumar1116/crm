const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "your-email@gmail.com", // Unga Gmail id
    pass: "your-app-password",    // Unga Gmail App Password (Normal password illa)
  },
});

module.exports = transporter;