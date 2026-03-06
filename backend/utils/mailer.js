const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ipremiumindia@gmail.com",
    pass: "mxwzukcfjefkucbv",   // Unga Gmail App Password (Normal password illa)
  },
});

module.exports = transporter;
