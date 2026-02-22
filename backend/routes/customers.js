// server.js or routes/customers.js
const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer"); // your Mongoose model
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);
const Invoice = require("../models/Invoice");

router.post("/send-email/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("customerId");

    if (!invoice) {
      return res.status(404).json({ msg: "Invoice not found" });
    }

    // If you already created PDF buffer, use that
    const pdfBuffer = invoice.pdfBuffer; // or your generated buffer

    const response = await resend.emails.send({
      from: "onboarding@resend.dev", // temporary sender
      to: invoice.customerId.email,
      subject: `Invoice - ${invoice.invoiceNumber}`,
      html: `
        <h2>Hello ${invoice.customerId.name}</h2>
        <p>Please find your invoice attached.</p>
        <p>Thank you for your business.</p>
      `,
      attachments: pdfBuffer
        ? [
            {
              filename: "invoice.pdf",
              content: pdfBuffer.toString("base64"),
            },
          ]
        : [],
    });

    console.log("Email sent:", response);

    res.json({ msg: "Email sent successfully" });

  } catch (err) {
    console.error("EMAIL ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;
