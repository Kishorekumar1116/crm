// routes/quotations.js
const router = require("express").Router();
const Quotation = require("../models/Quotation");
const Customer = require("../models/Customer");
const PDFDocument = require("pdfkit");
const nodemailer = require("nodemailer");
const streamBuffers = require("stream-buffers");
const path = require("path");

// ==============================
// EMAIL CONFIG
// ==============================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ipremiumindia@gmail.com",
    pass: "mxwzukcfjefkucbv", // app password
  },
});

// ==============================
// PDF GENERATOR
// ==============================
const generatePDF = (doc, quotation, flattened) => {
  doc.font("Helvetica");

  // LOGO
  const logoPath = path.join(__dirname, "../assets/logo.jpeg");
  doc.image(logoPath, doc.page.width / 2 - 60, 40, { width: 120 });
  doc.moveDown(3);

  // TITLE
  doc.fontSize(15).font("Helvetica-Bold").text("QUOTATION", { align: "center" });
  doc.moveDown(2);

  // -------------------------
  // FROM (Company)
  // -------------------------
  doc.fontSize(11).font("Helvetica-Bold").text("From", 50);
  const company = flattened.company;
  doc.font("Helvetica")
     .text(company.name, 50)
     .text(company.address1, 50)
     .text(`${company.city}, ${company.state} - ${company.pincode}`, 50)
     .text(`Phone: ${company.phone}`, 50)
     .text(`Email: ${company.email}`, 50)
     .text(`GST: ${company.gst}`, 50);

  const leftBottomY = doc.y;

  // -------------------------
  // TO (Customer)
  // -------------------------
  doc.font("Helvetica-Bold").text("To", 350, 150);
  const customer = flattened.customer;
  doc.font("Helvetica")
     .text(customer.name || "", 350)
     .text(customer.company || "", 350)
     .text(customer.address1 || "", 350)
     .text(`${customer.city || ""}, ${customer.state || ""} - ${customer.pincode || ""}`, 350)
     .text(`Phone: ${customer.phone || ""}`, 350)
     .text(`Email: ${customer.email || ""}`, 350)
     .text(`GST: ${customer.gst || ""}`, 350);

  doc.moveDown(2);

  // -------------------------
  // ITEM TABLE
  // -------------------------
  const itemX = 50;
  const priceX = 330;
  const qtyX = 410;
  const amountX = 470;
  const tableTop = doc.y;

  doc.moveTo(itemX, tableTop - 5).lineTo(550, tableTop - 5).stroke();

  doc.font("Helvetica-Bold");
  doc.text("Description", itemX, tableTop);
  doc.text("Price", priceX, tableTop, { width: 60, align: "right" });
  doc.text("Qty", qtyX, tableTop, { width: 40, align: "right" });
  doc.text("Amount", amountX, tableTop, { width: 80, align: "right" });

  doc.moveTo(itemX, tableTop + 15).lineTo(550, tableTop + 15).stroke();
  doc.moveDown(1.5);

  doc.font("Helvetica");
  let grandTotal = 0;

  (quotation.serviceItems || []).forEach(item => {
    const rowTop = doc.y;
    const price = Number(item.amount);
    const qty = 1;
    const amount = price * qty;
    grandTotal += amount;

    const description = `${item.productName || ""} - ${item.issue || ""}\nModel: ${item.model || ""} | Serial: ${item.serialNo || ""}`;
    doc.text(description, itemX, rowTop, { width: 260 });
    const descHeight = doc.heightOfString(description, { width: 260 });

    doc.text(price.toFixed(2), priceX, rowTop, { width: 60, align: "right" });
    doc.text(qty, qtyX, rowTop, { width: 40, align: "right" });
    doc.text(amount.toFixed(2), amountX, rowTop, { width: 80, align: "right" });

    doc.y = rowTop + descHeight + 10;
    doc.moveTo(itemX, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);
  });

  // -------------------------
  // TOTAL
  // -------------------------
  doc.font("Helvetica-Bold");
  const totalsXLabel = 360;
  const totalsXAmount = 460;
  let totalsY = doc.y;
  doc.text("Total Amount", totalsXLabel, totalsY);
  doc.text(grandTotal.toFixed(2), totalsXAmount, totalsY, { width: 80, align: "right" });
  totalsY += 20;

  doc.moveDown(2);

  // -------------------------
  // NOTES
  // -------------------------
  if (quotation.notes) {
    doc.font("Helvetica-Bold").text("Additional Notes", 50);
    doc.moveDown(0.5);
    doc.font("Helvetica").text(quotation.notes, { width: 500, lineGap: 4 });
    doc.moveDown(1.5);
  }

  doc.end();
};

// ==========================
// CREATE QUOTATION + EMAIL PDF
// ==========================
router.post("/", async (req, res) => {
  try {
    const { customerId, serviceItems, amount, notes, status } = req.body;
    if (!customerId || !amount) return res.status(400).json({ message: "Data missing" });

    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    const quotation = await Quotation.create({ customerId, serviceItems, amount, notes, status });

    await quotation.populate("customerId");

    const flattened = {
      ...quotation.toObject(),
      customer: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        company: customer.company || "",
        gst: customer.gst || "",
        address1: customer.address1 || "",
        address2: customer.address2 || "",
        city: customer.city || "",
        state: customer.state || "",
        pincode: customer.pincode || "",
        country: customer.country || "",
      },
      company: {
        name: "iPremium India - HSR Layout",
        address1: "114-115, 80 ft road, 27th Main Rd, 2nd Sector",
        area: "HSR Layout",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560102",
        country: "India",
        phone: "8884417766",
        email: "support@ipremiumindia.co.in",
        gst: "29AAKFI8994H1ZH",
      },
    };

    // SEND PDF EMAIL
    if (customer.email) {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const bufferStream = new streamBuffers.WritableStreamBuffer();
      doc.pipe(bufferStream);
      generatePDF(doc, quotation, flattened);

      bufferStream.on("finish", async () => {
        try {
          const pdfBuffer = bufferStream.getContents();
          await transporter.sendMail({
            from: '"iPremium Care" <ipremiumindia@gmail.com>',
            to: customer.email,
            subject: `Quotation Created: ${quotation._id}`,
            text: "Hi, please find your attached quotation.",
            attachments: [{ filename: "Quotation.pdf", content: pdfBuffer }],
          });
        } catch (err) {
          console.error("Mail Error:", err.message);
        }
      });
    }

    res.status(201).json(flattened);
  } catch (err) {
    console.error("CREATE QUOTATION ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// ==========================
// GET ALL QUOTATIONS
// ==========================
router.get("/", async (req, res) => {
  try {
    const quotations = await Quotation.find().populate("customerId").sort({ createdAt: -1 });
    const response = quotations.map(q => ({
      ...q.toObject(),
      customer: {
        name: q.customerId?.name || "",
        phone: q.customerId?.phone || "",
        email: q.customerId?.email || "",
        company: q.customerId?.company || "",
        gst: q.customerId?.gst || "",
        address1: q.customerId?.address1 || "",
        address2: q.customerId?.address2 || "",
        city: q.customerId?.city || "",
        state: q.customerId?.state || "",
        pincode: q.customerId?.pincode || "",
        country: q.customerId?.country || "",
      },
      company: {
        name: "iPremium India - HSR Layout",
        address1: "114-115, 80 ft road, 27th Main Rd, 2nd Sector",
        area: "HSR Layout",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560102",
        country: "India",
        phone: "8884417766",
        email: "support@ipremiumindia.co.in",
        gst: "29AAKFI8994H1ZH",
      },
    }));
    res.json(response);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================
// GET SINGLE QUOTATION
// ==========================
router.get("/:id", async (req, res) => {
  try {
    const q = await Quotation.findById(req.params.id).populate("customerId");
    if (!q) return res.status(404).json({ message: "Quotation not found" });

    const response = {
      ...q.toObject(),
      customer: {
        name: q.customerId?.name || "",
        phone: q.customerId?.phone || "",
        email: q.customerId?.email || "",
        company: q.customerId?.company || "",
        gst: q.customerId?.gst || "",
        address1: q.customerId?.address1 || "",
        address2: q.customerId?.address2 || "",
        city: q.customerId?.city || "",
        state: q.customerId?.state || "",
        pincode: q.customerId?.pincode || "",
        country: q.customerId?.country || "",
      },
      company: {
        name: "iPremium India - HSR Layout",
        address1: "114-115, 80 ft road, 27th Main Rd, 2nd Sector",
        area: "HSR Layout",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560102",
        country: "India",
        phone: "8884417766",
        email: "support@ipremiumindia.co.in",
        gst: "29AAKFI8994H1ZH",
      },
    };

    res.json(response);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================
// UPDATE
// ==========================
router.put("/:id", async (req, res) => {
  try {
    const updated = await Quotation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: "Quotation updated successfully", updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================
// DELETE
// ==========================
router.delete("/:id", async (req, res) => {
  try {
    await Quotation.findByIdAndDelete(req.params.id);
    res.json({ message: "Quotation deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
