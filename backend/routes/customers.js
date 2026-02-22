const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const { Resend } = require("resend");
const Invoice = require("../models/Invoice");

const resend = new Resend(process.env.RESEND_API_KEY);

router.post("/send-email/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("customerId");

    if (!invoice) {
      return res.status(404).json({ msg: "Invoice not found" });
    }

    if (!invoice.customerId?.email) {
      return res.status(400).json({ msg: "Customer email missing" });
    }

    // 🧾 Create PDF in memory
    const doc = new PDFDocument();
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));

    doc.on("end", async () => {
      try {
        const pdfBuffer = Buffer.concat(buffers);

        const response = await resend.emails.send({
          from: "onboarding@resend.dev",
          to: invoice.customerId.email,
          subject: `Invoice - ${invoice.invoiceNumber}`,
          html: `
            <h2>Hello ${invoice.customerId.name}</h2>
            <p>Please find your invoice attached.</p>
            <p>Thank you for your business.</p>
          `,
          attachments: [
            {
              filename: "invoice.pdf",
              content: pdfBuffer.toString("base64"),
            },
          ],
        });

        console.log("Email sent:", response);
        res.json({ msg: "Email sent with PDF successfully" });

      } catch (emailErr) {
        console.error("EMAIL ERROR:", emailErr);
        res.status(500).json({ error: emailErr.message });
      }
    });

    // -------------------------
    // 📝 PDF CONTENT START
    // -------------------------

    doc.fontSize(20).text("INVOICE", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Invoice No: ${invoice.invoiceNumber}`);
    doc.text(`Date: ${new Date(invoice.createdAt).toDateString()}`);
    doc.moveDown();

    doc.text(`Customer Name: ${invoice.customerId.name}`);
    doc.text(`Customer Email: ${invoice.customerId.email}`);
    doc.moveDown();

    doc.text(`Amount: ₹${invoice.amount}`);
    doc.text(`Status: ${invoice.status}`);
    doc.moveDown();

    // If you have items array
    if (invoice.items && invoice.items.length > 0) {
      doc.moveDown();
      doc.text("Items:");
      doc.moveDown();

      invoice.items.forEach((item, index) => {
        doc.text(
          `${index + 1}. ${item.description} - Qty: ${item.qty} - ₹${item.price}`
        );
      });
    }

    doc.moveDown();
    doc.text("Thank you for your business!");

    doc.end();

  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
