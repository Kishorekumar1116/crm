// routes/quotations.js
const router = require("express").Router();
const Quotation = require("../models/Quotation");
const Customer = require("../models/Customer");

// ==========================
// CREATE QUOTATION
// ==========================
router.post("/", async (req, res) => {
  try {
    const { customerId, amount, notes, status, productName, model, serialNo, issue } = req.body;

    if (!customerId || !amount) {
      return res.status(400).json({ message: "Customer and Amount are required" });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    const quotation = await Quotation.create({
      customerId,
      amount,
      notes,
      status,
      productName,
      model,
      serialNo,
      issue,
    });

    await quotation.populate("customerId");

    const response = {
      _id: quotation._id,
      amount: quotation.amount,
      notes: quotation.notes || "",
      status: quotation.status || "",
      productName: quotation.productName || "",
      model: quotation.model || "",
      serialNo: quotation.serialNo || "",
      issue: quotation.issue || "",
      createdAt: quotation.createdAt,

      // CUSTOMER INFO
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

      // COMPANY INFO (iPremium India)
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

    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================
// GET ALL QUOTATIONS
// ==========================
router.get("/", async (req, res) => {
  try {
    const quotations = await Quotation.find()
      .populate("customerId")
      .sort({ createdAt: -1 });

    const response = quotations.map(q => ({
      _id: q._id,
      amount: q.amount,
      notes: q.notes || "",
      status: q.status || "",
      productName: q.productName || "",
      model: q.model || "",
      serialNo: q.serialNo || "",
      issue: q.issue || "",
      createdAt: q.createdAt,

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
  } catch (error) {
    res.status(500).json({ message: error.message });
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
      _id: q._id,
      amount: q.amount,
      notes: q.notes || "",
      status: q.status || "",
      productName: q.productName || "",
      model: q.model || "",
      serialNo: q.serialNo || "",
      issue: q.issue || "",
      createdAt: q.createdAt,

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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================
// UPDATE QUOTATION
// ==========================
router.put("/:id", async (req, res) => {
  try {
    const updated = await Quotation.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate("customerId");
    if (!updated) return res.status(404).json({ message: "Quotation not found" });

    const response = {
      _id: updated._id,
      amount: updated.amount,
      notes: updated.notes || "",
      status: updated.status || "",
      productName: updated.productName || "",
      model: updated.model || "",
      serialNo: updated.serialNo || "",
      issue: updated.issue || "",
      createdAt: updated.createdAt,

      customer: {
        name: updated.customerId?.name || "",
        phone: updated.customerId?.phone || "",
        email: updated.customerId?.email || "",
        company: updated.customerId?.company || "",
        gst: updated.customerId?.gst || "",
        address1: updated.customerId?.address1 || "",
        address2: updated.customerId?.address2 || "",
        city: updated.customerId?.city || "",
        state: updated.customerId?.state || "",
        pincode: updated.customerId?.pincode || "",
        country: updated.customerId?.country || "",
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================
// DELETE QUOTATION
// ==========================
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Quotation.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Quotation not found" });
    res.json({ message: "Quotation deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
