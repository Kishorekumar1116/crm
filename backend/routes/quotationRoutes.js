// routes/quotations.js
const router = require("express").Router();
const Quotation = require("../models/Quotation");

// ==========================
// CREATE QUOTATION
// ==========================
router.post("/", async (req, res) => {
  try {
    const { customerId, amount, notes, status, productName, model, serialNo, issue } = req.body;

    if (!customerId || !amount) {
      return res.status(400).json({ message: "Customer and Amount are required" });
    }

    const quotation = await Quotation.create({
      customerId, amount, notes, status, productName, model, serialNo, issue
    });

    await quotation.populate("customerId", "name phone email company gst address1 address2 city state pincode country");

    const flattened = {
      ...quotation.toObject(),
      name: quotation.customerId?.name,
      phone: quotation.customerId?.phone,
      email: quotation.customerId?.email,
      company: quotation.customerId?.company,
      gst: quotation.customerId?.gst,
      address1: quotation.customerId?.address1,
      address2: quotation.customerId?.address2,
      city: quotation.customerId?.city,
      state: quotation.customerId?.state,
      pincode: quotation.customerId?.pincode,
      country: quotation.customerId?.country
    };

    res.status(201).json(flattened);
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
      .populate("customerId", "name phone email company gst address1 address2 city state pincode country")
      .sort({ createdAt: -1 });

    const flattened = quotations.map(q => ({
      ...q.toObject(),
      name: q.customerId?.name,
      phone: q.customerId?.phone,
      email: q.customerId?.email,
      company: q.customerId?.company,
      gst: q.customerId?.gst,
      address1: q.customerId?.address1,
      address2: q.customerId?.address2,
      city: q.customerId?.city,
      state: q.customerId?.state,
      pincode: q.customerId?.pincode,
      country: q.customerId?.country
    }));

    res.json(flattened);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================
// GET SINGLE QUOTATION
// ==========================
router.get("/:id", async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id)
      .populate("customerId", "name phone email company gst address1 address2 city state pincode country");

    if (!quotation) return res.status(404).json({ message: "Quotation not found" });

    const flattened = {
      ...quotation.toObject(),
      name: quotation.customerId?.name,
      phone: quotation.customerId?.phone,
      email: quotation.customerId?.email,
      company: quotation.customerId?.company,
      gst: quotation.customerId?.gst,
      address1: quotation.customerId?.address1,
      address2: quotation.customerId?.address2,
      city: quotation.customerId?.city,
      state: quotation.customerId?.state,
      pincode: quotation.customerId?.pincode,
      country: quotation.customerId?.country
    };

    res.json(flattened);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================
// UPDATE QUOTATION
// ==========================
router.put("/:id", async (req, res) => {
  try {
    const updated = await Quotation.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate("customerId", "name phone email company gst address1 address2 city state pincode country");

    if (!updated) return res.status(404).json({ message: "Quotation not found" });

    const flattened = {
      ...updated.toObject(),
      name: updated.customerId?.name,
      phone: updated.customerId?.phone,
      email: updated.customerId?.email,
      company: updated.customerId?.company,
      gst: updated.customerId?.gst,
      address1: updated.customerId?.address1,
      address2: updated.customerId?.address2,
      city: updated.customerId?.city,
      state: updated.customerId?.state,
      pincode: updated.customerId?.pincode,
      country: updated.customerId?.country
    };

    res.json(flattened);
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