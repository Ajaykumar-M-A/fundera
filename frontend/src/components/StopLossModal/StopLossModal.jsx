import { useStopLossModal } from "./stopLossModal.functions";
import "./StopLossModal.styles.css";

export default function StopLossModal({ position, onClose, onSave }) {
  const { value, setValue, error, loading, save } = useStopLossModal(position, onClose, onSave);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Set Stop-Loss — {position.symbol}</h3>
        <p className="hint">Entry: ${position.entry_price.toLocaleString()}</p>
        <label>
          Stop-loss price
          <input type="number" step="0.01" value={value} onChange={(e) => setValue(e.target.value)} />
        </label>
        {error && <p className="error">{error}</p>}
        <div className="modal-actions">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-buy" disabled={loading} onClick={save}>Save</button>
        </div>
      </div>
    </div>
  );
}
