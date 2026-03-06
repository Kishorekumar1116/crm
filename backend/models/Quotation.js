// models/Quotation.js
const mongoose = require("mongoose");

const quotationSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    gstNumber: { type: String, default: "" },

    // Product / Service items
    serviceItems: [
      {
        productName: String,
        model: String,
        serialNo: String,
        issue: String,
        amount: Number,
      },
    ],

    subtotal: Number,
    gst: Number,
    includeGST: Boolean,
    amount: { type: Number, required: true },

    notes: String,
    status: { type: String, enum: ["Pending", "Sent", "Approved"], default: "Pending" },

    quotationNumber: String, // Optional auto-numbering like Invoice

  },
  { timestamps: true }
);

module.exports = mongoose.model("Quotation", quotationSchema);
