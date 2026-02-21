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
   city: "Bangalore",      
  state: "Karnataka", 
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
      alert("Error creating job ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="premium-bg py-5">
      <div className="container">
        <div className="premium-card">

          <div className="premium-header">
            <h3>Create New Service Job</h3>
            <p>Enter complete service details below</p>
          </div>

          <div className="premium-body">

            {/* Job Info */}
            <SectionTitle title="Job Information" />
            <div className="row">
              <Input col="4" value={form.jobId} readOnly />
              <Input col="4" type="date" name="jobDate" value={form.jobDate} onChange={handleChange} />
              <Input col="4" type="date" name="deliveryDate" onChange={handleChange} />
            </div>

            <Divider />

            {/* Customer */}
            <SectionTitle title="Customer Details" />
            <div className="row">
              <Input col="4" name="name" value={form.name} onChange={handleChange} placeholder="Customer Name" />
              <Input col="4" name="phone" value={form.phone} onChange={handleChange} placeholder="Phone Number" />
              <Input col="4" name="email" value={form.email} onChange={handleChange} placeholder="Email" />
              <Input col="6" name="company" value={form.company} onChange={handleChange} placeholder="Company Name" />
              <Input col="6" name="gst" value={form.gst} onChange={handleChange} placeholder="GST Number" />
              <Input col="6" name="address1" value={form.address1} onChange={handleChange} placeholder="Address Line 1" />
              <Input col="6" name="address2" value={form.address2} onChange={handleChange} placeholder="Address Line 2" />
             <div className="col-md-4 mb-4">
  <select
    name="city"
    value={form.city}
    onChange={(e) => {
      const selectedCity = e.target.value;
      setForm({
        ...form,
        city: selectedCity,
        state:
          selectedCity === "Bangalore"
            ? "Karnataka"
           
      });
    }}
    className="premium-input"
  >
    <option value="Bangalore">Bangalore</option>
  
  </select>
</div>

<div className="col-md-4 mb-4">
  <select
    name="state"
    value={form.state}
    onChange={handleChange}
    className="premium-input"
  >
    <option value="Karnataka">Karnataka</option>
    
  </select>
</div>
              <Input col="2" name="pincode" value={form.pincode} onChange={handleChange} placeholder="Pincode" />
              <Input col="2" name="country" value={form.country} onChange={handleChange} placeholder="Country" />
            </div>

            <Divider />

            {/* Product */}
            <SectionTitle title="Product Details" />
            <div className="row">
              <Input col="4" name="productName" value={form.productName} onChange={handleChange} placeholder="Product Name" />
              <Input col="4" name="brand" value={form.brand} onChange={handleChange} placeholder="Brand" />
              <Input col="4" name="model" value={form.model} onChange={handleChange} placeholder="Model" />
              <Input col="4" name="serialNo" value={form.serialNo} onChange={handleChange} placeholder="Serial Number" />
            </div>

            <Divider />

            {/* Service */}
            <SectionTitle title="Service Information" />
            <div className="row">
              <div className="col-md-6 mb-4">
                <textarea
                  name="issue"
                  value={form.issue}
                  onChange={handleChange}
                  className="premium-input"
                  placeholder="Describe Issue"
                />
              </div>
              <Input col="6" name="technician" value={form.technician} onChange={handleChange} placeholder="Technician Name" />
            </div>

            <div className="text-end mt-4">
              <button
                className="premium-btn"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Job"}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Premium Styles */}
      <style>{`
        .premium-bg {
          background: linear-gradient(135deg,#eef2f3,#dfe9f3);
          min-height: 100vh;
        }

        .premium-card {
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.08);
          overflow: hidden;
        }

        .premium-header {
          background: linear-gradient(135deg,#667eea,#764ba2);
          color: white;
          padding: 30px;
        }

        .premium-header h3 {
          margin-bottom: 5px;
          font-weight: 700;
        }

        .premium-body {
          padding: 40px;
        }

        .premium-input {
          width: 100%;
          padding: 12px 15px;
          border-radius: 10px;
          border: 1px solid #e0e0e0;
          transition: all 0.3s ease;
          background: white;
        }

        .premium-input:focus {
          border-color: #667eea;
          box-shadow: 0 5px 20px rgba(102,126,234,0.2);
          outline: none;
        }

        .premium-btn {
          background: linear-gradient(135deg,#11998e,#38ef7d);
          border: none;
          padding: 12px 30px;
          border-radius: 10px;
          color: white;
          font-weight: 600;
          transition: 0.3s;
        }

        .premium-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        }

        .section-title {
          font-weight: 600;
          margin-bottom: 20px;
          color: #444;
        }

        .divider {
          margin: 40px 0;
          height: 1px;
          background: #eee;
        }
      `}</style>
    </div>
  );
}

function Input({ col, ...props }) {
  return (
    <div className={`col-md-${col} mb-4`}>
      <input {...props} className="premium-input" />
    </div>
  );
}

function SectionTitle({ title }) {
  return <h5 className="section-title">{title}</h5>;
}

function Divider() {
  return <div className="divider"></div>;
}

export default CreateJob;
