const nodemailer = require("nodemailer");

const sendJobMail = async (data) => {

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ipremiumindia@gmail.com",
    pass: "mxwzukcfjefkucbv",
  }
});

const mailOptions = {
  from: "yourgmail@gmail.com",
  to: data.email,
  subject: "Service Job Created",

  html: `
  <h2>Service Job Details</h2>

  <b>Job ID:</b> ${data.jobId} <br/>
  <b>Job Date:</b> ${data.jobDate} <br/>
  <b>Delivery Date:</b> ${data.deliveryDate} <br/>

  <h3>Customer Details</h3>
  <b>Name:</b> ${data.name} <br/>
  <b>Phone:</b> ${data.phone} <br/>
  <b>Email:</b> ${data.email} <br/>
  <b>Company:</b> ${data.company} <br/>

  <h3>Product Details</h3>
  <b>Product:</b> ${data.productName} <br/>
  <b>Brand:</b> ${data.brand} <br/>
  <b>Model:</b> ${data.model} <br/>
  <b>Serial No:</b> ${data.serialNo} <br/>

  <h3>Service Issue</h3>
  <b>Issue:</b> ${data.issue} <br/>
  <b>Additional:</b> ${data.additionalIssues} <br/>

  <h3>Technician</h3>
  ${data.technician}
  `
};

await transporter.sendMail(mailOptions);
};

module.exports = sendJobMail;
