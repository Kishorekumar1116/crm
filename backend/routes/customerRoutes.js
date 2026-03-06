const router = require("express").Router();
const Customer = require("../models/Customer");
const sendJobMail = require("../utils/sendJobMail");

// CREATE JOB
router.post("/", async (req, res) => {
  try {

    if(!req.body.name || !req.body.phone){
      return res.status(400).json({message:"Name and Phone required"});
    }

    const jobId = "JOB-" + Date.now();

    const lastCustomer = await Customer.findOne().sort({ ipcNumber: -1 });

    const nextIpcNumber = lastCustomer ? lastCustomer.ipcNumber + 1 : 1;

    const newCustomer = new Customer({
      ...req.body,
      jobId,
      ipcNumber: nextIpcNumber
    });
    
   const saved = await newCustomer.save();

try {
  await sendJobMail(saved);
} catch (mailErr) {
  console.log("Mail error:", mailErr);
}

res.json(saved);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// GET ALL
router.get("/", async (req, res) => {
  try {

    const data = await Customer.find().sort({ createdAt: -1 });

    res.json(data);

  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
