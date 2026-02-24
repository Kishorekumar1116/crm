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
      setFormData(res.data);
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
      <h2>Edit Invoice</h2>

      <form onSubmit={handleUpdate}>
        <input
          type="text"
          name="name"
          placeholder="Customer Name"
          value={formData.name}
          onChange={handleChange}
          className="form-control mb-3"
        />

        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
          className="form-control mb-3"
        />

        <input
          type="number"
          name="amount"
          placeholder="Amount"
          value={formData.amount}
          onChange={handleChange}
          className="form-control mb-3"
        />

        <input
          type="text"
          name="productName"
          placeholder="Product"
          value={formData.productName}
          onChange={handleChange}
          className="form-control mb-3"
        />

        <button type="submit" className="btn btn-success">
          Update Invoice
        </button>
      </form>
    </div>
  );
}

export default EditInvoice;
