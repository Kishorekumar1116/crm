import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function EditInvoice() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    amount: "",
    productName: "",
    model: "",
    serialNo: "",
    issue: "",
    notes: "",
  });

  useEffect(() => {
    fetchInvoice();
  }, []);
 
  const fetchInvoice = async () => {
    try {
      const res = await axios.get(
        `https://ipremium-crm.onrender.com/api/invoices/${id}`
      );

      setFormData({
        name: res.data.name || "",
        phone: res.data.phone || "",
        amount: res.data.amount || "",
        productName: res.data.productName || "",
        model: res.data.model || "",
        serialNo: res.data.serialNo || "",
        issue: res.data.issue || "",
        notes: res.data.notes || "",
      });

    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      await axios.put(
        `https://ipremium-crm.onrender.com/api/invoices/${id}`,
        formData
      );

      alert("✅ Invoice Updated Successfully!");
      navigate("/invoices");

    } catch (err) {
      console.log(err);
      alert("❌ Update Failed");
    }
  };

 return (
  <div className="container py-5">
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <div
          className="card shadow-lg border-0 rounded-4"
          style={{
            backdropFilter: "blur(10px)",
            background: "linear-gradient(145deg, #ffffff, #f3f4ff)",
          }}
        >
          <div className="card-body p-5">

            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="fw-bold text-primary mb-0">
                ✏️ Edit Invoice
              </h3>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => navigate("/invoices")}
              >
                ← Back
              </button>
            </div>

            <form onSubmit={handleUpdate}>

              {/* Customer Name */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Customer Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-control rounded-pill shadow-sm"
                />
              </div>

              {/* Phone */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-control rounded-pill shadow-sm"
                />
              </div>

              {/* Amount */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="form-control rounded-pill shadow-sm"
                />
              </div>

              {/* Product */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Product</label>
                <input
                  type="text"
                  name="productName"
                  value={formData.productName}
                  onChange={handleChange}
                  className="form-control rounded-pill shadow-sm"
                />
              </div>

              {/* Model */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Model</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className="form-control rounded-pill shadow-sm"
                />
              </div>

              {/* Serial No */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Serial Number</label>
                <input
                  type="text"
                  name="serialNo"
                  value={formData.serialNo}
                  onChange={handleChange}
                  className="form-control rounded-pill shadow-sm"
                />
              </div>

              {/* Issue */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Issue</label>
                <input
                  type="text"
                  name="issue"
                  value={formData.issue}
                  onChange={handleChange}
                  className="form-control rounded-pill shadow-sm"
                />
              </div>

              {/* Notes */}
              <div className="mb-4">
                <label className="form-label fw-semibold">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="form-control rounded-4 shadow-sm"
                  rows="3"
                />
              </div>

              <div className="d-grid">
                <button
                  type="submit"
                  className="btn btn-lg rounded-pill text-white shadow"
                  style={{
                    background: "linear-gradient(90deg, #4e54c8, #8f94fb)",
                    transition: "0.3s",
                  }}
                  onMouseOver={e => e.currentTarget.style.transform = "scale(1.03)"}
                  onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
                >
                  💾 Update Invoice
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}
export default EditInvoice;
