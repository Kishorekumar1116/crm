
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

const generatePDFContent = (doc, invoice, flattened) => {
  doc.font("Helvetica");

  // =========================
  // TITLE
  // =========================
  doc.fontSize(24).font("Helvetica-Bold").text("INVOICE", {
    align: "center",
  });

  doc.moveDown(2);

  // =========================
  // HEADER BLOCK
  // =========================
  const startY = doc.y;
  const leftX = 50;
  const rightX = 350;

  // FROM (LEFT)
  doc.fontSize(11).font("Helvetica-Bold");
  doc.text("From", leftX, startY);

  doc.font("Helvetica");
  doc.text("iPremium India - HSR Layout", leftX);
  doc.text("114-115, 80 ft road, 27th Main Rd, 2nd Sector");
  doc.text("HSR Layout, Bengaluru, Karnataka - 560102");
  doc.text("Phone: 8884417766");
  doc.text("Email: support@ipremiumindia.co.in");
  doc.text("TAX ID: 29AAKFI8994H1ZH");

  const leftBottomY = doc.y;

  // INVOICE INFO (RIGHT) - DUE DATE REMOVED
  doc.font("Helvetica-Bold");
  doc.text(
    `Invoice # IPI ${invoice.invoiceNumber || invoice._id}`,
    rightX,
    startY
  );

  doc.text(
    `Total Amount: ₹ ${Number(invoice.amount).toFixed(2)}`,
    rightX
  );

  const rightBottomY = doc.y;

  doc.y = Math.max(leftBottomY, rightBottomY) + 30;

  // =========================
  // TO SECTION
  // =========================
  doc.font("Helvetica-Bold").text("To", 50);
  doc.font("Helvetica");

  doc.text(flattened.name || "");
  doc.text("Bengaluru, Karnataka");
  doc.text("India -");
  doc.text(`Phone: ${flattened.phone || ""}`);
  doc.text(`Email: ${flattened.email || ""}`);

  doc.moveDown(2);

  // =========================
  // TABLE
  // =========================
  const tableTop = doc.y;
  const itemX = 50;
  const priceX = 330;
  const qtyX = 410;
  const amountX = 470;

  doc.moveTo(itemX, tableTop - 5).lineTo(550, tableTop - 5).stroke();

  doc.font("Helvetica-Bold");
  doc.text("Description", itemX, tableTop);
  doc.text("Price", priceX, tableTop, { width: 60, align: "right" });
  doc.text("Qty", qtyX, tableTop, { width: 40, align: "right" });
  doc.text("Amount", amountX, tableTop, { width: 80, align: "right" });

  doc.moveTo(itemX, tableTop + 15).lineTo(550, tableTop + 15).stroke();
  doc.moveDown(1.5);

  // =========================
  // PRODUCT ROW (NO GST / NO SUBTOTAL)
  // =========================
  doc.font("Helvetica");

  const total = Number(invoice.amount);
  const qty = 1;

  const description = `${invoice.productName || ""} - ${invoice.issue || ""}\nSerial No: ${invoice.serialNo || ""}`;

  const rowTop = doc.y;

  doc.text(description, itemX, rowTop, { width: 260 });

  const descriptionHeight = doc.heightOfString(description, {
    width: 260,
  });

  doc.text(`₹ ${total.toFixed(2)}`, priceX, rowTop, {
    width: 60,
    align: "right",
  });

  doc.text(`${qty}`, qtyX, rowTop, {
    width: 40,
    align: "right",
  });

  doc.text(`₹ ${total.toFixed(2)}`, amountX, rowTop, {
    width: 80,
    align: "right",
  });

  doc.y = rowTop + descriptionHeight + 10;

  doc.moveTo(itemX, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(2);

  // =========================
  // TOTALS (ONLY TOTAL)
  // =========================
  doc.font("Helvetica-Bold");

  const totalsXLabel = 360;
  const totalsXAmount = 460;
  let totalsY = doc.y;
  const lineGap = 18;

  doc.text("Total Amount", totalsXLabel, totalsY);
  doc.text(`₹ ${total.toFixed(2)}`, totalsXAmount, totalsY, {
    width: 80,
    align: "right",
  });

  totalsY += lineGap;

  doc.text("Balance Due", totalsXLabel, totalsY);
  doc.text("₹ 0.00", totalsXAmount, totalsY, {
    width: 80,
    align: "right",
  });

  doc.y = totalsY + 25;

  // =========================
  // NOTES & TERMS (UNCHANGED BELOW)
  // =========================

  // =========================
// CUSTOMER NOTES
// =========================

if (invoice.notes) {

  if (doc.y > 650) {
    doc.addPage();
  }

  doc.moveDown(1.5);

  const notesWidth = 420;
  const notesX = (doc.page.width - notesWidth) / 2;

  doc.fontSize(12)
     .font("Helvetica-Bold")
     .text("Additional Notes", notesX, doc.y, {
       width: notesWidth,
       align: "left"
     });

  doc.moveDown(0.5);

  doc.fontSize(10)
     .font("Helvetica")
     .text(invoice.notes, notesX, doc.y, {
       width: notesWidth,
       align: "left",
       lineGap: 4
     });

  doc.moveDown(1.5);
}
// =========================
// TERMS & CONDITIONS (PERFECT CENTER MATCH)
// =========================

if (doc.y > 680) {
  doc.addPage();
}

doc.moveDown(1.5);

const termsWidth = 420;
const centerX = (doc.page.width - termsWidth) / 2;

// Header aligned to same centered block
doc.fontSize(12)
   .font("Helvetica-Bold")
   .text("TERMS & CONDITIONS", centerX, doc.y, {
     width: termsWidth,
     align: "center"
   });

doc.moveDown(0.8);

doc.fontSize(9).font("Helvetica");

// Divider line aligned with block
doc.moveTo(centerX, doc.y - 5)
   .lineTo(centerX + termsWidth, doc.y - 5)
   .stroke();

// Terms Content
const termsText = `
1. Payment: Full payment is required upon delivery. No credit period is provided.
2. Returns and Refunds: All sales are final. Goods once sold cannot be returned or refunded.
3. Diagnostic Charges: Fees apply if the service quotation is not approved. These fees will be deducted if the customer approves the repair within 30 days.
4. Warranty Exclusions: Damage from physical impact, pressure, power fluctuations, liquid exposure, or accidents is not covered.
5. Warranty Conditions:
a. Warranty covers only parts replaced by us.
b. Warranty is void for partial repairs, unreplaced faulty components, or third-party diagnostics/repairs.
6. Device Collection: Collect repaired devices within 3 months to avoid maintenance and handling charges.
7. Jurisdiction: Disputes are subject to Bengaluru jurisdiction only.
`;

doc.text(termsText.trim(), centerX, doc.y, {
  width: termsWidth,
  align: "left",
  lineGap: 2
});

  doc.moveDown(2);
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
