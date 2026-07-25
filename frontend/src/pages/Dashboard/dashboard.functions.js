import { usePriceStream } from "../../hooks/usePriceStream";
import { usePortfolio } from "../../hooks/usePortfolio";
import { useEffect, useState } from "react";
import { fetchMarketOverview, fetchNotifications, fetchStocks, fetchWatchlists } from "../../api/trading";

export function useDashboardData() {
  const [stocks, setStocks] = useState([]);
  const [selectedTicker, setSelectedTicker] = useState("RELIANCE");
  const [overview, setOverview] = useState(null);
  const [watchlists, setWatchlists] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const { price, history } = usePriceStream(selectedTicker);
  const { portfolio, positions, orders, error, refresh } = usePortfolio();

  useEffect(() => {
    fetchStocks().then((items) => {
      setStocks(items);
      if (items[0] && !items.find((item) => item.ticker === selectedTicker)) {
        setSelectedTicker(items[0].ticker);
      }
    }).catch(() => {});
    fetchMarketOverview().then(setOverview).catch(() => {});
    fetchNotifications().then(setNotifications).catch(() => {});
    fetchWatchlists().then(setWatchlists).catch(() => {});
  }, []);

  const selectedStock = stocks.find((stock) => stock.ticker === selectedTicker) || stocks[0];
  return {
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
  };
}
