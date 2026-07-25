import { useCallback, useEffect, useState } from "react";
import { fetchOrders, fetchPortfolio, fetchPositions } from "../api/trading";

export function usePortfolio(pollMs = 3000) {
  const [portfolio, setPortfolio] = useState(null);
  const [positions, setPositions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const [p, pos, ord] = await Promise.all([
        fetchPortfolio(), fetchPositions(), fetchOrders(),
      ]);
      setPortfolio(p);
      setPositions(pos);
      setOrders(ord);
      setError("");
    } catch (err) {
      setError(err.message);
      setPortfolio(null);
      setPositions([]);
      setOrders([]);
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, pollMs);
    return () => clearInterval(id);
  }, [refresh, pollMs]);

  return { portfolio, positions, orders, error, refresh };
}
