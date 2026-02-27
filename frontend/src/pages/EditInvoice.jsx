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
  <div
    className="d-flex justify-content-center align-items-center"
    style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1e1f2f, #2c2f48)",
    }}
  >
    <div className="col-lg-7">
      <div
        className="card border-0 p-4"
        style={{
          borderRadius: "25px",
          background: "rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(25px)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="text-white fw-bold mb-0">
            ✏️ Edit Invoice
          </h3>
          <button
            className="btn btn-sm btn-light rounded-pill px-3"
            onClick={() => navigate("/invoices")}
          >
            ← Back
          </button>
        </div>

        <form onSubmit={handleUpdate}>
          {[
            { label: "Customer Name", name: "name", type: "text" },
            { label: "Phone", name: "phone", type: "text" },
            { label: "Amount", name: "amount", type: "number" },
            { label: "Product Name", name: "productName", type: "text" },
            { label: "Model", name: "model", type: "text" },
            { label: "Serial Number", name: "serialNo", type: "text" },
            { label: "Issue", name: "issue", type: "text" },
          ].map((field, index) => (
            <div className="form-floating mb-3" key={index}>
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                className="form-control rounded-4 border-0"
                placeholder={field.label}
                style={{
                  background: "rgba(255,255,255,0.15)",
                  color: "#fff",
                }}
              />
              <label className="text-light">{field.label}</label>
            </div>
          ))}

          <div className="form-floating mb-4">
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="form-control rounded-4 border-0"
              placeholder="Notes"
              style={{
                height: "100px",
                background: "rgba(255,255,255,0.15)",
                color: "#fff",
              }}
            />
            <label className="text-light">Notes</label>
          </div>

          <div className="d-grid">
            <button
              type="submit"
              className="btn btn-lg fw-semibold text-white"
              style={{
                borderRadius: "50px",
                background: "linear-gradient(90deg, #4e54c8, #8f94fb)",
                boxShadow: "0 10px 25px rgba(78,84,200,0.5)",
                transition: "all 0.3s ease",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.transform = "translateY(-3px)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              💾 Update Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
);
}
export default EditInvoice;
