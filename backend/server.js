const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(()=> console.log("MongoDB Connected"))
.catch(err => console.log("Mongo Error:", err.message));

// Routes
app.use("/api/customers", require("./routes/customerRoutes"));
app.use("/api/invoices", require("./routes/invoiceRoutes"));
app.use("/api/quotations", require("./routes/quotationRoutes"));

// Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=> {
  console.log(`Server Running on ${PORT}`);
});
