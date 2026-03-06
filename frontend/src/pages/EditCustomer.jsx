import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function EditCustomer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
    gst: "",
    address1: "",
    address2: "",
    city: "",
    productName: "",
    brand: "",
    model: "",
    serialNo: "",
    issue: "",
    additionalIssues: "",
    technician: "",
  });

  useEffect(() => {
  const fetchCustomer = async () => {
    try {
      const res = await axios.get(`https://ipremium-crm.onrender.com/api/customers/${id}`);
      // Check if the API returns res.data.data or just res.data
      const customerData = res.data.data || res.data;
      setCustomer(customerData);
    } catch (err) {
      console.error(err);
    }
  };
  fetchCustomer();
}, [id]);

  const handleChange = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`https://ipremium-crm.onrender.com/api/customers/${id}`, customer);
      navigate("/customers");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container mt-5">
      <h3 className="mb-4">✏️ Edit Customer</h3>
      <form onSubmit={handleSubmit}>
        {Object.keys(customer).map((key) => (
          <div className="mb-3" key={key}>
            <label className="form-label text-capitalize">{key.replace(/([A-Z])/g, " $1")}</label>
            <input
              type="text"
              name={key}
              value={customer[key]}
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
