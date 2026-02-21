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
    pass: "mxwzukcfjefkucbv", // App password WITHOUT spaces
  },
});

// ==============================
// PDF GENERATOR FUNCTION
// ==============================
const generatePDFContent = (doc, invoice, flattened) => {

  // HEADER
  doc.fontSize(22).fillColor("#2c3e50")
     .text("iPremium Care", { align: "center" });

  doc.fontSize(10).fillColor("black")
     .text("Your Trusted Service Partner", { align: "center" });

  doc.moveDown();
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown();

  // INVOICE DETAILS (Right Side)
  doc.fontSize(12)
     .text(`Invoice No: ${invoice.invoiceNumber || invoice._id}`, { align: "right" });
  doc.text(`Date: ${new Date(invoice.createdAt).toDateString()}`, { align: "right" });

  doc.moveDown(2);

  // ==============================
  // FROM SECTION (PROFESSIONAL BOX)
  // ==============================
  const fromY = doc.y;

  doc.rect(50, fromY, 250, 120).stroke("#2c3e50");

  doc.fontSize(12).fillColor("#0d6efd")
     .text("FROM:", 60, fromY + 10);

  doc.fillColor("black").fontSize(11)
     .text("iPremium Care", 60)
     .moveDown(0.5)
     .text("iPremium India - HSR Layout")
     .text("114-115, 80 ft road, 27th Main Rd")
     .text("2nd Sector, HSR Layout")
     .text("Bengaluru, Karnataka - 560102")
     .moveDown(0.5)
     .text("GST: 29AAKFI8994H1ZH")
     .text("Phone: 8884417766")
     .text("Email: support@ipremiumindia.co.in");

  // ==============================
  // BILL TO SECTION
  // ==============================
  doc.rect(320, fromY, 230, 120).stroke("#2c3e50");

  doc.fillColor("#0d6efd").fontSize(12)
     .text("BILL TO:", 330, fromY + 10);

  doc.fillColor("black").fontSize(11)
     .text(`Name: ${flattened.name || "N/A"}`, 330)
     .text(`Phone: ${flattened.phone || "N/A"}`)
     .text(`Email: ${flattened.email || "N/A"}`);

  doc.moveDown(8);

  // ==============================
  // TOTAL AMOUNT BOX
  // ==============================
  doc.rect(50, doc.y, 500, 45)
     .fill("#f8f9fa")
     .stroke("#dee2e6");

  doc.fillColor("#198754")
     .fontSize(18)
     .text(`TOTAL AMOUNT: RS.${invoice.amount}`, 60, doc.y + 12);

  doc.moveDown(4);

  // FOOTER
  doc.fillColor("black")
     .fontSize(10)
     .text("Thank you for your business!", { align: "center" });

  doc.end();
};

// ==============================
// 1. CREATE INVOICE
// ==============================
router.post("/", async (req, res) => {
  try {
    const { customerId, amount, notes, status, dueDate } = req.body;

    if (!customerId || !amount) {
      return res.status(400).json({ message: "Data missing" });
    }

    const invoice = await Invoice.create({
      customerId,
      amount,
      notes,
      status,
      dueDate,
    });

    await invoice.populate("customerId");

    if (!invoice.customerId) {
      return res.status(400).json({ message: "Customer not found" });
    }

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
        try {
          const pdfBuffer = bufferStream.getContents();

          await transporter.sendMail({
            from: '"iPremium Care" <ipremiumindia@gmail.com>',
            to: invoice.customerId.email,
            subject: `Invoice Created: ${invoice.invoiceNumber || invoice._id}`,
            text: "Hi, please find your attached invoice.",
            attachments: [
              { filename: "Invoice.pdf", content: pdfBuffer },
            ],
          });

        } catch (err) {
          console.error("Mail Error:", err.message);
        }
      });
    }

    res.status(201).json(flattened);

  } catch (error) {
    console.error("CREATE INVOICE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

// ==============================
// 2. VIEW PDF
// ==============================
router.get("/view-pdf/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate("customerId");
    if (!invoice) return res.status(404).send("Not found");

    const flattened = { ...invoice.toObject(), ...invoice.customerId._doc };

    const doc = new PDFDocument({ size: "A4", margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    generatePDFContent(doc, invoice, flattened);

  } catch (error) {
    res.status(500).send("PDF Error");
  }
});

// ==============================
// 3. SEND EMAIL
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
      try {
        const pdfBuffer = bufferStream.getContents();

        await transporter.sendMail({
          from: '"iPremium Care" <ipremiumindia@gmail.com>',
          to: invoice.customerId.email,
          subject: `Invoice: ${invoice.invoiceNumber || invoice._id}`,
          text: "Hi, please find your attached invoice.",
          attachments: [
            { filename: "Invoice.pdf", content: pdfBuffer },
          ],
        });

        res.status(200).json({ message: "Email sent successfully" });

      } catch (mailErr) {
        res.status(500).json({ error: mailErr.message });
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ==============================
// 4. GET ALL
// ==============================
router.get("/", async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate("customerId")
      .sort({ createdAt: -1 });

    const flattened = invoices.map(inv => ({
      ...inv.toObject(),
      name: inv.customerId?.name,
      phone: inv.customerId?.phone,
      email: inv.customerId?.email,
    }));

    res.json(flattened);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==============================
// DELETE
// ==============================
router.delete("/:id", async (req, res) => {
  try {
    await Invoice.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
