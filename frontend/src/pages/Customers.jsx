import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Customers() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await axios.get("https://ipremium-crm.onrender.com/api/customers");
        // ensure data is always an array
        setData(res.data.data || res.data || []);
      } catch (err) {
        console.log(err);
      }
    };
    fetchCustomers();
  }, []);

  const filteredData = data.filter(
    (item) =>
      (item.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.phone || "").includes(search) ||
      (item.productName || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mt-5">
      <div className="card shadow-lg p-4">
        <h3 className="mb-4 fw-bold text-center">👥 All Customers</h3>

        <input
          type="text"
          className="form-control mb-3"
          placeholder="Search by name, phone or product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="table-responsive">
          <table className="table table-striped table-hover table-bordered">
            <thead className="table-dark text-center">
              <tr>
               
                <th>IPC No</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Company</th>
                <th>GST</th>
                <th>Address</th>
                <th>City</th>
                <th>Product</th>
                <th>Brand</th>
                <th>Model</th>
                <th>Serial No</th>
                <th>Issue</th>
                <th>Additional Issues</th>
                <th>Technician</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
               filteredData.map((item, index) => (
                  <tr key={item._id} className="text-center">
                    
<td>
  {item.ipcNumber
    ? `IPC-${String(item.ipcNumber).padStart(3, "0")}`
    : "—"}
</td>
                    <td>{item.name || "—"}</td>
                    <td>{item.phone || "—"}</td>
                    <td>{item.email || "—"}</td>
                    <td>{item.company || "—"}</td>
                    <td>{item.gst || "—"}</td>
                    <td>{`${item.address1 || ""} ${item.address2 || ""}`.trim() || "—"}</td>
                    <td>{item.city || "—"}</td>
                    <td>{item.productName || "—"}</td>
                    <td>{item.brand || "—"}</td>
                    <td>{item.model || "—"}</td>
                    <td>{item.serialNo || "—"}</td>
                    <td>{item.issue || "—"}</td>
                    <td>{item.additionalIssues || "—"}</td>
                    <td>{item.technician || "—"}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-success me-1 mb-1"
                        onClick={() => navigate(`/invoice?customerId=${item._id}`)}
                      >
                        Invoice
                      </button>
                      <button
                        className="btn btn-sm btn-warning mb-1"
                        onClick={() => navigate(`/quotation?customerId=${item._id}`)}
                      >
                        Quotation
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                 <td colSpan="16" className="text-center">
                    No customers found
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

export default Customers;
