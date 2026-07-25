import { useState } from "react";
import { placeOrder } from "../../api/trading";

export function useOrderForm(stock, onSuccess) {
  const [quantity, setQuantity] = useState("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const estCost = stock?.current_price ? (parseFloat(quantity || 0) * stock.current_price).toFixed(2) : "—";

  const submit = async (side) => {
    setError("");
    setLoading(true);
    try {
      await placeOrder(stock.ticker, side, parseFloat(quantity));
      onSuccess?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return { quantity, setQuantity, loading, error, estCost, submit };
}
