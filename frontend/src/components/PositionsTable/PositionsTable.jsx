import { formatCurrency, formatPnl } from "../../utils/format";
import StopLossModal from "../StopLossModal/StopLossModal";
import { usePositionsTable } from "./positionsTable.functions";
import "./PositionsTable.styles.css";

export default function PositionsTable({ positions, onUpdate }) {
  const { selected, select, clear } = usePositionsTable();

  if (!positions.length) {
    return (
      <div className="card">
        <h3>Open Positions</h3>
        <p className="empty">No open positions. Place a buy order to get started.</p>
      </div>
    );
  }

  return (
    <>
      <div className="card">
        <h3>Open Positions</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Symbol</th><th>Qty</th><th>Entry</th><th>Current</th>
              <th>P&L</th><th>Stop Loss</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((p) => (
              <tr key={p.id}>
                <td>{p.symbol}</td>
                <td>{p.quantity}</td>
                <td>{formatCurrency(p.entry_price)}</td>
                <td>{formatCurrency(p.current_price)}</td>
                <td className={p.unrealized_pnl >= 0 ? "positive" : "negative"}>
                  {formatPnl(p.unrealized_pnl)}
                </td>
                <td>{p.stop_loss ? formatCurrency(p.stop_loss) : "—"}</td>
                <td>
                  <button className="btn-sm" onClick={() => select(p)}>Set Stop</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selected && (
        <StopLossModal position={selected} onClose={clear} onSave={onUpdate} />
      )}
    </>
  );
}
