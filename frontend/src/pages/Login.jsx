import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (username === "admin" && password === "1234") {
      navigate("/dashboard");
    } else {
      setError("Invalid Admin ID or Password");
    }
  };

  return (
    <div className="container-fluid">
      <div className="row vh-100">

        {/* Left Branding Section */}
        <div 
          className="col-md-6 d-none d-md-flex flex-column justify-content-center align-items-center text-white"
          style={{
            background: "linear-gradient(135deg, #1d2671, #c33764)"
          }}
        >
          <h1 className="display-4 fw-bold">iPremium Care</h1>
          <p className="lead mt-3 text-center px-5">
            Smart Customer Management System <br />
            Manage Jobs, Invoices & Quotations Professionally
          </p>
        </div>

        {/* Right Login Section */}
        <div className="col-md-6 d-flex justify-content-center align-items-center bg-light">

          <div 
            className="p-5 shadow-lg"
            style={{
              width: "400px",
              borderRadius: "20px",
              background: "white"
            }}
          >
            <h3 className="text-center mb-4 fw-bold">Admin Login</h3>

            {error && (
              <div className="alert alert-danger py-2">
                {error}
              </div>
            )}

            <div className="mb-3">
              <label className="form-label fw-semibold">Admin ID</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter Admin ID"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ borderRadius: "10px" }}
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Password</label>
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="form-check mb-3">
              <input className="form-check-input" type="checkbox" />
              <label className="form-check-label">
                Remember me
              </label>
            </div>

            <button
              className="btn btn-primary w-100"
              style={{ borderRadius: "10px" }}
              onClick={handleLogin}
            >
              Login
            </button>

            <div className="text-center mt-3">
              <small className="text-muted">
                iPremium Care © 2026 | Secure Admin Access
              </small>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;