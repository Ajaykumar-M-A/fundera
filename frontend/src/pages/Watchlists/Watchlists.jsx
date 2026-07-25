import { useEffect, useMemo, useState } from "react";
import {
  addToWatchlist,
  createWatchlist,
  fetchStocks,
  fetchWatchlists,
  removeFromWatchlist,
  updateWatchlist,
} from "../../api/trading";
import { formatCurrency } from "../../utils/format";
import "./Watchlists.styles.css";

export default function Watchlists() {
  const [watchlists, setWatchlists] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("ticker");
  const [message, setMessage] = useState("");

  const refresh = async () => {
    const [nextWatchlists, nextStocks] = await Promise.all([fetchWatchlists(), fetchStocks()]);
    setWatchlists(nextWatchlists);
    setStocks(nextStocks);
  };

  useEffect(() => {
    refresh().catch((err) => setMessage(err.message));
  }, []);

  const filteredStocks = useMemo(() => {
    const term = query.trim().toLowerCase();
    return stocks
      .filter((stock) => !term || [stock.company_name, stock.ticker, stock.sector, stock.industry].some((value) => value?.toLowerCase().includes(term)))
      .sort((a, b) => String(a[sort] || "").localeCompare(String(b[sort] || "")));
  }, [stocks, query, sort]);

  const create = async (event) => {
    event.preventDefault();
    if (!name.trim()) return;
    await createWatchlist(name.trim());
    setName("");
    await refresh();
  };

  const togglePin = async (watchlist) => {
    await updateWatchlist(watchlist.id, { pinned: !watchlist.pinned });
    await refresh();
  };

  const addStock = async (watchlistId, stockId) => {
    await addToWatchlist(watchlistId, stockId);
    await refresh();
  };

  const removeStock = async (watchlistId, stockId) => {
    await removeFromWatchlist(watchlistId, stockId);
    await refresh();
  };

  return (
    <div className="watchlists-page">
      {message && <p className="error">{message}</p>}
      <section className="card">
        <h3>Create Watchlist</h3>
        <form className="watchlist-create" onSubmit={create}>
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Watchlist name" />
          <button type="submit">Create</button>
        </form>
      </section>
      <section className="watchlist-layout">
        <div className="card">
          <h3>Watchlists</h3>
          {watchlists.length ? watchlists.map((watchlist) => (
            <div className="watchlist-card-row" key={watchlist.id}>
              <div className="watchlist-title">
                <strong>{watchlist.name}</strong>
                <button className={watchlist.pinned ? "btn-sm active" : "btn-sm"} onClick={() => togglePin(watchlist)}>
                  {watchlist.pinned ? "Pinned" : "Pin"}
                </button>
              </div>
              <div className="compact-list">
                {watchlist.stocks.map((stock) => (
                  <button key={stock.id} className="watchlist-stock" onClick={() => removeStock(watchlist.id, stock.id)}>
                    <span>{stock.ticker}</span>
                    <span>Remove</span>
                  </button>
                ))}
              </div>
            </div>
          )) : <p className="empty">No watchlists yet.</p>}
        </div>
        <div className="card">
          <h3>Add Stocks</h3>
          <div className="stock-tools">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by company, ticker, sector, industry" />
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="ticker">Ticker</option>
              <option value="company_name">Company</option>
              <option value="sector">Sector</option>
              <option value="industry">Industry</option>
            </select>
          </div>
          <div className="compact-list">
            {filteredStocks.slice(0, 25).map((stock) => (
              <div className="stock-add-row" key={stock.id}>
                <span>{stock.ticker} · {stock.company_name} · {formatCurrency(stock.current_price)}</span>
                <select onChange={(event) => event.target.value && addStock(Number(event.target.value), stock.id)} defaultValue="">
                  <option value="">Add to...</option>
                  {watchlists.map((watchlist) => <option key={watchlist.id} value={watchlist.id}>{watchlist.name}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
