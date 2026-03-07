import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function QuotationList() {
  const [quotations, setQuotations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      const res = await axios.get("https://ipremium-crm.onrender.com/api/quotations");
      const data = res.data.data || res.data;
      setQuotations(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching quotations:", err);
      setLoading(false);
    }
  };

  const viewPdf = (quotationId) => {
    window.open(`https://ipremium-crm.onrender.com/api/quotations/view-pdf/${quotationId}`, "_blank");
  };

  const sendEmail = async (quotationId) => {
    try {
      const confirmSend = window.confirm("Send this quotation to the customer?");
      if (!confirmSend) return;

      alert("Sending email... please wait.");
      await axios.post(`https://ipremium-crm.onrender.com/api/quotations/send-email/${quotationId}`);
      alert("✅ Email sent successfully!");
    } catch (err) {
      console.error("Email error:", err.response?.data || err.message);
      alert("❌ Failed to send email.");
    }
  };

  const editQuotation = (quotationId) => {
    navigate(`/quotation/edit/${quotationId}`);
  };

  const deleteQuotation = async (quotationId) => {
    try {
      const confirmDelete = window.confirm("Are you sure you want to delete this quotation?");
      if (!confirmDelete) return;

      await axios.delete(`https://ipremium-crm.onrender.com/api/quotations/${quotationId}`);
      alert("Quotation deleted successfully");
      fetchQuotations();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to delete quotation");
    }
  };

  const filteredQuotations = quotations.filter((quo) => {
    const name = quo.customerId?.name?.toLowerCase() || quo.name?.toLowerCase() || "";
    const phone = quo.customerId?.phone || quo.phone || "";
    const product = quo.serviceItems?.[0]?.productName?.toLowerCase() || "";
const model = quo.serviceItems?.[0]?.model?.toLowerCase() || "";
    return (
      name.includes(searchTerm.toLowerCase()) ||
      phone.includes(searchTerm.toLowerCase()) ||
      product.includes(searchTerm.toLowerCase()) ||
      model.includes(searchTerm.toLowerCase())
    );
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
          <h2 className="fw-bold text-warning">Quotation History</h2>
        </div>
        <Link 
          to="/quotation" 
          className="btn rounded-pill px-4 shadow-lg"
          style={{
            background: "linear-gradient(90deg, #ff9966, #ff5e62)",
            color: "#fff",
            fontWeight: "500",
            boxShadow: "0 5px 20px rgba(0,0,0,0.3)",
          }}
        >
          + Create New Quotation
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
              placeholder="Search by Customer, Phone, Product, or Model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* QUOTATION TABLE */}
      <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-warning text-dark">
              <tr>
                <th className="ps-4">Date</th>
                <th>Customer Name</th>
                <th>Phone</th>
                <th>Amount</th>
                <th>Product</th>
                <th>Model</th>
                <th>Notes</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-5 fw-semibold text-muted">
                    Loading Quotations...
                  </td>
                </tr>
              ) : filteredQuotations.length > 0 ? (
                filteredQuotations.map((quo) => (
                  <tr key={quo._id} 
                      className="align-middle"
                      style={{ transition: "0.3s" }}
                      onMouseOver={e => e.currentTarget.style.backgroundColor = "rgba(255, 152, 102, 0.1)"}
                      onMouseOut={e => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <td className="ps-4">{new Date(quo.createdAt).toLocaleDateString()}</td>
                    <td className="fw-bold">{quo.customerId?.name || quo.name || "N/A"}</td>
                    <td>{quo.customerId?.phone || quo.phone || "N/A"}</td>
                    <td className="text-warning fw-bold">₹{quo.amount}</td>
                    <td>{quo.serviceItems?.[0]?.productName || "-"}</td>
                    <td>{quo.serviceItems?.[0]?.model || "-"}</td>
                    <td>{quo.notes || "-"}</td>
                    <td className="text-center">
                      <button onClick={() => viewPdf(quo._id)} className="btn btn-sm btn-warning mx-1">View PDF</button>
                      <button onClick={() => sendEmail(quo._id)} className="btn btn-sm btn-dark mx-1">📩 Send Email</button>
                      <button onClick={() => editQuotation(quo._id)} className="btn btn-sm btn-info mx-1">✏️ Edit</button>
                      <button onClick={() => deleteQuotation(quo._id)} className="btn btn-sm btn-danger mx-1">🗑 Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    No quotations found.
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

export default QuotationList;
