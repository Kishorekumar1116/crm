const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

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
    amount: Number,

    amountPaid: {
      type: Number,
      default: 0,
    },
   

    notes: String,
    status: String,
    dueDate: Date,

    invoiceNumber: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);
