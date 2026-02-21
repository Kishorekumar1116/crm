import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await axios.get("https://ipremium-crm.onrender.com/api/invoices");
      const data = res.data.data || res.data;
      setInvoices(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching invoices:", err);
      setLoading(false);
    }
  };

  const viewPdf = (invoiceId) => {
    window.open(`https://ipremium-crm.onrender.com/api/invoices/view-pdf/${invoiceId}`, "_blank");
  };

  const sendEmail = async (invoiceId) => {
    try {
      const confirmSend = window.confirm("Send this invoice to the customer?");
      if (!confirmSend) return;

      alert("Sending email... please wait.");
      await axios.post(`https://ipremium-crm.onrender.com/api/invoices/send-email/${invoiceId}`);
      alert("✅ Email sent successfully!");
    } catch (err) {
      console.error("Email error:", err);
      alert("❌ Failed to send email. Check customer email.");
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const name = inv.customerId?.name?.toLowerCase() || inv.name?.toLowerCase() || "";
    const phone = inv.customerId?.phone || inv.phone || "";
    return name.includes(searchTerm.toLowerCase()) || phone.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="container py-5">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <button 
            className="btn btn-sm btn-outline-secondary mb-2 shadow-sm" 
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </button>
          <h2 className="fw-bold text-primary">Invoice History</h2>
        </div>
        <Link 
          to="/invoice" 
          className="btn rounded-pill px-4 shadow-lg"
          style={{
            background: "linear-gradient(90deg, #4e54c8, #8f94fb)",
            color: "#fff",
            fontWeight: "500",
            boxShadow: "0 5px 20px rgba(0,0,0,0.3)",
            transition: "0.3s"
          }}
          onMouseOver={e => e.currentTarget.style.transform = "scale(1.05)"}
          onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
        >
          + Create New Invoice
        </Link>
      </div>

      {/* SEARCH BAR */}
      <div className="card border-0 shadow-sm mb-4 rounded-4">
        <div className="card-body p-2">
          <div className="input-group">
            <span className="input-group-text bg-transparent border-0">🔍</span>
            <input
              type="text"
              className="form-control border-0"
              placeholder="Search by Customer Name or Phone Number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* INVOICE TABLE */}
      <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-gradient-primary text-white">
              <tr>
                <th className="ps-4">Date</th>
                <th>Customer Name</th>
                <th>Phone</th>
                <th>Amount</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-5 fw-semibold text-muted">Loading Invoices...</td>
                </tr>
              ) : filteredInvoices.length > 0 ? (
                filteredInvoices.map((inv) => (
                  <tr 
                    key={inv._id} 
                    className="align-middle"
                    style={{
                      transition: "0.3s",
                    }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = "rgba(79, 84, 230, 0.05)"}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <td className="ps-4">{new Date(inv.createdAt).toLocaleDateString()}</td>
                    <td className="fw-bold">{inv.customerId?.name || inv.name || "N/A"}</td>
                    <td>{inv.customerId?.phone || inv.phone || "N/A"}</td>
                    <td className="text-success fw-bold">₹{inv.amount}</td>
                    <td className="text-center">
                      <button 
                        onClick={() => viewPdf(inv._id)} 
                        className="btn btn-sm btn-primary mx-1 shadow-sm"
                        style={{ transition: "0.3s" }}
                        onMouseOver={e => e.currentTarget.style.transform = "scale(1.05)"}
                        onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
                      >
                        View PDF
                      </button>
                      <button 
                        onClick={() => sendEmail(inv._id)} 
                        className="btn btn-sm btn-info text-white mx-1 shadow-sm"
                        style={{ transition: "0.3s" }}
                        onMouseOver={e => e.currentTarget.style.transform = "scale(1.05)"}
                        onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
                      >
                        📩 Send Email
                      </button>
                     
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted fw-light">
                    No invoices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default InvoiceList;
