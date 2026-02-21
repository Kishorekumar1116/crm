const router = require("express").Router();
const Invoice = require("../models/Invoice");
const Customer = require("../models/Customer");
const PDFDocument = require("pdfkit");
const nodemailer = require("nodemailer");
const streamBuffers = require("stream-buffers");

// ==============================
// COMMON EMAIL CONFIG
// ==============================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ipremiumindia@gmail.com",
    pass: "mxwzukcfjefkucbv",
  },
});

// ==============================
// PDF GENERATOR
// ==============================
const generatePDFContent = (doc, invoice, flattened) => {

  doc.fontSize(22).fillColor("#2c3e50")
     .text("iPremium Care", { align: "center" });

  doc.fontSize(10)
     .text("Your Trusted Service Partner", { align: "center" });

  doc.moveDown();
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown();

  doc.fontSize(12)
     .text(`Invoice No: ${invoice.invoiceNumber}`, { align: "right" });

  doc.text(`Date: ${new Date(invoice.createdAt).toDateString()}`, { align: "right" });

  doc.moveDown(2);

  const fromY = doc.y;

  doc.rect(50, fromY, 250, 120).stroke("#2c3e50");

  doc.fontSize(12).fillColor("#0d6efd")
     .text("FROM:", 60, fromY + 10);

  doc.fillColor("black").fontSize(11)
     .text("iPremium Care", 60)
     .text("iPremium India - HSR Layout")
     .text("Bengaluru, Karnataka - 560102")
     .text("GST: 29AAKFI8994H1ZH")
     .text("Phone: 8884417766")
     .text("Email: support@ipremiumindia.co.in");

  doc.rect(320, fromY, 230, 120).stroke("#2c3e50");

  doc.fillColor("#0d6efd").fontSize(12)
     .text("BILL TO:", 330, fromY + 10);

  doc.fillColor("black").fontSize(11)
     .text(`Name: ${flattened.name || "N/A"}`, 330)
     .text(`Phone: ${flattened.phone || "N/A"}`)
     .text(`Email: ${flattened.email || "N/A"}`);

  doc.moveDown(8);

  doc.rect(50, doc.y, 500, 45)
     .fill("#f8f9fa")
     .stroke("#dee2e6");

  doc.fillColor("#198754")
     .fontSize(18)
     .text(`TOTAL AMOUNT: RS.${invoice.amount}`, 60, doc.y + 12);

  doc.moveDown(4);

  doc.fontSize(10)
     .fillColor("black")
     .text("Thank you for your business!", { align: "center" });

  doc.end();
};

// ==============================
// CREATE INVOICE
// ==============================
router.post("/", async (req, res) => {
  try {
    const { customerId, amount, notes, status, dueDate } = req.body;

    if (!customerId || !amount) {
      return res.status(400).json({ message: "Data missing" });
    }

    // ✅ AUTO INVOICE NUMBER GENERATE
    const count = await Invoice.countDocuments();
    const invoiceNumber = `INV-2026-${count + 1}`;

    const invoice = await Invoice.create({
      customerId,
      amount,
      notes,
      status,
      dueDate,
      invoiceNumber,
    });

    await invoice.populate("customerId");

    const flattened = {
      ...invoice.toObject(),
      name: invoice.customerId.name,
      phone: invoice.customerId.phone,
      email: invoice.customerId.email,
    };

    // AUTO EMAIL
    if (invoice.customerId.email) {

      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const bufferStream = new streamBuffers.WritableStreamBuffer();

      doc.pipe(bufferStream);
      generatePDFContent(doc, invoice, flattened);

      bufferStream.on("finish", async () => {

        const pdfBuffer = bufferStream.getContents();

        await transporter.sendMail({
          from: '"iPremium Care" <ipremiumindia@gmail.com>',
          to: invoice.customerId.email,
          subject: `Invoice ${invoice.invoiceNumber}`,
          text: "Hi, please find your attached invoice.",
          attachments: [
            {
              filename: `iPremium-Care-Invoice-${invoice.invoiceNumber}.pdf`,
              content: pdfBuffer,
            },
          ],
        });
      });
    }

    res.status(201).json(flattened);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==============================
// VIEW PDF
// ==============================
router.get("/view-pdf/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate("customerId");
    if (!invoice) return res.status(404).send("Not found");

    const flattened = { ...invoice.toObject(), ...invoice.customerId._doc };

    const doc = new PDFDocument({ size: "A4", margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=iPremium-Care-Invoice-${invoice.invoiceNumber}.pdf`
    );

    doc.pipe(res);
    generatePDFContent(doc, invoice, flattened);

  } catch (error) {
    res.status(500).send("PDF Error");
  }
});

// ==============================
// SEND EMAIL BUTTON
// ==============================
router.post("/send-email/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate("customerId");
    if (!invoice || !invoice.customerId.email) {
      return res.status(404).json({ message: "Customer email not found" });
    }

    const flattened = { ...invoice.toObject(), ...invoice.customerId._doc };

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const bufferStream = new streamBuffers.WritableStreamBuffer();

    doc.pipe(bufferStream);
    generatePDFContent(doc, invoice, flattened);

    bufferStream.on("finish", async () => {

      const pdfBuffer = bufferStream.getContents();

      await transporter.sendMail({
        from: '"iPremium Care" <ipremiumindia@gmail.com>',
        to: invoice.customerId.email,
        subject: `Invoice ${invoice.invoiceNumber}`,
        text: "Hi, please find your attached invoice.",
        attachments: [
          {
            filename: `iPremium-Care-Invoice-${invoice.invoiceNumber}.pdf`,
            content: pdfBuffer,
          },
        ],
      });

      res.status(200).json({ message: "Email sent successfully" });
    });

  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
