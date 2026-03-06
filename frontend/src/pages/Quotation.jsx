import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

function Quotation() {
  const [customers, setCustomers] = useState([]);
  const [selected, setSelected] = useState("");
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
    amount: ""
  });

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const prefillCustomerId = queryParams.get("customerId") || "";

  // Fixed Company Info (FROM)
  const company = {
    name: "iPremium India - HSR Layout",
    address1: "114-115, 80 ft road, 27th Main Rd, 2nd Sector",
    area: "HSR Layout",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560102",
    country: "India",
    phone: "8884417766",
    email: "support@ipremiumindia.co.in",
    gst: "29AAKFI8994H1ZH",
  };

  // Calculate subtotal & total
  const subtotal = serviceItems.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  // Fetch customers
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

  // Fetch selected customer data
  useEffect(() => {
    if (!selected) {
      setCustomerData({});
      return;
    }

    const fetchCustomerData = async () => {
      try {
        const res = await axios.get(`https://ipremium-crm.onrender.com/api/customers/${selected}`);
        setCustomerData(res.data || {});
      } catch (err) {
        console.error(err);
        setCustomerData({});
      }
    };
    fetchCustomerData();
  }, [selected]);

  const createQuotation = async () => {
    if (!selected) {
      setError("Please select a customer.");
      setSuccess("");
      return;
    }
    if (serviceItems.length === 0) {
      setError("Please add at least one service item.");
      setSuccess("");
      return;
    }

    try {
      await axios.post("https://ipremium-crm.onrender.com/api/quotations", {
        customerId: selected,
        amount: subtotal,
        notes,
        serviceItems
      });

      setSuccess("Quotation Created Successfully ✅");
      setError("");
      setServiceItems([]);
      setCurrentItem({ productName: "", model: "", serialNo: "", issue: "", amount: "" });
      setNotes("");
    } catch (err) {
      console.error(err);
      setError("Error creating quotation ❌");
      setSuccess("");
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card border-0 shadow-lg" style={{ borderRadius: "20px", overflow: "hidden" }}>
            {/* Header */}
            <div className="p-4 text-white d-flex justify-content-between align-items-center"
              style={{ background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)" }}>
              <div>
                <h2 className="fw-bold mb-0">iPremium Care Quotation</h2>
                <small className="opacity-75">Professional Quotation System</small>
              </div>
              <div className="text-end">
                <h5 className="mb-0">Date: {new Date().toLocaleDateString()}</h5>
              </div>
            </div>

            <div className="card-body p-5 bg-light">
              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              {/* Customer Selector */}
              <div className="mb-4">
                <label className="form-label fw-bold text-muted small uppercase">Select Customer</label>
                <select
                  className="form-select border-0 shadow-sm"
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                  style={{ borderRadius: "10px", padding: "12px" }}
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map(c => (
                    <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>
                  ))}
                </select>
              </div>

              {/* FROM & TO */}
              <div className="row g-4 mb-4">
                {/* FROM */}
                <div className="col-md-6">
                  <div className="p-4 bg-white rounded-4 shadow-sm border-top border-primary border-4 h-100">
                    <h6 className="text-primary fw-bold mb-3">FROM:</h6>
                    <h5 className="fw-bold">{company.name}</h5>
                    <p className="small mb-1 text-muted">📍 {company.address1}, {company.city}</p>
                    <p className="small mb-1 text-muted">🆔 GST: {company.gst}</p>
                    <p className="small mb-0 text-muted">📞 {company.phone}</p>
                    <p className="small mb-0 text-muted">📧 {company.email}</p>
                  </div>
                </div>

                {/* TO */}
                <div className="col-md-6">
                  <div className="p-4 bg-white rounded-4 shadow-sm border-top border-info border-4 h-100">
                    <h6 className="text-info fw-bold mb-3">BILL TO:</h6>
                    <h5 className="fw-bold">{customerData?.name || "---"}</h5>
                    {customerData?.company && <p className="small mb-1 text-dark fw-semibold">🏢 {customerData.company}</p>}
                    <p className="small mb-1 text-muted">📞 {customerData?.phone || "---"}</p>
                    {customerData?.gst && <p className="small mb-1 text-muted">🆔 GST: {customerData.gst}</p>}
                    {customerData?.email && <p className="small mb-0 text-muted">📧 {customerData.email}</p>}
                  </div>
                </div>
              </div>

              {/* Service Items */}
              <div className="bg-white rounded-4 shadow-sm overflow-hidden mb-4">
                <div className="bg-dark text-white p-3 fw-bold">Service & Job Details</div>
                <div className="p-4">
                  {/* Input Row */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-3">
                      <input type="text" className="form-control" placeholder="Product Name"
                        value={currentItem.productName}
                        onChange={(e) => setCurrentItem({ ...currentItem, productName: e.target.value })} />
                    </div>
                    <div className="col-md-3">
                      <input type="text" className="form-control" placeholder="Model"
                        value={currentItem.model}
                        onChange={(e) => setCurrentItem({ ...currentItem, model: e.target.value })} />
                    </div>
                    <div className="col-md-3">
                      <input type="text" className="form-control" placeholder="Serial No"
                        value={currentItem.serialNo}
                        onChange={(e) => setCurrentItem({ ...currentItem, serialNo: e.target.value })} />
                    </div>
                    <div className="col-md-3">
                      <input type="text" className="form-control" placeholder="Issue"
                        value={currentItem.issue}
                        onChange={(e) => setCurrentItem({ ...currentItem, issue: e.target.value })} />
                    </div>
                    <div className="col-md-3">
                      <input type="number" className="form-control" placeholder="Amount"
                        value={currentItem.amount}
                        onChange={(e) => setCurrentItem({ ...currentItem, amount: e.target.value })} />
                    </div>
                  </div>

                  {/* Add Item Button */}
                  <button className="btn btn-sm btn-success mb-3" onClick={() => {
                    if (!currentItem.productName) return;
                    setServiceItems([...serviceItems, currentItem]);
                    setCurrentItem({ productName: "", model: "", serialNo: "", issue: "", amount: "" });
                  }}>+ Add Service</button>

                  {/* Display Added Items */}
                  {serviceItems.map((item, idx) => (
                    <div key={idx} className="border p-3 rounded mb-2 bg-light">
                      <strong>{item.productName}</strong> | {item.model} | {item.serialNo} | Issue: {item.issue} | ₹ {item.amount}
                    </div>
                  ))}

                  {/* Subtotal */}
                  <div className="text-end mt-3">
                    <label className="d-block small fw-bold text-muted mb-2">QUOTATION AMOUNT</label>
                    <h5>₹ {subtotal.toLocaleString("en-IN")}</h5>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="mb-4">
                <label className="form-label fw-bold text-muted small">Additional Notes / Terms</label>
                <textarea
                  className="form-control border-0 shadow-sm rounded-3"
                  rows="3"
                  placeholder="Mention warranty or service terms..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Action Button */}
              <button className="btn btn-lg w-100 py-3 text-white fw-bold shadow-sm"
                style={{ background: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)", borderRadius: "15px", border: "none" }}
                onClick={createQuotation}>
                Create & Save Quotation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Quotation;
