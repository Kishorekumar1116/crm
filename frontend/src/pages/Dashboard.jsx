import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function CreateJob() {
    const navigate = useNavigate();

    const generateJobId = () => {
        const random = Math.floor(1000 + Math.random() * 9000);
        return `JOB-2026-${random}`;
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
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        if(e) e.preventDefault(); // Prevent accidental page reload
        
        // Basic Validation
        if (!form.name || !form.phone || !form.productName) {
            alert("Please fill in Name, Phone, and Product Name! ⚠️");
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post("https://ipremium-crm.onrender.com/api/customers", form);
            
            if (response.status === 201 || response.status === 200) {
                alert("Job Created Successfully ✅");
                navigate("/customers");
            }
        } catch (error) {
            console.error("Server Error Detail:", error.response?.data);
            alert(`Error: ${error.response?.data?.message || "Internal Server Error (500) ❌"}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5 mb-5">
            <div className="card shadow-lg border-0">
                <div className="card-header text-white" style={{ background: "linear-gradient(135deg,#667eea,#764ba2)" }}>
                    <h4 className="mb-0">Create New Service Job</h4>
                </div>
                <div className="card-body">
                    {/* Job Info */}
                    <h5 className="text-primary border-bottom pb-2">Job Information</h5>
                    <div className="row g-3 mb-4">
                        <div className="col-md-4">
                            <label className="form-label fw-bold">Job ID</label>
                            <input className="form-control bg-light" value={form.jobId} readOnly />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label fw-bold">Job Date</label>
                            <input type="date" name="jobDate" value={form.jobDate} onChange={handleChange} className="form-control" />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label fw-bold">Expected Delivery</label>
                            <input type="date" name="deliveryDate" value={form.deliveryDate} onChange={handleChange} className="form-control" />
                        </div>
                    </div>

                    {/* Customer Info */}
                    <h5 className="text-success border-bottom pb-2">Customer Details</h5>
                    <div className="row g-3 mb-4">
                        <div className="col-md-4">
                            <input name="name" value={form.name} onChange={handleChange} className="form-control" placeholder="Customer Name *" required />
                        </div>
                        <div className="col-md-4">
                            <input name="phone" value={form.phone} onChange={handleChange} className="form-control" placeholder="Phone Number *" required />
                        </div>
                        <div className="col-md-4">
                            <input name="email" value={form.email} onChange={handleChange} className="form-control" placeholder="Email" />
                        </div>
                        <div className="col-md-6">
                            <input name="company" value={form.company} onChange={handleChange} className="form-control" placeholder="Company Name" />
                        </div>
                        <div className="col-md-6">
                            <input name="gst" value={form.gst} onChange={handleChange} className="form-control" placeholder="GST Number" />
                        </div>
                        <div className="col-md-6">
                            <input name="address1" value={form.address1} onChange={handleChange} className="form-control" placeholder="Address Line 1" />
                        </div>
                        <div className="col-md-6">
                            <input name="address2" value={form.address2} onChange={handleChange} className="form-control" placeholder="Address Line 2" />
                        </div>
                        <div className="col-md-3">
                            <input name="city" value={form.city} onChange={handleChange} className="form-control" placeholder="City" />
                        </div>
                        <div className="col-md-3">
                            <input name="state" value={form.state} onChange={handleChange} className="form-control" placeholder="State" />
                        </div>
                        <div className="col-md-3">
                            <input name="pincode" value={form.pincode} onChange={handleChange} className="form-control" placeholder="Pincode" />
                        </div>
                        <div className="col-md-3">
                            <input name="country" value={form.country} onChange={handleChange} className="form-control" placeholder="Country" />
                        </div>
                    </div>

                    {/* Product Info */}
                    <h5 className="text-warning border-bottom pb-2">Product Details</h5>
                    <div className="row g-3 mb-4">
                        <div className="col-md-3">
                            <input name="productName" value={form.productName} onChange={handleChange} className="form-control" placeholder="Product Name *" required />
                        </div>
                        <div className="col-md-3">
                            <input name="brand" value={form.brand} onChange={handleChange} className="form-control" placeholder="Brand" />
                        </div>
                        <div className="col-md-3">
                            <input name="model" value={form.model} onChange={handleChange} className="form-control" placeholder="Model" />
                        </div>
                        <div className="col-md-3">
                            <input name="serialNo" value={form.serialNo} onChange={handleChange} className="form-control" placeholder="Serial Number" />
                        </div>
                    </div>

                    {/* Service Info */}
                    <h5 className="text-danger border-bottom pb-2">Service Details</h5>
                    <div className="row g-3">
                        <div className="col-md-6">
                            <textarea name="issue" value={form.issue} onChange={handleChange} className="form-control" rows="3" placeholder="Describe the issue in detail..." />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Technician</label>
                            <input name="technician" value={form.technician} onChange={handleChange} className="form-control" placeholder="Assign Technician" />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Priority</label>
                            <select name="priority" value={form.priority} onChange={handleChange} className="form-select">
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Urgent">Urgent</option>
                            </select>
                        </div>
                    </div>

                    <div className="text-end mt-4">
                        <button
                            type="button"
                            className="btn btn-lg text-white px-5"
                            style={{ background: "linear-gradient(135deg,#11998e,#38ef7d)", border: "none" }}
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</>
                            ) : "Create Job"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreateJob;
