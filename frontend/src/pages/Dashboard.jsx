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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const customers = await axios.get("https://ipremium-crm.onrender.com/api/customers");
        const quotations = await axios.get("https://ipremium-crm.onrender.com/api/quotations");
        const invoices = await axios.get("https://ipremium-crm.onrender.com/api/invoices");

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

  const menuButton = (label, path) => (
    <button
      className={`sidebar-btn ${
        location.pathname === path ? "active-btn" : ""
      }`}
      onClick={() => navigate(path)}
    >
      {label}
    </button>
  );

  return (
    <div className="d-flex">

      {/* Sidebar */}
      <div className="sidebar">
        <h4 className="brand-title">iPremium Care</h4>

        {menuButton("Create New Job", "/create-job")}
        {menuButton("Create Invoice", "/invoice")}
        {menuButton("View All Invoices", "/all-invoices")}
        {menuButton("Create Quotation", "/quotation")}
        {menuButton("All Customers", "/customers")}

        <div className="mt-auto">
          <button className="logout-btn" onClick={() => navigate("/")}>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">

        {/* Top Navbar */}
        <div className="topbar">
          <h3>Dashboard Overview</h3>
          <span>{new Date().toDateString()}</span>
        </div>

        {/* Stats Cards */}
        <div className="container mt-4">
          <div className="row g-4">

            <StatCard title="Total Customers" value={stats.totalCustomers} />
            <StatCard title="Total Invoices" value={stats.totalInvoices} />
            <StatCard title="Total Quotations" value={stats.totalQuotations} />
            <StatCard title="Active Jobs" value={stats.activeJobs} />

          </div>

          <div className="welcome-card mt-5">
            <h5>Welcome Admin 👋</h5>
            <p>
              Manage all your CRM operations from this premium dashboard.
              Navigate through jobs, invoices, and quotations using the sidebar.
            </p>
          </div>
        </div>
      </div>

      {/* Premium CSS */}
      <style>{`
        body {
          font-family: 'Poppins', sans-serif;
          background: #f4f6f9;
        }

        .sidebar {
          width: 260px;
          min-height: 100vh;
          padding: 30px 20px;
          display: flex;
          flex-direction: column;
          backdrop-filter: blur(20px);
          background: linear-gradient(160deg,#1e1e2f,#2b2b45);
          color: white;
        }

        .brand-title {
          font-weight: 700;
          text-align: center;
          margin-bottom: 30px;
          letter-spacing: 1px;
        }

        .sidebar-btn {
          background: transparent;
          border: none;
          color: #ccc;
          padding: 12px;
          text-align: left;
          margin-bottom: 10px;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .sidebar-btn:hover {
          background: rgba(255,255,255,0.1);
          color: white;
          transform: translateX(5px);
        }

        .active-btn {
          background: linear-gradient(135deg,#667eea,#764ba2);
          color: white;
          font-weight: 600;
        }

        .logout-btn {
          background: linear-gradient(135deg,#ff4e50,#f9d423);
          border: none;
          padding: 12px;
          border-radius: 8px;
          color: white;
          font-weight: 600;
          width: 100%;
        }

        .main-content {
          flex-grow: 1;
          background: #f4f6f9;
        }

        .topbar {
          background: white;
          padding: 20px 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 15px rgba(0,0,0,0.05);
        }

        .card-custom {
          background: white;
          border-radius: 16px;
          padding: 25px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          transition: all 0.3s ease;
        }

        .card-custom:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.12);
        }

        .card-custom h2 {
          font-weight: 700;
          margin-top: 10px;
        }

        .welcome-card {
          background: white;
          padding: 30px;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
        }
      `}</style>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="col-md-3">
      <div className="card-custom">
        <h6>{title}</h6>
        <h2>{value}</h2>
      </div>
    </div>
  );
}

export default Dashboard;
