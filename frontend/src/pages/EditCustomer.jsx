import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function EditCustomer() {
  const { id } = useParams(); // get customer ID from URL
  const navigate = useNavigate();
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
    gst: "",
    address1: "",
    address2: "",
    city: "",
    productName: "",
    brand: "",
    model: "",
    serialNo: "",
    issue: "",
    additionalIssues: "",
    technician: "",
    ipcNumber: "",
  });

  // Fetch customer data on load
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await axios.get(`https://ipremium-crm.onrender.com/api/customers/${id}`);
        setCustomer(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCustomer();
  }, [id]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`https://ipremium-crm.onrender.com/api/customers/${id}`, customer);
      alert("Customer updated successfully!");
      navigate("/customers"); // go back to customer list
    } catch (err) {
      console.error(err);
      alert("Failed to update customer");
    }
  };

  return (
    <div className="container mt-5">
      <h3 className="mb-4">Edit Customer</h3>
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label>Name</label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={customer.name}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6 mb-3">
            <label>Phone</label>
            <input
              type="text"
              name="phone"
              className="form-control"
              value={customer.phone}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6 mb-3">
            <label>Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={customer.email}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6 mb-3">
            <label>Company</label>
            <input
              type="text"
              name="company"
              className="form-control"
              value={customer.company}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6 mb-3">
            <label>GST</label>
            <input
              type="text"
              name="gst"
              className="form-control"
              value={customer.gst}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6 mb-3">
            <label>City</label>
            <input
              type="text"
              name="city"
              className="form-control"
              value={customer.city}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6 mb-3">
            <label>Product Name</label>
            <input
              type="text"
              name="productName"
              className="form-control"
              value={customer.productName}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6 mb-3">
            <label>Brand</label>
            <input
              type="text"
              name="brand"
              className="form-control"
              value={customer.brand}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6 mb-3">
            <label>Model</label>
            <input
              type="text"
              name="model"
              className="form-control"
              value={customer.model}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6 mb-3">
            <label>Serial No</label>
            <input
              type="text"
              name="serialNo"
              className="form-control"
              value={customer.serialNo}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-12 mb-3">
            <label>Issue</label>
            <textarea
              name="issue"
              className="form-control"
              value={customer.issue}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-12 mb-3">
            <label>Additional Issues</label>
            <textarea
              name="additionalIssues"
              className="form-control"
              value={customer.additionalIssues}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6 mb-3">
            <label>Technician</label>
            <input
              type="text"
              name="technician"
              className="form-control"
              value={customer.technician}
              onChange={handleChange}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary">
          Update Customer
        </button>
      </form>
    </div>
  );
}

export default EditCustomer;
