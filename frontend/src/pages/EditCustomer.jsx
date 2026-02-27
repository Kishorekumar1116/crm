import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function EditCustomer() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    jobId: "",
    jobDate: "",
    deliveryDate: "",
    ipcNumber: "",
    name: "",
    phone: "",
    email: "",
    company: "",
    gst: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
    productName: "",
    brand: "",
    model: "",
    serialNo: "",
    issue: "",
    additionalIssues: "",
    technician: "",
    priority: "",
    status: "",
  });

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await axios.get(
          `https://ipremium-crm.onrender.com/api/customers/${id}`
        );

        const data = res.data.data || res.data;

        setForm({
          ...data,
          jobDate: data.jobDate?.split("T")[0] || "",
          deliveryDate: data.deliveryDate?.split("T")[0] || "",
        });
      } catch (err) {
        console.log(err);
      }
    };

    fetchCustomer();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      await axios.put(
        `https://ipremium-crm.onrender.com/api/customers/${id}`,
        form
      );

      alert("Customer Updated Successfully ✅");
      navigate("/customers");
    } catch (err) {
      console.log(err);
      alert("Update Failed ❌");
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-lg p-4">
        <h3 className="text-center mb-4">✏ Edit Customer</h3>

        <div className="row">

          {/* IPC Number (Readonly Recommended) */}
          <div className="col-md-4 mb-3">
            <input
              name="ipcNumber"
              value={form.ipcNumber || ""}
              className="form-control"
              disabled
            />
          </div>

          <div className="col-md-4 mb-3">
            <input
              type="date"
              name="jobDate"
              value={form.jobDate}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="col-md-4 mb-3">
            <input
              type="date"
              name="deliveryDate"
              value={form.deliveryDate}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="col-md-6 mb-3">
            <input name="name" value={form.name} onChange={handleChange} className="form-control" placeholder="Name" />
          </div>

          <div className="col-md-6 mb-3">
            <input name="phone" value={form.phone} onChange={handleChange} className="form-control" placeholder="Phone" />
          </div>

          <div className="col-md-6 mb-3">
            <input name="email" value={form.email} onChange={handleChange} className="form-control" placeholder="Email" />
          </div>

          <div className="col-md-6 mb-3">
            <input name="company" value={form.company} onChange={handleChange} className="form-control" placeholder="Company" />
          </div>

          <div className="col-md-6 mb-3">
            <input name="gst" value={form.gst} onChange={handleChange} className="form-control" placeholder="GST" />
          </div>

          <div className="col-md-6 mb-3">
            <input name="address1" value={form.address1} onChange={handleChange} className="form-control" placeholder="Address 1" />
          </div>

          <div className="col-md-6 mb-3">
            <input name="address2" value={form.address2} onChange={handleChange} className="form-control" placeholder="Address 2" />
          </div>

          <div className="col-md-4 mb-3">
            <input name="city" value={form.city} onChange={handleChange} className="form-control" placeholder="City" />
          </div>

          <div className="col-md-4 mb-3">
            <input name="state" value={form.state} onChange={handleChange} className="form-control" placeholder="State" />
          </div>

          <div className="col-md-4 mb-3">
            <input name="pincode" value={form.pincode} onChange={handleChange} className="form-control" placeholder="Pincode" />
          </div>

          <div className="col-md-6 mb-3">
            <input name="country" value={form.country} onChange={handleChange} className="form-control" placeholder="Country" />
          </div>

          <div className="col-md-6 mb-3">
            <input name="productName" value={form.productName} onChange={handleChange} className="form-control" placeholder="Product Name" />
          </div>

          <div className="col-md-4 mb-3">
            <input name="brand" value={form.brand} onChange={handleChange} className="form-control" placeholder="Brand" />
          </div>

          <div className="col-md-4 mb-3">
            <input name="model" value={form.model} onChange={handleChange} className="form-control" placeholder="Model" />
          </div>

          <div className="col-md-4 mb-3">
            <input name="serialNo" value={form.serialNo} onChange={handleChange} className="form-control" placeholder="Serial No" />
          </div>

          <div className="col-md-6 mb-3">
            <textarea name="issue" value={form.issue} onChange={handleChange} className="form-control" placeholder="Issue" />
          </div>

          <div className="col-md-6 mb-3">
            <textarea name="additionalIssues" value={form.additionalIssues} onChange={handleChange} className="form-control" placeholder="Additional Issues" />
          </div>

          <div className="col-md-4 mb-3">
            <input name="technician" value={form.technician} onChange={handleChange} className="form-control" placeholder="Technician" />
          </div>

          <div className="col-md-4 mb-3">
            <select name="priority" value={form.priority} onChange={handleChange} className="form-select">
              <option value="">Select Priority</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          <div className="col-md-4 mb-3">
            <select name="status" value={form.status} onChange={handleChange} className="form-select">
              <option value="">Select Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>

        </div>

        <div className="text-center mt-3">
          <button className="btn btn-success px-4" onClick={handleUpdate}>
            Update Customer
          </button>
        </div>

      </div>
    </div>
  );
}

export default EditCustomer;
