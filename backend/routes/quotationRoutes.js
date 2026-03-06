// routes/quotations.js
const router = require("express").Router();
const Quotation = require("../models/Quotation");
const Customer = require("../models/Customer");
const PDFDocument = require("pdfkit");
const nodemailer = require("nodemailer");
const streamBuffers = require("stream-buffers");
const path = require("path");
const mongoose = require("mongoose");

// ==============================
// EMAIL CONFIG
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
const generatePDFContent = (doc, quotation, flattened) => {
  doc.font("Helvetica");

  // LOGO + TITLE
  const logoPath = path.join(__dirname, "../assets/logo.jpeg");
  doc.image(logoPath, doc.page.width / 2 - 60, 40, { width: 120 });
  doc.moveDown(3);

  doc.fontSize(15).font("Helvetica-Bold").text("QUOTATION", { align: "center" });
  doc.moveDown(2);

  // TO SECTION
  doc.font("Helvetica-Bold").text("To", 50);
  doc.font("Helvetica");
  doc.text(flattened.name || "");
  doc.text(flattened.company || "");
  doc.text(`${flattened.city || ""}, ${flattened.state || ""}`);
  if (flattened.gst && flattened.gst.trim() !== "") doc.text(`GST No: ${flattened.gst}`);
  doc.text(`Phone: ${flattened.phone || ""}`);
  doc.text(`Email: ${flattened.email || ""}`);
  doc.moveDown(2);

  // TABLE HEADER
  const tableTop = doc.y;
  const itemX = 50, priceX = 330, qtyX = 410, amountX = 470;

  doc.moveTo(itemX, tableTop - 5).lineTo(550, tableTop - 5).stroke();
  doc.font("Helvetica-Bold");
  doc.text("Description", itemX, tableTop);
  doc.text("Price", priceX, tableTop, { width: 60, align: "right" });
  doc.text("Qty", qtyX, tableTop, { width: 40, align: "right" });
  doc.text("Amount", amountX, tableTop, { width: 80, align: "right" });
  doc.moveTo(itemX, tableTop + 15).lineTo(550, tableTop + 15).stroke();
  doc.moveDown(1.5);

  // TABLE ROWS
  doc.font("Helvetica");
  const price = Number(quotation.amount || 0);
  const qty = 1;
  const total = price * qty;
  const description = `${quotation.productName || ""} - ${quotation.issue || ""}\nModel: ${quotation.model || ""} | Serial: ${quotation.serialNo || ""}`;
  const rowTop = doc.y;
  doc.text(description, itemX, rowTop, { width: 260 });
  const descriptionHeight = doc.heightOfString(description, { width: 260 });
  doc.text(price.toFixed(2), priceX, rowTop, { width: 60, align: "right" });
  doc.text(qty, qtyX, rowTop, { width: 40, align: "right" });
  doc.text(total.toFixed(2), amountX, rowTop, { width: 80, align: "right" });
  doc.y = rowTop + descriptionHeight + 10;
  doc.moveTo(itemX, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(1);

  // TOTAL AMOUNT
  doc.font("Helvetica-Bold");
  doc.text("Total Amount", 360, doc.y);
  doc.text(total.toFixed(2), 460, doc.y, { width: 80, align: "right" });
  doc.moveDown(2);

  // NOTES
  if (quotation.notes) {
    doc.font("Helvetica-Bold").text("Additional Notes", 50);
    doc.font("Helvetica").text(quotation.notes, { lineGap: 4 });
  }

  // doc.end() will be called outside this function
};

// ==========================
// CREATE QUOTATION
// ==========================
router.post("/", async (req, res) => {
  try {
    const { customerId, amount, notes, status, productName, model, serialNo, issue } = req.body;
    if (!customerId || !amount) return res.status(400).json({ message: "Customer and Amount required" });

    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    const quotation = await Quotation.create({ customerId, amount, notes, status, productName, model, serialNo, issue });
    await quotation.populate("customerId");

    const flattened = { ...quotation.toObject(), ...customer._doc };

    // SEND EMAIL IF CUSTOMER EMAIL EXISTS
    if (customer.email) {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const bufferStream = new streamBuffers.WritableStreamBuffer();
      doc.pipe(bufferStream);
      generatePDFContent(doc, quotation, flattened);
      doc.end(); // END AFTER CONTENT GENERATION

      bufferStream.on("finish", async () => {
        try {
          const pdfBuffer = bufferStream.getContents();
          await transporter.sendMail({
            from: '"iPremium Care" <ipremiumindia@gmail.com>',
            to: customer.email,
            subject: `Quotation Created`,
            text: "Please find attached quotation.",
            attachments: [{ filename: "Quotation.pdf", content: pdfBuffer }],
          });
        } catch (err) {
          console.error("Email error:", err.message);
        }
      });
    }

    res.status(201).json(flattened);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================
// VIEW QUOTATION PDF (IMPORTANT: PUT BEFORE /:id)
// ==========================
router.get("/view-pdf/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).send("Invalid Quotation ID");

    const quotation = await Quotation.findById(req.params.id).populate("customerId");
    if (!quotation) return res.status(404).send("Quotation not found");

    const flattened = { ...quotation.toObject(), ...quotation.customerId?._doc };

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="Quotation-${quotation._id}.pdf"`);

    doc.pipe(res);
    generatePDFContent(doc, quotation, flattened);
    doc.end(); // END AFTER PIPE
  } catch (err) {
    res.status(500).send("PDF generation error");
  }
});

// ==========================
// SEND QUOTATION PDF VIA EMAIL
// ==========================
router.post("/send-email/:id", async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id).populate("customerId");
    if (!quotation || !quotation.customerId?.email) return res.status(404).json({ message: "Customer email not found" });

    const flattened = { ...quotation.toObject(), ...quotation.customerId._doc };

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const bufferStream = new streamBuffers.WritableStreamBuffer();

    doc.pipe(bufferStream);
    generatePDFContent(doc, quotation, flattened);
    doc.end(); // END AFTER CONTENT

    bufferStream.on("finish", async () => {
      try {
        const pdfBuffer = bufferStream.getContents();
        await transporter.sendMail({
          from: '"iPremium Care" <ipremiumindia@gmail.com>',
          to: quotation.customerId.email,
          subject: `Quotation: ${quotation._id}`,
          text: "Please find attached quotation.",
          attachments: [{ filename: "Quotation.pdf", content: pdfBuffer }],
        });
        res.json({ message: "Email sent successfully" });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================
// GET ALL QUOTATIONS
// ==========================
router.get("/", async (req, res) => {
  try {
    const quotations = await Quotation.find().populate("customerId").sort({ createdAt: -1 });
    const flattened = quotations.map(q => ({ ...q.toObject(), ...q.customerId?._doc }));
    res.json(flattened);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================
// GET SINGLE QUOTATION
// ==========================
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).send("Invalid Quotation ID");

    const quotation = await Quotation.findById(req.params.id).populate("customerId");
    if (!quotation) return res.status(404).json({ message: "Quotation not found" });

    const flattened = { ...quotation.toObject(), ...quotation.customerId?._doc };
    res.json(flattened);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================
// UPDATE QUOTATION
// ==========================
router.put("/:id", async (req, res) => {
  try {
    const updated = await Quotation.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate("customerId");
    if (!updated) return res.status(404).json({ message: "Quotation not found" });
    const flattened = { ...updated.toObject(), ...updated.customerId?._doc };
    res.json(flattened);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================
// DELETE QUOTATION
// ==========================
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Quotation.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Quotation not found" });
    res.json({ message: "Quotation deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
