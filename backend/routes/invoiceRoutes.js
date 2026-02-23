
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
  doc.font("Helvetica");

  // =========================
  // TITLE
  // =========================
  doc.fontSize(26).text("Invoice", { align: "center" });
  doc.moveDown(1.5);

  // =========================
  // FROM
  // =========================
  doc.fontSize(11).font("Helvetica-Bold").text("From");
  doc.font("Helvetica");

  doc.text("iPremium India - HSR Layout");
  doc.text("114-115, 80 ft road, 27th Main Rd, 2nd Sector, HSR Layout");
  doc.text("Bengaluru, Karnataka");
  doc.text("India - 560102");
  doc.text("Phone: 8884417766");
  doc.text("Email: support@ipremiumindia.co.in");
  doc.text("TAX ID : 29AAKFI8994H1ZH");

  doc.moveDown();

  // =========================
  // TO
  // =========================
  doc.font("Helvetica-Bold").text("To");
  doc.font("Helvetica");

  doc.text(flattened.name || "");
  doc.text("Bengaluru, Karnataka");
  doc.text("India -");
  doc.text(`Phone: ${flattened.phone || ""}`);
  doc.text(`Email: ${flattened.email || ""}`);

  doc.moveDown(1.5);

  // =========================
  // RIGHT SIDE INFO
  // =========================
  const rightX = 350;
  doc.font("Helvetica-Bold");

  doc.text(`Invoice # IPI ${invoice.invoiceNumber || invoice._id}`, rightX, 120);
  doc.text(
    `Due Date: ${
      invoice.dueDate
        ? new Date(invoice.dueDate).toLocaleDateString("en-GB")
        : "-"
    }`,
    rightX
  );
  doc.text(`Total Amount ₹ ${Number(invoice.amount).toFixed(2)}`, rightX);

  doc.moveDown(2);

  // =========================
  // TABLE HEADER
  // =========================
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(0.5);

  doc.font("Helvetica-Bold");
  doc.text("Products Description", 50);
  doc.text("Price", 320);
  doc.text("Qty", 400);
  doc.text("Amount", 460);

  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown();

  // =========================
  // PRODUCT ROW
  // =========================
  doc.font("Helvetica");

  const total = Number(invoice.amount);
  const gstRate = 0.18;
  const subTotal = total / (1 + gstRate);
  const tax = total - subTotal;
  const qty = 1;

  const currentY = doc.y;

  doc.text(
    `${invoice.productName || ""} - ${invoice.issue || ""}\nserial no : ${invoice.serialNo || ""}`,
    50
  );

  doc.text(`₹ ${subTotal.toFixed(2)}`, 320, currentY);
  doc.text(`${qty}`, 400, currentY);
  doc.text(`₹ ${total.toFixed(2)}`, 460, currentY);

  doc.moveDown(2);

  // =========================
  // TOTALS
  // =========================
  doc.font("Helvetica-Bold");

  doc.text(`SubTotal ₹ ${subTotal.toFixed(2)}`, 350);
  doc.text(`Total Tax (18%) ₹ ${tax.toFixed(2)}`, 350);
  doc.text(`Total Amount ₹ ${total.toFixed(2)}`, 350);
  doc.text(`Balance Due ₹ 0.00`, 350);

  doc.moveDown(1.5);

  // =========================
  // NOTES
  // =========================
  if (invoice.notes) {
    doc.font("Helvetica-Bold").text("Note:");
    doc.font("Helvetica").text(invoice.notes);
    doc.moveDown();
  }

  // =========================
  // TERMS PAGE
  // =========================
  doc.addPage();

  doc.fontSize(14).font("Helvetica-Bold")
     .text("PAYMENT & WARRANTY");

  doc.moveDown();
  doc.fontSize(10).font("Helvetica");

  const terms = [
    "1. Payment: Full payment is required upon delivery.",
    "2. Returns and Refunds: All sales are final.",
    "3. Diagnostic Charges apply if quotation is not approved.",
    "4. Warranty Exclusions: Physical damage, liquid exposure not covered.",
    "5. Warranty applies only to replaced parts.",
    "6. Collect repaired devices within 3 months.",
    "7. Jurisdiction: Bengaluru only."
  ];

  terms.forEach(line => {
    doc.text(line, { width: 500 });
    doc.moveDown(0.5);
  });

  doc.moveDown(2);

  // =========================
  // FOOTER (CORRECT POSITION)
  // =========================
  doc.fontSize(10)
     .font("Helvetica-Oblique")
     .text("Thank you for your business!", { align: "center" });

  // ✅ END ONLY ONCE
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
