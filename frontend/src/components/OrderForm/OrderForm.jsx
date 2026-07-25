import { useOrderForm } from "./orderForm.functions";
import "./OrderForm.styles.css";

export default function OrderForm({ stock, onSuccess, disabledReason }) {
  const { quantity, setQuantity, loading, error, estCost, submit } =
    useOrderForm(stock, onSuccess);

  return (
    <div className="card order-form">
      <h3>Place Order</h3>
      <label>
        Quantity {stock ? `(${stock.ticker})` : ""}
        <input
          type="number"
          step="1"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          disabled={Boolean(disabledReason)}
        />
      </label>
      <p className="hint">Est. cost: ${estCost}</p>
      {disabledReason && <p className="warning">{disabledReason}</p>}
      {error && <p className="error">{error}</p>}
      <div className="order-buttons">
        <button className="btn-buy" disabled={loading || Boolean(disabledReason) || !stock} onClick={() => submit("buy")}>
          Market Buy
        </button>
        <button className="btn-sell" disabled={loading || Boolean(disabledReason) || !stock} onClick={() => submit("sell")}>
          Market Sell
        </button>
      </div>
    </div>
  );
}
