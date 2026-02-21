const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },

  // Invoice details
  invoiceNumber: { type: String, unique: true }, // Auto-generate
  amount: { type: Number, required: true },
  notes: { type: String },

  // Payment & status
  status: { type: String, enum: ["Unpaid", "Partial", "Paid"], default: "Unpaid" },

  // Dates
  createdAt: { type: Date, default: Date.now },
  dueDate: Date
}, { timestamps: true });

// Auto-generate invoice number before saving
invoiceSchema.pre("save", async function () {
  if (!this.invoiceNumber) {
    const count = await mongoose.model("Invoice").countDocuments();
    this.invoiceNumber = `INV-2026-${count + 1}`;
  }
});

module.exports = mongoose.model("Invoice", invoiceSchema);