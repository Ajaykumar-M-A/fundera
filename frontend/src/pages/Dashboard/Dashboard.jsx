import PortfolioCard from "../../components/PortfolioCard/PortfolioCard";
import PriceChart from "../../components/PriceChart/PriceChart";
import OrderForm from "../../components/OrderForm/OrderForm";
import PositionsTable from "../../components/PositionsTable/PositionsTable";
import OrderHistory from "../../components/OrderHistory/OrderHistory";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { formatCurrency } from "../../utils/format";
import { useDashboardData } from "./dashboard.functions";
import "./Dashboard.styles.css";

export default function Dashboard() {
  const { user } = useAuth();
  const {
    price,
    history,
    portfolio,
    positions,
    orders,
    error,
    stocks,
    selectedStock,
    selectedTicker,
    setSelectedTicker,
    overview,
    watchlists,
    notifications,
    refresh,
  } = useDashboardData();

  const waitingApproval = user?.status === "PENDING";
  const rejected = user?.status === "REJECTED";
  const suspended = user?.status === "SUSPENDED";
  const needsKyc = user?.status === "APPROVED" && user?.kyc_status !== "VERIFIED";
  const disabledReason = waitingApproval
    ? "Waiting for Admin Approval"
    : rejected
      ? "Account rejected"
      : suspended
        ? "Account suspended"
        : needsKyc
          ? "KYC verification required"
          : "";

  return (
    <div className="dashboard-grid">
      {disabledReason && (
        <div className="card status-banner">
          <h2>{waitingApproval ? "Waiting for Admin Approval" : disabledReason}</h2>
          {needsKyc && <Link className="btn-sm" to="/kyc">Complete KYC</Link>}
        </div>
      )}
      <StockSearch stocks={stocks} selectedTicker={selectedTicker} setSelectedTicker={setSelectedTicker} />
      <div className="dashboard-top">
        <PriceChart
          key={selectedTicker}
          history={history}
          price={price || selectedStock?.current_price}
          symbol={selectedStock?.ticker || "Stock"}
        />
        <OrderForm stock={selectedStock} onSuccess={refresh} disabledReason={disabledReason} />
      </div>
      {portfolio ? <PortfolioCard portfolio={portfolio} onTopUp={refresh} /> : <InfoCard title="Portfolio Summary" text={error || "Portfolio unlocks after approval and verified KYC."} />}
      <MarketLists overview={overview} />
      <PositionsTable positions={positions} onUpdate={refresh} />
      <WatchlistSummary watchlists={watchlists} />
      <Allocation portfolio={portfolio} />
      <Notifications notifications={notifications} />
      <OrderHistory orders={orders} />
    </div>
  );
}

function StockSearch({ stocks, selectedTicker, setSelectedTicker }) {
  return (
    <div className="card stock-search">
      <h3>Fast Stock Search</h3>
      <input
        list="stock-options"
        value={selectedTicker}
        onChange={(e) => setSelectedTicker(e.target.value.toUpperCase())}
        placeholder="Search company, ticker, sector, industry"
      />
      <datalist id="stock-options">
        {stocks.map((stock) => (
          <option key={stock.id} value={stock.ticker}>{stock.company_name} · {stock.sector}</option>
        ))}
      </datalist>
      <div className="stock-strip">
        {stocks.slice(0, 8).map((stock) => (
          <button key={stock.id} className={stock.ticker === selectedTicker ? "btn-sm active" : "btn-sm"} onClick={() => setSelectedTicker(stock.ticker)}>
            {stock.ticker}
          </button>
        ))}
      </div>
    </div>
  );
}

function MarketLists({ overview }) {
  if (!overview) return <InfoCard title="Market Overview" text="Loading market data..." />;
  return (
    <div className="market-panels">
      <StockList title="Trending Stocks" rows={overview.most_active} />
      <StockList title="Top Gainers" rows={overview.top_gainers} />
      <StockList title="Top Losers" rows={overview.top_losers} />
    </div>
  );
}

function StockList({ title, rows = [] }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <div className="compact-list">
        {rows.map((stock) => (
          <Link key={stock.ticker} to={`/stocks/${stock.ticker}`}>
            <span>{stock.ticker}</span>
            <span>{formatCurrency(stock.price)} · {stock.change_percent}%</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function WatchlistSummary({ watchlists }) {
  return (
    <div className="card">
      <h3>Watchlist</h3>
      {watchlists?.length ? watchlists.map((watchlist) => (
        <div key={watchlist.id} className="watchlist-row">
          <strong>{watchlist.pinned ? "Pinned " : ""}{watchlist.name}</strong>
          <span>{watchlist.stocks.map((stock) => stock.ticker).join(", ") || "No stocks"}</span>
        </div>
      )) : <p className="empty">Create watchlists after account approval and verified KYC.</p>}
    </div>
  );
}

function Allocation({ portfolio }) {
  return (
    <div className="card">
      <h3>Sector Allocation</h3>
      {portfolio?.sector_allocation?.length ? portfolio.sector_allocation.map((item) => (
        <div key={item.sector} className="allocation-row">
          <span>{item.sector}</span>
          <progress value={item.percent} max="100" />
          <span>{item.percent}%</span>
        </div>
      )) : <p className="empty">No allocation yet.</p>}
      {portfolio?.top_holding && <p className="hint">Top holding: {portfolio.top_holding.symbol}</p>}
    </div>
  );
}

function Notifications({ notifications }) {
  return (
    <div className="card">
      <h3>Notifications</h3>
      {notifications?.length ? notifications.slice(0, 5).map((item) => (
        <p key={item.id} className="notice-line"><strong>{item.title}</strong> {item.message}</p>
      )) : <p className="empty">No notifications yet.</p>}
    </div>
  );
}

function InfoCard({ title, text }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <p className="empty">{text}</p>
    </div>
  );
}
