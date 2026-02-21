// server.js or routes/customers.js
const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer"); // your Mongoose model
const nodemailer = require("nodemailer");

router.post("/", async (req, res) => {
  try {
    // 1️⃣ Save job to DB
    const customer = await Customer.create(req.body);

    // 2️⃣ Send email
    if (customer.email) {
      const transporter = nodemailer.createTransport({
        service: "Gmail", // or your email service
        auth: {
         user: "ipremiumindia@gmail.com", // Double check this email
          pass: "mxwz ukcf jefk ucbv" // app password if Gmail
        },
      });

      const mailOptions = {
        from: `"iPremium Care" <${process.env.EMAIL_USER}>`,
        to: customer.email,
        subject: `Welcome to iPremium Care - ${customer.jobId}`,
        html: `
          <h2>Welcome to iPremium Care ✅</h2>
          <p>Hi ${customer.name},</p>
          <p>Your job <b>${customer.jobId}</b> has been created successfully.</p>
          <p>We will keep you updated on the service status.</p>
          <br/>
          <p>Thank you for choosing iPremium Care!</p>
        `,
      };

      await transporter.sendMail(mailOptions);
    }

    res.status(201).json(customer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating job" });
  }
});

module.exports = router;