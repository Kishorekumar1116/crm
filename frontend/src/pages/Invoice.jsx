import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

function Invoice() {
  const [customers, setCustomers] = useState([]);
  const [selected, setSelected] = useState("");
  const [includeGST, setIncludeGST] = useState(false);
const [amountPaid, setAmountPaid] = useState(0);
  const [includeBalance, setIncludeBalance] = useState(false);
const [balanceAmount, setBalanceAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [customerData, setCustomerData] = useState({});
const [serviceItems, setServiceItems] = useState([]);
const [currentItem, setCurrentItem] = useState({
  productName: "",
  model: "",
  serialNo: "",
  issue: "",
  amount:""
});
  
  const navigate = useNavigate(); // Hook for redirection
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const prefillCustomerId = queryParams.get("customerId") || "";


  const subtotal = serviceItems.reduce(
  (sum, item) => sum + Number(item.amount || 0),
  0
);

const gstAmount = includeGST ? subtotal * 0.18 : 0;

const finalAmount = subtotal + gstAmount;
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
    if (!selected) {
  setError("Please select a customer.");
  return;
}

if (serviceItems.length === 0) {
  setError("Please add at least one service item.");
  return;
}

    try {
      // 1. Send data to backend
    const res = await axios.post("https://ipremium-crm.onrender.com/api/invoices", {
  customerId: selected,
  amount: finalAmount,
  includeGST,
  gst: gstAmount,
  notes,
  serviceItems,
  includeBalance,
  balanceAmount
});

      setSuccess("Invoice Created Successfully! ✅ Redirecting to List...");
      setError("");
      
      // 2. Clear inputs
      
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
                   <p className="small mb-1 text-muted">
  📍 iPremium India - HSR Layout <br />
  114-115, 80 ft road, 27th Main Rd, 2nd Sector, HSR Layout Bengaluru, Karnataka <br />
  India - 560102
</p>
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

  {/* Input Fields */}
  <div className="row g-3 mb-3">
    <div className="col-md-3">
      <input
        type="text"
        className="form-control"
        placeholder="Product Name"
        value={currentItem.productName}
        onChange={(e) =>
          setCurrentItem({ ...currentItem, productName: e.target.value })
        }
      />
    </div>

    <div className="col-md-3">
      <input
        type="text"
        className="form-control"
        placeholder="Model"
        value={currentItem.model}
        onChange={(e) =>
          setCurrentItem({ ...currentItem, model: e.target.value })
        }
      />
    </div>

    <div className="col-md-3">
      <input
        type="text"
        className="form-control"
        placeholder="Serial No"
        value={currentItem.serialNo}
        onChange={(e) =>
          setCurrentItem({ ...currentItem, serialNo: e.target.value })
        }
      />
    </div>

    <div className="col-md-3">
      <input
        type="text"
        className="form-control"
        placeholder="Issue"
        value={currentItem.issue}
        onChange={(e) =>
          setCurrentItem({ ...currentItem, issue: e.target.value })
        }
      />
    </div>
     <div className="col-md-3">
  <input
    type="number"
    className="form-control"
    placeholder="Amount"
    value={currentItem.amount}
    onChange={(e) =>
      setCurrentItem({ ...currentItem, amount: e.target.value })
    }
  />
</div>
  </div>

  {/* Add Button */}
  <button
    className="btn btn-sm btn-success mb-3"
    onClick={() => {
      if (!currentItem.productName) return;
      setServiceItems([...serviceItems, currentItem]);
    setCurrentItem({
  productName: "",
  model: "",
  serialNo: "",
  issue: "",
  amount: ""
});
    }}
  >
    + Add Service
  </button>

  {/* Display Added Items */}
  {serviceItems.map((item, index) => (
    <div key={index} className="border p-3 rounded mb-2 bg-light">
      <strong>{item.productName}</strong> | {item.model} | {item.serialNo} | Issue: {item.issue} | {item.amount}
    </div>
  ))}

  {/* Amount Section */}
  <div className="text-end mt-3">
    <label className="d-block small fw-bold text-muted mb-2">
      INVOICE AMOUNT
    </label>
  <div className="text-end mt-4">

  {/* Subtotal */}
  <div className="mb-2">
    <small className="text-muted">Subtotal:</small>
    <h6>₹ {subtotal.toFixed(2)}</h6>
  </div>

  {/* GST Checkbox */}
  <div className="form-check d-flex justify-content-end mb-2">
    <input
      className="form-check-input me-2"
      type="checkbox"
      checked={includeGST}
      onChange={() => setIncludeGST(!includeGST)}
      id="gstCheck"
    />
    <label className="form-check-label" htmlFor="gstCheck">
      Add 18% GST
    </label>
  </div>

  {/* GST Amount */}
  {includeGST && (
    <div className="mb-2">
      <small className="text-muted">GST (18%):</small>
      <h6>₹ {gstAmount.toFixed(2)}</h6>
    </div>
  )}

    <div className="mb-2 text-end">
  <small className="text-muted">Amount Paid:</small>
  <input
    type="number"
    className="form-control text-end"
    value={amountPaid}
    onChange={(e) => setAmountPaid(e.target.value)}
  />
</div>

  {/* Final Amount */}
  <div className="mt-3">
    <label className="fw-bold">TOTAL AMOUNT</label>
    <input
      type="number"
      className="form-control form-control-lg text-end fw-bold"
      value={finalAmount.toFixed(2)}
      readOnly
    />
  </div>

</div>
  </div>

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
