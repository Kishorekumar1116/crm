const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Customer", 
    required: true 
  },

  // Invoice details
  invoiceNumber: { type: String, unique: true },
  amount: { type: Number, required: true },
  notes: { type: String },
  productName: String,
  brand: String,
  model: String,
  serialNo: String,
  issue: String,

  // Payment & status
  status: { 
    type: String, 
    enum: ["Unpaid", "Partial", "Paid"], 
    default: "Unpaid" 
  },

  // Dates
  dueDate: Date

}, { timestamps: true });

module.exports = mongoose.model("Invoice", invoiceSchema);
