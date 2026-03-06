import { useEffect, useState } from "react";
import axios from "axios";

function Customers() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [editCustomer, setEditCustomer] = useState(null); // currently editing customer

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await axios.get("https://ipremium-crm.onrender.com/api/customers");
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

  // Handle input changes in edit form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditCustomer((prev) => ({ ...prev, [name]: value }));
  };

  // Submit edited customer
  const handleUpdate = async () => {
    try {
      await axios.put(`https://ipremium-crm.onrender.com/api/customers/${editCustomer._id}`, editCustomer);
      // Update local state to reflect changes
      setData((prev) =>
        prev.map((c) => (c._id === editCustomer._id ? editCustomer : c))
      );
      setEditCustomer(null); // close modal
      alert("Customer updated!");
    } catch (err) {
      console.error(err);
      alert("Failed to update customer");
    }
  };

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
                filteredData.map((item) => (
                  <tr key={item._id} className="text-center">
                    <td>{item.ipcNumber ? `IPC-${String(item.ipcNumber).padStart(3, "0")}` : "—"}</td>
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
                        className="btn btn-sm btn-primary"
                        onClick={() => setEditCustomer(item)}
                      >
                        Edit
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

      {/* Edit Modal */}
      {editCustomer && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content p-3">
              <h5>Edit Customer</h5>
              <div className="row">
                {Object.keys(editCustomer).map((key) => (
                  key !== "_id" && key !== "__v" && (
                    <div className="col-md-6 mb-2" key={key}>
                      <label className="form-label">{key}</label>
                      <input
                        type="text"
                        name={key}
                        className="form-control"
                        value={editCustomer[key] || ""}
                        onChange={handleChange}
                      />
                    </div>
                  )
                ))}
              </div>
              <div className="mt-3 text-end">
                <button className="btn btn-secondary me-2" onClick={() => setEditCustomer(null)}>
                  Cancel
                </button>
                <button className="btn btn-success" onClick={handleUpdate}>
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customers;
