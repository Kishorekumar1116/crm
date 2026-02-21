import { useNavigate } from "react-router-dom";

function Welcome() {
  const navigate = useNavigate();

  return (
    <div>

      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
        <a className="navbar-brand fw-bold">iPremium Care</a>
        <div className="ms-auto">
          <button 
            className="btn btn-outline-light"
            onClick={() => navigate("/login")}
          >
            Admin Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div 
        className="text-white text-center d-flex align-items-center justify-content-center"
        style={{
          height: "90vh",
          background: "linear-gradient(135deg, #1e3c72, #2a5298)"
        }}
      >
        <div>
          <h1 className="display-3 fw-bold">Welcome to iPremium Care </h1>
          <p className="lead mt-3">
            Manage Customers, Jobs, Invoices & Quotations Easily
          </p>

          <button 
            className="btn btn-light btn-lg mt-4 px-4"
            onClick={() => navigate("/login")}
          >
            Get Started
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="container my-5">
        <h2 className="text-center mb-4">Our Features</h2>
        <div className="row text-center">

          <div className="col-md-4 mb-4">
            <div className="card shadow border-0 h-100">
              <div className="card-body">
                <h5 className="card-title">Customer Management</h5>
                <p className="card-text">
                  Store and manage all customer details efficiently.
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="card shadow border-0 h-100">
              <div className="card-body">
                <h5 className="card-title">Invoice Generation</h5>
                <p className="card-text">
                  Create and track invoices easily with one click.
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="card shadow border-0 h-100">
              <div className="card-body">
                <h5 className="card-title">Quotation System</h5>
                <p className="card-text">
                  Generate quotations and manage approvals smoothly.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="bg-dark text-white text-center py-3">
        <p className="mb-0">© 2026 IPemium Care. All Rights Reserved.</p>
      </footer>

    </div>
  );
}

export default Welcome;