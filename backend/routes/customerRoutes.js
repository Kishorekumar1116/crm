const router = require("express").Router();
const Customer = require("../models/Customer");
const sendJobMail = require("../utils/sendJobMail");

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

// CREATE JOB
router.post("/", async (req, res) => {
  try {

    if(!req.body.name || !req.body.phone){
      return res.status(400).json({message:"Name and Phone required"});
    }

    // Generate JOB ID
    const jobId = "JOB-" + Date.now();

    // Find last IPC number
    const lastCustomer = await Customer.findOne().sort({ ipcNumber: -1 });

    const nextIpcNumber = lastCustomer ? lastCustomer.ipcNumber + 1 : 1;

    const newCustomer = new Customer({
      ...req.body,
      jobId,
      ipcNumber: nextIpcNumber
    });

    const saved = await newCustomer.save();

    // Send Mail
    await sendJobMail(saved);

    res.json(saved);

  } catch (err) {
    console.log("FULL ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// GET ALL JOBS
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

    res.json({
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// GET SINGLE JOB
router.get("/:id", async (req, res) => {
  try {

    const data = await Customer.findById(req.params.id);

    if (!data) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json(data);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// UPDATE JOB
router.put("/:id", async (req, res) => {
  try {

    const payload = sanitizeFields(req.body);

    const updated = await Customer.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json(updated);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// DELETE JOB
router.delete("/:id", async (req, res) => {
  try {

    const deleted = await Customer.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json({ message: "Job deleted successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
