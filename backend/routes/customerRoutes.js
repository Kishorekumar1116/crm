const router = require("express").Router();
const Customer = require("../models/Customer");
const { body, validationResult } = require("express-validator");

// Utility to ensure always storing key fields
const sanitizeFields = (data) => {
  return {
    ...data,
    company: data.company || "",
    gst: data.gst || "",
    address1: data.address1 || "",
    city: data.city || "",
    brand: data.brand || ""
  };
};

// Create Job
// Create Job
router.post("/", async (req, res) => {
  try {
    // Generate JOB ID
    const jobId = "JOB-" + Date.now();

    // 🔥 Find last IPC number
    const lastCustomer = await Customer.findOne().sort({ ipcNumber: -1 });

    let nextIpcNumber = 1;

    if (lastCustomer && lastCustomer.ipcNumber) {
      nextIpcNumber = lastCustomer.ipcNumber + 1;
    }

    const newCustomer = new Customer({
      ...req.body,
      jobId,
      ipcNumber: nextIpcNumber
    });

    const saved = await newCustomer.save();
    res.json(saved);

  } catch (err) {
    console.log("FULL ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});
// Get All Jobs
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const total = await Customer.countDocuments();
    const data = await Customer.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ total, page, totalPages: Math.ceil(total / limit), data });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Get Single Job
router.get("/:id", async (req, res) => {
  try {
    const data = await Customer.findById(req.params.id);
    if (!data) return res.status(404).json({ message: "Job not found" });
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Update Job
router.put("/:id", async (req, res) => {
  try {
    const payload = sanitizeFields(req.body);

    const updated = await Customer.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!updated) return res.status(404).json({ message: "Job not found" });
    res.json(updated);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Delete Job
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Customer.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Job not found" });
    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
