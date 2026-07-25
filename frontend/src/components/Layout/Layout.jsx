import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { handleLogout } from "./layout.functions";
import "./Layout.styles.css";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="app">
      <header className="header">
        <div className="header-brand">
          <span className="logo">FundedIn</span>
          <span className="badge">Paper Trading</span>
        </div>
        {user && (
          <nav className="header-nav">
            <Link to="/">Dashboard</Link>
            {user.role === "ADMIN" && <Link to="/admin">Admin</Link>}
            {user.role !== "ADMIN" && <Link to="/watchlists">Watchlists</Link>}
            {user.role !== "ADMIN" && <Link to="/kyc">KYC</Link>}
            <button className="btn-ghost" onClick={() => handleLogout(logout, navigate)}>
              Logout
            </button>
          </nav>
        )}
      </header>
      <main className="main"><Outlet /></main>
    </div>
  );
}
