import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalInvoices: 0,
    totalQuotations: 0,
    activeJobs: 0
  });

  // Fetch data from backend (dummy now)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Example API calls
        const customers = await axios.get("http://localhost:5000/api/customers");
        const quotations = await axios.get("http://localhost:5000/api/quotations");
        const invoices = await axios.get("http://localhost:5000/api/invoices");

        setStats({
          totalCustomers: customers.data.data?.length || customers.data.length || 0,
          totalInvoices: invoices.data.data?.length || invoices.data.length || 0,
          totalQuotations: quotations.data.data?.length || quotations.data.length || 0,
          activeJobs: customers.data.data?.filter(j => j.status !== "Delivered").length || 0
        });
      } catch (err) {
        console.log("Error fetching stats", err);
      }
    };

    fetchStats();
  }, []);

  const menuButton = (label, path, color) => (
    <button
      className={`btn w-100 mb-3 ${
        location.pathname === path ? "btn-light text-dark fw-bold" : `btn-outline-${color}`
      }`}
      onClick={() => navigate(path)}
    >
      {label}
    </button>
  );

  return (
    <div className="d-flex">

      {/* Sidebar */}
      <div className="bg-dark text-white p-4" style={{ width: "260px", minHeight: "100vh" }}>
        <h4 className="fw-bold mb-4 text-center">iPremium Care</h4>

        {menuButton("Create New Job", "/create-job", "light")}
        {menuButton("Create Invoice", "/invoice", "success")}
        {menuButton("View All Invoices", "/all-invoices", "warning")}
        {menuButton("Create Quotation", "/quotation", "info")}
        {menuButton("All Customers", "/customers", "secondary")}


        <hr className="border-light" />

        <button className="btn btn-outline-danger w-100" onClick={() => navigate("/")}>
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 bg-light">

        {/* Top Navbar */}
        <div className="d-flex justify-content-between align-items-center px-4 py-3 shadow-sm" style={{ background: "white" }}>
          <h3 className="mb-0 fw-bold">iPremium Care Dashboard</h3>
          <span className="text-muted">{new Date().toDateString()}</span>
        </div>

        {/* Stats Cards */}
        <div className="container mt-4">
          <div className="row">
            <div className="col-md-3 mb-4">
              <div className="card shadow-lg border-0 text-white" style={{ background: "linear-gradient(135deg,#667eea,#764ba2)" }}>
                <div className="card-body">
                  <h6>Total Customers</h6>
                  <h2>{stats.totalCustomers}</h2>
                </div>
              </div>
            </div>

            <div className="col-md-3 mb-4">
              <div className="card shadow-lg border-0 text-white" style={{ background: "linear-gradient(135deg,#f7971e,#ffd200)" }}>
                <div className="card-body">
                  <h6>Total Invoices</h6>
                  <h2>{stats.totalInvoices}</h2>
                </div>
              </div>
            </div>

            <div className="col-md-3 mb-4">
              <div className="card shadow-lg border-0 text-white" style={{ background: "linear-gradient(135deg,#11998e,#38ef7d)" }}>
                <div className="card-body">
                  <h6>Total Quotations</h6>
                  <h2>{stats.totalQuotations}</h2>
                </div>
              </div>
            </div>

            <div className="col-md-3 mb-4">
              <div className="card shadow-lg border-0 text-white" style={{ background: "linear-gradient(135deg,#fc4a1a,#f7b733)" }}>
                <div className="card-body">
                  <h6>Active Jobs</h6>
                  <h2>{stats.activeJobs}</h2>
                </div>
              </div>
            </div>
          </div>

          {/* Welcome Card */}
          <div className="card shadow border-0 mt-4">
            <div className="card-body">
              <h5>Welcome Admin 👋</h5>
              <p>
                Manage all your CRM operations from this premium dashboard. 
                Navigate through jobs, invoices, and quotations from the sidebar.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Dashboard;