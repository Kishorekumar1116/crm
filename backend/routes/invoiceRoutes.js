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
// PDF GENERATOR FUNCTION
// ==============================
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

  doc.font("Helvetica-Bold");
  doc.text(`Invoice # IPI ${invoice.invoiceNumber || invoice._id}`, rightX, startY);
  doc.text(
    `Due Date: ${
      invoice.dueDate
        ? new Date(invoice.dueDate).toLocaleDateString("en-GB")
        : "-"
    }`,
    rightX
  );
  doc.text(`Total Amount: ₹ ${Number(invoice.amount).toFixed(2)}`, rightX);

  const rightBottomY = doc.y;
  doc.y = Math.max(leftBottomY, rightBottomY) + 30;

  // =========================
  // TO SECTION
  // =========================
  doc.font("Helvetica-Bold").text("To", 50);
  doc.font("Helvetica");

  doc.text(flattened.name || "");
  doc.text("Bengaluru, Karnataka");
  doc.text("India");
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
  // PRODUCT ROW (NO GST)
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
  // TOTAL SECTION (ONLY TOTAL)
  // =========================
  doc.font("Helvetica-Bold");

  const totalsXLabel = 360;
  const totalsXAmount = 460;
  let totalsY = doc.y;

  doc.text("Total Amount", totalsXLabel, totalsY);
  doc.text(`₹ ${total.toFixed(2)}`, totalsXAmount, totalsY, {
    width: 80,
    align: "right",
  });

  totalsY += 18;

  doc.text("Balance Due", totalsXLabel, totalsY);
  doc.text("₹ 0.00", totalsXAmount, totalsY, {
    width: 80,
    align: "right",
  });

  doc.y = totalsY + 25;

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
  // TERMS & CONDITIONS
  // =========================
  if (doc.y > 680) {
    doc.addPage();
  }

  doc.moveDown(1.5);

  const termsWidth = 420;
  const centerX = (doc.page.width - termsWidth) / 2;

  doc.fontSize(12)
     .font("Helvetica-Bold")
     .text("TERMS & CONDITIONS", centerX, doc.y, {
       width: termsWidth,
       align: "center"
     });

  doc.moveDown(0.8);

  doc.fontSize(9).font("Helvetica");

  doc.moveTo(centerX, doc.y - 5)
     .lineTo(centerX + termsWidth, doc.y - 5)
     .stroke();

  const termsText = `
1. Full payment is required upon delivery of the repaired device.
2. All sales are final. No refunds will be issued.
3. Warranty does not cover physical or water damage.
4. Devices must be collected within 90 days.
5. Jurisdiction: Bengaluru, Karnataka.
`;

  doc.text(termsText.trim(), centerX, doc.y, {
    width: termsWidth,
    align: "left",
    lineGap: 4
  });

  doc.moveDown(2);

  // =========================
  // FOOTER
  // =========================
  doc.fontSize(10)
     .font("Helvetica-Oblique")
     .text("Thank you for your business!", {
       align: "center",
     });

  doc.end();
};

module.exports = router;
