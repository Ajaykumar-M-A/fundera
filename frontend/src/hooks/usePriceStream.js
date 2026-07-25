import { useEffect, useRef, useState } from "react";
import { fetchPriceHistory } from "../api/trading";

const WS_URL = import.meta.env.VITE_WS_URL
  || (import.meta.env.DEV ? `ws://${window.location.host}` : `ws://${window.location.hostname}:8000`);

export function usePriceStream(symbol = "RELIANCE") {
  const [price, setPrice] = useState(null);
  const [history, setHistory] = useState([]);
  const wsRef = useRef(null);

  useEffect(() => {
    setPrice(null);
    setHistory([]);

    fetchPriceHistory(symbol)
      .then((data) => setHistory(data.prices || []))
      .catch(() => {});

    const ws = new WebSocket(`${WS_URL}/api/market/ws`);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      const tick = JSON.parse(e.data);
      if (tick.symbol !== symbol) return;
      setPrice(tick.price);
      setHistory((prev) => [...prev.slice(-119), { price: tick.price, timestamp: tick.timestamp }]);
    };

    ws.onerror = () => {
      // Keep the stream alive if possible; reconnect happens when symbol changes.
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [symbol]);

  return { price, history };
}
