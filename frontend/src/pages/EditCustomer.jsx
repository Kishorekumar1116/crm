import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function EditCustomer() {
  const { id } = useParams(); // get customer ID from URL
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null); // start with null
  const [loading, setLoading] = useState(true); // for loading state

  // Fetch customer details by ID
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await axios.get(`https://ipremium-crm.onrender.com/api/customers/${id}`);
        const customerData = res.data.data || res.data;
        setCustomer(customerData);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch customer details");
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, [id]);

  // Handle input changes
  const handleChange = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`https://ipremium-crm.onrender.com/api/customers/${id}`, customer);
      alert("Customer details updated successfully!");
      navigate("/customers"); // go back to customer list
    } catch (err) {
      console.error(err);
      alert("Failed to update customer.");
    }
  };

  if (loading) return <div className="container mt-5">Loading customer details...</div>;
  if (!customer) return <div className="container mt-5">Customer not found!</div>;

  return (
    <div className="container mt-5">
      <h3 className="mb-4">✏️ Edit Customer</h3>
      <form onSubmit={handleSubmit}>
        {Object.keys(customer).map((key) => (
          <div className="mb-3" key={key}>
            <label className="form-label text-capitalize">
              {key.replace(/([A-Z])/g, " $1")}
            </label>
            <input
              type="text"
              name={key}
              value={customer[key] || ""}
              onChange={handleChange}
              className="form-control"
            />
          </div>
        ))}
        <button type="submit" className="btn btn-primary">
          Save Changes
        </button>
      </form>
    </div>
  );
}

export default EditCustomer;
