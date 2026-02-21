// models/Quotation.js
const mongoose = require("mongoose");

const quotationSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },

  // Quotation details
  amount: { type: Number, required: true },
  notes: { type: String },

  // Optional job/service fields
  productName: { type: String },
  model: { type: String },
  serialNo: { type: String },
  issue: { type: String },

  // Status
  status: { type: String, enum: ["Pending", "Sent", "Approved"], default: "Pending" },

}, { timestamps: true });

module.exports = mongoose.model("Quotation", quotationSchema);