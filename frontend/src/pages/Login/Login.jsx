import { Link } from "react-router-dom";
import { useLoginForm } from "./login.functions";
import "./Login.styles.css";

export default function Login() {
  const { email, setEmail, password, setPassword, error, loading, submit } = useLoginForm();

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h2>Welcome back</h2>
        <p className="auth-subtitle">Sign in to your paper trading account</p>
        <form className="auth-form" onSubmit={submit}>
          <label>
            Email
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            Password
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign In"}</button>
        </form>
        <p className="auth-footer">
          No account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
