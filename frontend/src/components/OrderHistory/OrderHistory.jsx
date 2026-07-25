import { formatCurrency, formatTime } from "../../utils/format";
import { sortOrdersNewestFirst } from "./orderHistory.functions";
import "./OrderHistory.styles.css";

export default function OrderHistory({ orders }) {
  if (!orders?.length) {
    return (
      <div className="card">
        <h3>Order History</h3>
        <p className="empty">No orders yet.</p>
      </div>
    );
  }

  const sorted = sortOrdersNewestFirst(orders);

  return (
    <div className="card">
      <h3>Order History</h3>
      <table className="data-table">
        <thead>
          <tr><th>Time</th><th>ID</th><th>Stock</th><th>Side</th><th>Qty</th><th>Price</th><th>Realized</th></tr>
        </thead>
        <tbody>
          {sorted.map((o) => (
            <tr key={o.id}>
              <td>{formatTime(o.created_at)}</td>
              <td>{o.transaction_id || o.id}</td>
              <td>{o.symbol}</td>
              <td className={o.side === "buy" ? "positive" : "negative"}>
                {o.side.toUpperCase()}
              </td>
              <td>{o.quantity}</td>
              <td>{formatCurrency(o.price)}</td>
              <td>{formatCurrency(o.realized_profit || 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
