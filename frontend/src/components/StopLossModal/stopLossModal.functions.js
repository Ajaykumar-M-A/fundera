import { useState } from "react";
import { setStopLoss } from "../../api/trading";

export function useStopLossModal(position, onClose, onSave) {
  const [value, setValue] = useState(position.stop_loss || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setError("");
    setLoading(true);
    try {
      await setStopLoss(position.id, parseFloat(value));
      onSave?.();
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return { value, setValue, error, loading, save };
}
