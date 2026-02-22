// server.js or routes/customers.js
const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer"); // your Mongoose model
const nodemailer = require("nodemailer");
const Invoice = require("../models/Invoice");

router.post("/send-email/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("customerId");
     console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);
    if (!invoice) {
      return res.status(404).json({ msg: "Invoice not found" });
    }

    if (!invoice.customerId?.email) {
      return res.status(400).json({ msg: "Customer email missing" });
    }

   const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  family: 4, // 🔥 FORCE IPv4 (VERY IMPORTANT)
  tls: {
    rejectUnauthorized: false
  }
});

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: invoice.customerId.email,
      subject: "Invoice",
      text: "Your invoice attached",
    });

    res.json({ msg: "Email sent" });

  } catch (err) {
    console.error("SEND EMAIL ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;
