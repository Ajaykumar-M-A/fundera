import { useState } from "react";
import { formatCurrency, formatPnl } from "../../utils/format";
import { getPnlClass } from "./portfolioCard.functions";
import { topUpFunds } from "../../api/trading";
import "./PortfolioCard.styles.css";

export default function PortfolioCard({ portfolio, onTopUp }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (!portfolio) return <div className="card skeleton">Loading portfolio...</div>;

  const pnlClass = getPnlClass(portfolio.total_pnl);

  const handleTopUp = async () => {
    setMessage("");
    setLoading(true);
    try {
      await topUpFunds();
      setMessage("Demo funds added. Portfolio refreshed.");
      onTopUp?.();
    } catch (err) {
      setMessage(err?.message || "Unable to top up funds.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card portfolio-card">
      <h3>Portfolio</h3>
      <div className="stats-grid">
        <Stat label="Balance" value={formatCurrency(portfolio.balance)} />
        <Stat label="Equity" value={formatCurrency(portfolio.equity)} />
        <Stat label="Unrealized P&L" value={formatPnl(portfolio.total_pnl)} className={pnlClass} />
        <Stat label="Open Positions" value={portfolio.open_positions} />
        <Stat label="Exposure" value={formatCurrency(portfolio.total_exposure)} />
        <Stat label="Portfolio Value" value={formatCurrency(portfolio.portfolio_value)} />
        <Stat label="Buying Power" value={formatCurrency(portfolio.buying_power)} />
        <Stat label="Today's Return" value={`${portfolio.todays_return_percent}%`} />
        <Stat label="Total Return" value={`${portfolio.total_return_percent}%`} />
      </div>
      <div className="portfolio-actions">
        <button className="btn-sm" onClick={handleTopUp} disabled={loading}>
          {loading ? "Topping up..." : "Top up demo funds"}
        </button>
        {message && <p className="hint">{message}</p>}
      </div>
    </div>
  );
}

function Stat({ label, value, className = "" }) {
  return (
    <div className="stat">
      <span className="stat-label">{label}</span>
      <span className={`stat-value ${className}`}>{value}</span>
    </div>
  );
}
