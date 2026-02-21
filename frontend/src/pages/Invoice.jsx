import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

function Invoice() {
  const [customers, setCustomers] = useState([]);
  const [selected, setSelected] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [customerData, setCustomerData] = useState({});

  const navigate = useNavigate(); // Hook for redirection
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const prefillCustomerId = queryParams.get("customerId") || "";

  // Fetch all customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await axios.get("https://ipremium-crm.onrender.com/api/customers");
        const allCustomers = res.data.data || res.data;
        setCustomers(allCustomers);

        if (prefillCustomerId) setSelected(prefillCustomerId);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchCustomers();
  }, [prefillCustomerId]);

  // Set selected customer data locally
  useEffect(() => {
    if (selected) {
      const cust = customers.find((c) => c._id === selected);
      setCustomerData(cust || {});
    } else {
      setCustomerData({});
    }
  }, [selected, customers]);

  // --------------------------
  // CREATE INVOICE FUNCTION
  // --------------------------
  const createInvoice = async () => {
    if (!selected || !amount) {
      setError("Please select a customer and enter the amount.");
      return;
    }

    try {
      // 1. Send data to backend
      const res = await axios.post("https://ipremium-crm.onrender.com/api/invoices", {
        customerId: selected,
        amount: Number(amount), // Ensure it's a number
        notes,
      });

      setSuccess("Invoice Created Successfully! ✅ Redirecting to List...");
      setError("");
      
      // 2. Clear inputs
      setAmount("");
      setNotes("");

      // 3. Wait 2 seconds so user sees the success message, then redirect
      setTimeout(() => {
        navigate("/all-invoices");
      }, 2000);

    } catch (err) {
      console.error("Invoice creation error:", err.response || err);
      setError(
        "Error creating invoice ❌. Please check if your backend is running."
      );
      setSuccess("");
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div
            className="card border-0 shadow-lg"
            style={{ borderRadius: "20px", overflow: "hidden" }}
          >
            {/* Header */}
            <div
              className="p-4 text-white d-flex justify-content-between align-items-center"
              style={{
                background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
              }}
            >
              <div>
                <h2 className="fw-bold mb-0">iPremium Care Invoice</h2>
                <small className="opacity-75">Professional Billing System</small>
              </div>
              <div className="text-end">
                <h5 className="mb-0">
                  Date: {new Date().toLocaleDateString()}
                </h5>
              </div>
            </div>

            <div className="card-body p-5 bg-light">
              {/* Alert Messages */}
              {error && <div className="alert alert-danger shadow-sm">{error}</div>}
              {success && <div className="alert alert-success shadow-sm">{success}</div>}

              {/* Customer Selector */}
              <div className="mb-4">
                <label className="form-label fw-bold text-muted small text-uppercase">
                  Select Customer
                </label>
                <select
                  className="form-select border-0 shadow-sm"
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                  style={{ borderRadius: "10px", padding: "12px" }}
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer & Company Info */}
              <div className="row g-4 mb-4">
                <div className="col-md-6">
                  <div className="p-4 bg-white rounded-4 shadow-sm border-top border-primary border-4 h-100">
                    <h6 className="text-primary fw-bold mb-3">FROM:</h6>
                    <h5 className="fw-bold">iPremium Care</h5>
                    <p className="small mb-1 text-muted">📍 iPremium India - HSR Layout
114-115, 80 ft road, 27th Main Rd, 2nd Sector, HSR Layout Bengaluru, Karnataka
India - 560102</p>
                    <p className="small mb-1 text-muted">🆔 GST: 29AAKFI8994H1ZH</p>
                    <p className="small mb-0 text-muted">📞 +91 8884417766</p>
                    <p className="small mb-0 text-muted">Email: support@ipremiumindia.co.in </p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-4 bg-white rounded-4 shadow-sm border-top border-info border-4 h-100">
                    <h6 className="text-info fw-bold mb-3">BILL TO:</h6>
                    <h5 className="fw-bold">{customerData?.name || "---"}</h5>
                    {customerData?.company && (
                      <p className="small mb-1 text-dark fw-semibold">
                        🏢 {customerData.company}
                      </p>
                    )}
                    <p className="small mb-1 text-muted">
                      📞 {customerData?.phone || "No Phone"}
                    </p>
                    {customerData?.email && (
                      <p className="small mb-0 text-muted">📧 {customerData.email}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Service / Job Details */}
              <div className="bg-white rounded-4 shadow-sm overflow-hidden mb-4">
                <div className="bg-dark text-white p-3 fw-bold">
                  Service & Job Details
                </div>
                <div className="p-4">
                  {customerData?.productName ? (
                    <div className="row align-items-center">
                      <div className="col-md-8">
                        <h6 className="fw-bold text-primary">
                          {customerData.productName}
                        </h6>
                        <div className="d-flex gap-2 mb-3">
                          <span className="badge bg-light text-dark border">
                            Model: {customerData.model || "-"}
                          </span>
                          <span className="badge bg-light text-dark border">
                            SN: {customerData.serialNo || "-"}
                          </span>
                        </div>
                        <div className="p-3 bg-warning bg-opacity-10 border-start border-warning border-4 rounded">
                          <strong className="small text-uppercase text-warning d-block">
                            Reported Issue:
                          </strong>
                          <span>{customerData.issue || "No issue recorded"}</span>
                        </div>
                      </div>
                      <div className="col-md-4 text-end">
                        <label className="d-block small fw-bold text-muted mb-2">
                          INVOICE AMOUNT
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-white border-0 shadow-sm">
                            ₹
                          </span>
                          <input
                            type="number"
                            className="form-control form-control-lg border-0 shadow-sm bg-light fw-bold text-end"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-muted my-3">
                      Please select a customer to see job data.
                    </p>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="mb-4">
                <label className="form-label fw-bold text-muted small">
                  Additional Notes / Terms
                </label>
                <textarea
                  className="form-control border-0 shadow-sm rounded-3"
                  rows="3"
                  placeholder="Mention warranty or service terms..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                ></textarea>
              </div>

              {/* Action Button */}
              <button
                className="btn btn-lg w-100 py-3 text-white fw-bold shadow-sm"
                style={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: "15px",
                  border: "none",
                }}
                onClick={createInvoice}
              >
                Create & Save Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Invoice;
