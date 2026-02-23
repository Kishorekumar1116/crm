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

  // INVOICE DETAILS
  doc.fontSize(12)
     .text(`Invoice No: ${invoice.invoiceNumber || invoice._id}`, { align: "right" });
  doc.text(`Date: ${new Date(invoice.createdAt).toDateString()}`, { align: "right" });

  doc.moveDown(2);

  // FROM
  const fromY = doc.y;

  doc.rect(50, fromY, 250, 120).stroke("#2c3e50");

  doc.fontSize(12).fillColor("#0d6efd")
     .text("FROM:", 60, fromY + 10);

  doc.fillColor("black").fontSize(11)
     .text("iPremium Care", 60)
     .moveDown(0.5)
     .text("iPremium India - HSR Layout")
     .text("114-115, 80 ft road, 27th Main Rd, HSR Layout")
     .text("Bengaluru, Karnataka - 560102")
     .text("GST: 29AAKFI8994H1ZH")
     .text("Phone: 8884417766")
     .text("Email: support@ipremiumindia.co.in");

  // BILL TO
  doc.rect(320, fromY, 230, 120).stroke("#2c3e50");

  doc.fillColor("#0d6efd").fontSize(12)
     .text("BILL TO:", 330, fromY + 10);

  doc.fillColor("black").fontSize(11)
     .text(`Name: ${flattened.name || "N/A"}`, 330)
     .text(`Phone: ${flattened.phone || "N/A"}`)
     .text(`Email: ${flattened.email || "N/A"}`);

  doc.moveDown(8);

  // PRODUCT DETAILS
  doc.fontSize(12).fillColor("black")
     .text("Product Details", { underline: true });

  doc.moveDown(0.5);
  doc.fontSize(11)
     .text(`Product: ${invoice.productName || "-"}`)
     .text(`Brand: ${invoice.brand || "-"}`)
     .text(`Model: ${invoice.model || "-"}`)
     .text(`Serial No: ${invoice.serialNo || "-"}`)
     .text(`Issue: ${invoice.issue || "-"}`);

  doc.moveDown(2);

  // TOTAL AMOUNT
  doc.rect(50, doc.y, 500, 45)
     .fill("#f8f9fa")
     .stroke("#dee2e6");

  doc.fillColor("#198754")
     .fontSize(18)
     .text(`TOTAL AMOUNT: RS.${invoice.amount}`, 60, doc.y + 12);

  doc.moveDown(3);

  // ==============================
  // 🔥 TERMS & CONDITIONS (NEW)
  // ==============================

  // If space is less, move to new page
  if (doc.y > 650) {
    doc.addPage();
  }

  doc.moveDown();
  doc.fontSize(12).fillColor("#0d6efd")
     .text("Terms & Conditions", { underline: true });

  doc.moveDown(0.5);
  doc.fillColor("black").fontSize(9);

  doc.text("1. Payment: Full payment is required upon delivery. No credit period is provided.");
  doc.text("2. Returns and Refunds: All sales are final. Goods once sold cannot be returned or refunded.");
  doc.text("3. Diagnostic Charges: Fees apply if the service quotation is not approved. These fees will be deducted if the customer approves the repair within 30 days.");
  doc.text("4. Warranty Exclusions: Damage from physical impact, pressure, power fluctuations, liquid exposure, or accidents is not covered.");
  doc.text("5. Warranty Conditions:");
  doc.text("   a. Warranty covers only parts replaced by us.");
  doc.text("   b. Warranty is void for partial repairs, unreplaced faulty components, or third-party diagnostics/repairs.");
  doc.text("6. Device Collection: Collect repaired devices within 3 months to avoid maintenance and handling charges.");
  doc.text("7. Jurisdiction: Disputes are subject to Bengaluru jurisdiction only.");

  doc.moveDown(2);

  // FOOTER
  doc.fontSize(10)
     .text("Thank you for your business!", { align: "center" });

  doc.end();
};

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

    // 🔥 Fetch customer details
    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // 🔥 Create invoice WITH product snapshot
    const invoice = await Invoice.create({
      customerId,
      amount,
      notes,
      status,
      dueDate,

      // 👇 Product snapshot stored permanently
      productName: customer.productName,
      brand: customer.brand,
      model: customer.model,
      serialNo: customer.serialNo,
      issue: customer.issue,
    });

    await invoice.populate("customerId");

    const flattened = {
      ...invoice.toObject(),
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
    };

    // ==============================
    // AUTO EMAIL (UNCHANGED)
    // ==============================
    if (customer.email) {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const bufferStream = new streamBuffers.WritableStreamBuffer();

      doc.pipe(bufferStream);
      generatePDFContent(doc, invoice, flattened);

      bufferStream.on("finish", async () => {
        try {
          const pdfBuffer = bufferStream.getContents();

          await transporter.sendMail({
            from: '"iPremium Care" <ipremiumindia@gmail.com>',
            to: customer.email,
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
