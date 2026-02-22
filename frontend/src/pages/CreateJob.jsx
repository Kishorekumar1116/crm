import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function CreateJob() {
    const navigate = useNavigate();

    const generateJobId = () => {
        const random = Math.floor(1000 + Math.random() * 9000);
        return "JOB-2026-" + random;
    };

  const [form, setForm] = useState({
  jobId: "",
  jobDate: "",
  deliveryDate: "",
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
  country: "India",
  productName: "",
  brand: "",
  model: "",
  serialNo: "",
  issue: "",
  technician: "",
  priority: "Medium",
  status: "Pending",
});

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setForm((prev) => ({
            ...prev,
            jobId: generateJobId(),
            jobDate: new Date().toISOString().split("T")[0]
        }));
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            await axios.post("https://ipremium-crm.onrender.com/api/customers", form);
            alert("Job Created Successfully ✅");
            navigate("/customers");
        } catch (error) {
            console.log(error)
            alert("Error creating job ❌");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="card shadow-lg border-0">
                <div
                    className="card-header text-white"
                    style={{ background: "linear-gradient(135deg,#667eea,#764ba2)" }}
                >
                    <h4 className="mb-0">Create New Service Job</h4>
                </div>
                <div className="card-body">

                    {/* Job Info */}
                    <h5 className="text-primary">Job Information</h5>
                    <div className="row">
                        <div className="col-md-4 mb-3">
                            <input className="form-control" value={form.jobId} readOnly />
                        </div>
                        <div className="col-md-4 mb-3">
                            <input type="date" name="jobDate" value={form.jobDate} onChange={handleChange} className="form-control" />
                        </div>
                        <div className="col-md-4 mb-3">
                            <input type="date" name="deliveryDate" onChange={handleChange} className="form-control" />
                        </div>
                    </div>

                    <hr />

                    {/* Customer Info */}
                    <h5 className="text-success">Customer Details</h5>
                    <div className="row">
                        <div className="col-md-4 mb-3">
                            <input name="name" value={form.name} onChange={handleChange} className="form-control" placeholder="Customer Name" />
                        </div>
                        <div className="col-md-4 mb-3">
                            <input name="phone" value={form.phone} onChange={handleChange} className="form-control" placeholder="Phone Number" />
                        </div>
                        <div className="col-md-4 mb-3">
                            <input name="email" value={form.email} onChange={handleChange} className="form-control" placeholder="Email" />
                        </div>
                        <div className="col-md-6 mb-3">
                            <input name="company" value={form.company} onChange={handleChange} className="form-control" placeholder="Company Name" />
                        </div>
                        <div className="col-md-6 mb-3">
                            <input name="gst" value={form.gst} onChange={handleChange} className="form-control" placeholder="GST Number" />
                        </div>

                        {/* Address Fields */}
                        <div className="col-md-6 mb-3">
                            <input name="address1" value={form.address1} onChange={handleChange} className="form-control" placeholder="Address Line 1" />
                        </div>
                        <div className="col-md-6 mb-3">
                            <input name="address2" value={form.address2} onChange={handleChange} className="form-control" placeholder="Address Line 2" />
                        </div>
                        <div className="col-md-4 mb-3">
                            <input name="city" value={form.city} onChange={handleChange} className="form-control" placeholder="City" />
                        </div>
                        <div className="col-md-4 mb-3">
                            <input name="state" value={form.state} onChange={handleChange} className="form-control" placeholder="State" />
                        </div>
                        <div className="col-md-2 mb-3">
                            <input name="pincode" value={form.pincode} onChange={handleChange} className="form-control" placeholder="Pincode" />
                        </div>
                        <div className="col-md-2 mb-3">
                            <input name="country" value={form.country} onChange={handleChange} className="form-control" placeholder="Country" />
                        </div>
                    </div>

                    <hr />

                    {/* Product Info */}
                    <h5 className="text-warning">Product Details</h5>
                    <div className="row">
                        <div className="col-md-4 mb-3">
                            <input name="productName" value={form.productName} onChange={handleChange} className="form-control" placeholder="Product Name" />
                        </div>
                        <div className="col-md-4 mb-3">
                            <input name="brand" value={form.brand} onChange={handleChange} className="form-control" placeholder="Brand" />
                        </div>
                        <div className="col-md-3 mb-3">
                            <input name="model" value={form.model} onChange={handleChange} className="form-control" placeholder="Model" />
                        </div>
                        <div className="col-md-3 mb-3">
                            <input name="serialNo" value={form.serialNo} onChange={handleChange} className="form-control" placeholder="Serial Number" />
                        </div>
                       
                    </div>

                    <hr />

                    {/* Service & Payment */}
                    <h5 className="text-danger">Service & Payment</h5>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <textarea name="issue" value={form.issue} onChange={handleChange} className="form-control" placeholder="Describe Issue" />
                        </div>
                        <div className="col-md-6 mb-3">
                            <input name="technician" value={form.technician} onChange={handleChange} className="form-control" placeholder="Technician Name" />
                        </div>
                    </div>

                    <div className="text-end mt-4">
                        <button
                            className="btn btn-lg text-white"
                            style={{ background: "linear-gradient(135deg,#11998e,#38ef7d)", border: "none" }}
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? "Creating..." : "Create Job"}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default CreateJob;
