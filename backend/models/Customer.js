const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  jobId: { type: String, required: true, unique: true },
  jobDate: { type: Date, default: Date.now },
  deliveryDate: Date,

  // Customer Info
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String,  required: true },
  company: { type: String,  required: true },   // always store
  gst: { type: String, default: "" },       // always store
  address1: { type: String,  required: true },  // always store
  address2: { type: String, default: "" },
  city: { type: String,  required: true },      // always store
  state: { type: String, default: "" },
  pincode: { type: String, default: "" },
  country: { type: String, default: "India" },

  // Product Info
  productName: { type: String, required: true },
  brand: { type: String,  required: true },     // always store
  model: { type: String,  required: true },
  serialNo: { type: String,  required: true },

  // Service Info
  issue: { type: String, required: true },
  additionalIssues: {type: String},
  technician: { type: String,  required: true },
  priority: { type: String, enum: ["Low","Medium","High","Urgent"], default: "Medium" },
  status: { type: String, enum: ["Pending","In Progress","Completed","Delivered"], default: "Pending" }
},{ timestamps: true });

module.exports = mongoose.model("Customer", customerSchema);
