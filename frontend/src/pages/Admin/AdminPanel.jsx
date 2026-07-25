import { useEffect, useMemo, useState } from "react";
import {
  adminUserAction,
  createAdminStock,
  deleteAdminStock,
  fetchAdminKyc,
  fetchAdminStats,
  fetchAdminStocks,
  fetchAdminUsers,
  reviewKyc,
  updateAdminStock,
} from "../../api/trading";
import { formatCurrency } from "../../utils/format";
import "./AdminPanel.styles.css";

const EMPTY_STOCK = {
  company_name: "",
  ticker: "",
  exchange: "NSE",
  sector: "",
  industry: "",
  logo_url: "",
  market_cap: 0,
  pe_ratio: 0,
  dividend_yield: 0,
  today_open: 0,
  previous_close: 0,
  week_52_high: 0,
  week_52_low: 0,
  current_price: 0,
  available_quantity: 0,
  volume: 0,
  company_description: "",
};

export default function AdminPanel() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [kyc, setKyc] = useState([]);
  const [stockForm, setStockForm] = useState(EMPTY_STOCK);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const pendingUsers = useMemo(() => users.filter((user) => user.status === "PENDING"), [users]);

  const refresh = async () => {
    const [nextStats, nextUsers, nextStocks, nextKyc] = await Promise.all([
      fetchAdminStats(),
      fetchAdminUsers(),
      fetchAdminStocks(),
      fetchAdminKyc(),
    ]);
    setStats(nextStats);
    setUsers(nextUsers);
    setStocks(nextStocks);
    setKyc(nextKyc);
  };

  useEffect(() => {
    refresh().catch((err) => setMessage(err.message));
  }, []);

  const changeUser = async (id, action) => {
    await adminUserAction(id, action);
    await refresh();
  };

  const submitStock = async (event) => {
    event.preventDefault();
    const payload = normalizeStock(stockForm);
    if (editingId) {
      await updateAdminStock(editingId, payload);
    } else {
      await createAdminStock(payload);
    }
    setStockForm(EMPTY_STOCK);
    setEditingId(null);
    await refresh();
  };

  const editStock = (stock) => {
    setEditingId(stock.id);
    setStockForm({ ...EMPTY_STOCK, ...stock });
  };

  const removeStock = async (id) => {
    await deleteAdminStock(id);
    await refresh();
  };

  const setTrading = async (stock, trading_enabled) => {
    await updateAdminStock(stock.id, { trading_enabled });
    await refresh();
  };

  const updateKyc = async (id, status) => {
    await reviewKyc(id, status, status === "REJECTED" ? "Documents did not pass verification." : "");
    await refresh();
  };

  return (
    <div className="admin-page">
      {message && <p className="error">{message}</p>}
      <Stats stats={stats} />
      <section className="card">
        <h3>Pending Users</h3>
        <UserTable users={pendingUsers} onAction={changeUser} />
      </section>
      <section className="card">
        <h3>All Users</h3>
        <UserTable users={users} onAction={changeUser} />
      </section>
      <section className="admin-split">
        <StockForm
          stockForm={stockForm}
          setStockForm={setStockForm}
          editingId={editingId}
          onCancel={() => {
            setEditingId(null);
            setStockForm(EMPTY_STOCK);
          }}
          onSubmit={submitStock}
        />
        <KycQueue items={kyc} onReview={updateKyc} />
      </section>
      <section className="card">
        <h3>Stocks</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Ticker</th><th>Company</th><th>Sector</th><th>Price</th><th>Qty</th><th>Trading</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock) => (
              <tr key={stock.id}>
                <td>{stock.ticker}</td>
                <td>{stock.company_name}</td>
                <td>{stock.sector}</td>
                <td>{formatCurrency(stock.current_price)}</td>
                <td>{stock.available_quantity}</td>
                <td>{stock.trading_enabled ? "Enabled" : "Disabled"}</td>
                <td className="table-actions">
                  <button className="btn-sm" onClick={() => editStock(stock)}>Edit</button>
                  <button className="btn-sm" onClick={() => setTrading(stock, !stock.trading_enabled)}>
                    {stock.trading_enabled ? "Disable" : "Enable"}
                  </button>
                  <button className="btn-sm danger" onClick={() => removeStock(stock.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function Stats({ stats }) {
  if (!stats) return <div className="card skeleton">Loading admin analytics...</div>;
  const values = [
    ["Total Users", stats.total_users],
    ["Pending Users", stats.pending_users],
    ["Verified Users", stats.verified_users],
    ["Pending KYC", stats.pending_kyc],
    ["Total Trades", stats.total_trades],
    ["Revenue", formatCurrency(stats.revenue)],
    ["Most Bought", stats.most_bought_stock || "-"],
    ["Most Sold", stats.most_sold_stock || "-"],
    ["Trading Volume", stats.trading_volume],
  ];
  return (
    <section className="card">
      <h3>Admin Analytics</h3>
      <div className="stats-grid">
        {values.map(([label, value]) => (
          <div className="stat" key={label}>
            <span className="stat-label">{label}</span>
            <span className="stat-value">{value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function UserTable({ users, onAction }) {
  if (!users.length) return <p className="empty">No users found.</p>;

  const renderActions = (user) => {
    if (user.status === "PENDING") {
      return (
        <>
          <button className="btn-sm" onClick={() => onAction(user.id, "approve")}>Approve</button>
          <button className="btn-sm" onClick={() => onAction(user.id, "reject")}>Reject</button>
        </>
      );
    }

    if (user.status === "APPROVED") {
      return <button className="btn-sm" onClick={() => onAction(user.id, "suspend")}>Suspend</button>;
    }

    if (user.status === "SUSPENDED" || user.status === "REJECTED") {
      return <button className="btn-sm" onClick={() => onAction(user.id, "activate")}>Activate</button>;
    }

    return null;
  };

  return (
    <table className="data-table">
      <thead>
        <tr><th>Name</th><th>Email</th><th>Status</th><th>KYC</th><th>Actions</th></tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td>{user.full_name}</td>
            <td>{user.email}</td>
            <td>{user.status}</td>
            <td>{user.kyc_status}</td>
            <td className="table-actions">{renderActions(user)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function StockForm({ stockForm, setStockForm, editingId, onCancel, onSubmit }) {
  const setField = (field, value) => setStockForm((current) => ({ ...current, [field]: value }));
  const fields = [
    ["company_name", "Company"], ["ticker", "Ticker"], ["exchange", "Exchange"], ["sector", "Sector"],
    ["industry", "Industry"], ["logo_url", "Logo URL"], ["current_price", "Current Price"],
    ["available_quantity", "Available Quantity"], ["market_cap", "Market Cap"], ["today_open", "Today's Open"],
    ["previous_close", "Previous Close"], ["week_52_high", "52 Week High"], ["week_52_low", "52 Week Low"],
    ["volume", "Volume"], ["pe_ratio", "P/E Ratio"], ["dividend_yield", "Dividend Yield"],
  ];
  return (
    <form className="card admin-stock-form" onSubmit={onSubmit}>
      <h3>{editingId ? "Edit Stock" : "Add Stock"}</h3>
      <div className="admin-form-grid">
        {fields.map(([field, label]) => (
          <label key={field}>
            {label}
            <input
              value={stockForm[field] ?? ""}
              onChange={(event) => setField(field, event.target.value)}
              required={["company_name", "ticker"].includes(field)}
            />
          </label>
        ))}
      </div>
      <label>
        Company Description
        <textarea value={stockForm.company_description || ""} onChange={(event) => setField("company_description", event.target.value)} />
      </label>
      <div className="order-buttons">
        <button type="submit">{editingId ? "Save Stock" : "Add Stock"}</button>
        {editingId && <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}

function KycQueue({ items, onReview }) {
  return (
    <section className="card">
      <h3>KYC Queue</h3>
      {items.length ? items.map((item) => (
        <div key={item.id} className="kyc-row">
          <strong>User #{item.user_id}</strong>
          <span>{item.status} · {item.phone_number} · {item.bank_name}</span>
          <div className="table-actions">
            <button className="btn-sm" onClick={() => onReview(item.id, "VERIFIED")}>Verify</button>
            <button className="btn-sm danger" onClick={() => onReview(item.id, "REJECTED")}>Reject</button>
          </div>
        </div>
      )) : <p className="empty">No KYC submissions.</p>}
    </section>
  );
}

function normalizeStock(stock) {
  const numeric = [
    "market_cap", "pe_ratio", "dividend_yield", "today_open", "previous_close",
    "week_52_high", "week_52_low", "current_price", "available_quantity", "volume",
  ];
  return Object.fromEntries(
    Object.entries(stock).map(([key, value]) => [key, numeric.includes(key) ? Number(value || 0) : value])
  );
}
