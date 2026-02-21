const router = require("express").Router();
const Invoice = require("../models/Invoice");
const Customer = require("../models/Customer");
const PDFDocument = require("pdfkit");
const nodemailer = require("nodemailer");
const streamBuffers = require("stream-buffers");

// COMMON EMAIL CONFIG (Orey edathula maintain pannalam)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ipremiumindia@gmail.com",
    pass: "mxwz ukcf jefk ucbv", // Unga 16-digit App Password
  },
});

// Helper function to create PDF content
const generatePDFContent = (doc, invoice, flattened) => {
  doc.fontSize(22).fillColor("#2c3e50").text("iPremium Care", { align: "center" });
  doc.fontSize(10).fillColor("black").text("Your Trusted Service Partner", { align: "center" });
  doc.moveDown();
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown();

  doc.fontSize(12).text(`Invoice No: ${invoice.invoiceNumber || invoice._id}`, { align: "right" });
  doc.text(`Date: ${new Date(invoice.createdAt).toDateString()}`, { align: "right" });
  doc.moveDown();

  // FROM & BILL TO Section
  doc.fontSize(12).fillColor("blue").text("FROM:", { underline: true });
  doc.fillColor("black").text("iPremium Care ");
  doc.text("iPremium India - HSR Layout
114-115, 80 ft road, 27th Main Rd, 2nd Sector, HSR Layout Bengaluru, Karnataka
India - 560102");
  doc.text("GST: 29AAKFI8994H1ZH");
  doc.text("Phone: 8884417766");
  doc.text("Email: support@ipremiumindia.co.in");
  doc.moveDown();

  doc.fillColor("blue").text("BILL TO:", { underline: true });
  doc.fillColor("black").text(`Name: ${flattened.name || "N/A"}`);
  if (flattened.phone) doc.text(`Phone: ${flattened.phone}`);
  if (flattened.email) doc.text(`Email: ${flattened.email}`);
  doc.moveDown();

  // Amount Box
  doc.rect(50, doc.y, 500, 40).fill("#f8f9fa").stroke("#dee2e6");
  doc.fillColor("#198754").fontSize(16).text(`TOTAL AMOUNT: RS.${invoice.amount}`, 60, doc.y + 12);
  
  doc.moveDown(4);
  doc.fillColor("black").fontSize(10).text("Thank you for your business!", { align: "center" });
  doc.end();
};

// ==========================
// 1. CREATE INVOICE
// ==========================
router.post("/", async (req, res) => {
  try {
    const { customerId, amount, notes, status, dueDate } = req.body;
    console.log("REQ BODY:", req.body);   // 👈 add this

    if (!customerId || !amount) return res.status(400).json({ message: "Data missing" });

    const invoice = await Invoice.create({ customerId, amount, notes, status, dueDate });
    await invoice.populate("customerId");

    if (!invoice.customerId) {
      return res.status(400).json({ message: "Customer not found" });
    }
    
    const flattened = {
      ...invoice.toObject(),
      name: invoice.customerId.name,
      phone: invoice.customerId.phone,
      email: invoice.customerId.email
    };

    // Auto Email in Background (optional)
    if (invoice.customerId.email) {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const writableStreamBuffer = new streamBuffers.WritableStreamBuffer();
      doc.pipe(writableStreamBuffer);
      generatePDFContent(doc, invoice, flattened);

      writableStreamBuffer.on('finish', async () => {
        try {
          const pdfBuffer = writableStreamBuffer.getContents();
          await transporter.sendMail({
            from: '"iPremium Care" <ipremiumindia@gmail.com>',
            to: invoice.customerId.email,
            subject: `Invoice Created: ${invoice.invoiceNumber || invoice._id}`,
            attachments: [{ filename: `Invoice.pdf`, content: pdfBuffer }]
          });
        }
         catch (e) { console.error("Auto-mail error:", e.message); }
      });
    }

    res.status(201).json(flattened);
  } catch (error) {
    console.error("CREATE INVOICE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

// ==========================
// 2. VIEW PDF
// ==========================
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

// ==========================
// 3. SEND EMAIL (Button Click)
// ==========================
router.post("/send-email/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate("customerId");
    if (!invoice || !invoice.customerId.email) {
      return res.status(404).json({ message: "Customer email not found" });
    }

    const flattened = { ...invoice.toObject(), ...invoice.customerId._doc };
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const writableStreamBuffer = new streamBuffers.WritableStreamBuffer();
    
    doc.pipe(writableStreamBuffer);
    generatePDFContent(doc, invoice, flattened);

    // Intha logic-ah 'await' panna promise use pannuvom
    writableStreamBuffer.on('finish', async () => {
      const pdfBuffer = writableStreamBuffer.getContents();
      
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "ipremiumindia@gmail.com", // Double check this email
          pass: "mxwz ukcf jefk ucbv" // Use your actual 16-digit code WITHOUT spaces
        }
      });

      const mailOptions = {
        from: '"iPremium Care" <ipremiumindia@gmail.com>',
        to: invoice.customerId.email,
        subject: `Invoice: ${invoice.invoiceNumber || invoice._id}`,
        text: "Hi, please find your attached invoice.",
        attachments: [{ filename: `Invoice.pdf`, content: pdfBuffer }]
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log("Email Sent Successfully");
        return res.status(200).json({ message: "Email sent successfully" });
      } catch (mailErr) {
        console.error("Mail Error:", mailErr);
        // Ippo terminal-la check pannunga, Auth error-nu vantha password thappu
        return res.status(500).json({ error: mailErr.message });
      }
    });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ==========================
// 4. GET ALL & DELETE
// ==========================
router.get("/", async (req, res) => {
  try {
    const invoices = await Invoice.find().populate("customerId").sort({ createdAt: -1 });
    const flattened = invoices.map(inv => ({
      ...inv.toObject(),
      name: inv.customerId?.name,
      phone: inv.customerId?.phone,
      email: inv.customerId?.email
    }));
    res.json(flattened);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Invoice.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
