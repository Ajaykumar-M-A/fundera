import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  addToWatchlist,
  createWatchlist,
  fetchStock,
  fetchStockChart,
  fetchStocks,
  fetchWatchlists,
  removeFromWatchlist,
} from "../../api/trading";
import { formatCurrency } from "../../utils/format";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./StockDetails.styles.css";

const RANGES = ["1D", "1W", "1M", "3M", "6M", "1Y", "5Y", "ALL"];

export default function StockDetails() {
  const { ticker } = useParams();
  const [stock, setStock] = useState(null);
  const [range, setRange] = useState("1M");
  const [chart, setChart] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [watchlists, setWatchlists] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchStock(ticker).then(setStock);
    fetchStocks().then(setStocks);
    fetchWatchlists().then(setWatchlists).catch(() => {});
  }, [ticker]);

  useEffect(() => {
    fetchStockChart(ticker, range).then(setChart);
  }, [ticker, range]);

  const related = useMemo(
    () => stocks.filter((item) => item.ticker !== ticker && item.sector === stock?.sector).slice(0, 6),
    [stocks, stock, ticker]
  );
  const defaultWatchlist = watchlists[0];
  const isAdded = defaultWatchlist?.stocks?.some((item) => item.id === stock?.id);

  const toggleWatchlist = async () => {
    if (!stock) return;
    try {
      let target = defaultWatchlist;
      if (!target) {
        target = await createWatchlist("Favorites");
      }
      const updated = isAdded
        ? await removeFromWatchlist(target.id, stock.id)
        : await addToWatchlist(target.id, stock.id);
      setWatchlists((current) => [updated, ...current.filter((item) => item.id !== updated.id)]);
      setMessage(isAdded ? "Removed from watchlist." : "Added to watchlist.");
    } catch (err) {
      setMessage(err.message);
    }
  };

  if (!stock) return <div className="card skeleton">Loading stock...</div>;

  return (
    <div className="stock-detail-page">
      <section className="stock-hero card">
        <div>
          <h2>{stock.company_name}</h2>
          <p>{stock.ticker} · {stock.exchange} · {stock.sector} · {stock.industry}</p>
        </div>
        <div className="stock-hero-actions">
          <strong>{formatCurrency(stock.current_price)}</strong>
          <button className="btn-sm" onClick={toggleWatchlist}>{isAdded ? "Remove" : "Add"} Watchlist</button>
        </div>
      </section>
      {message && <p className="hint">{message}</p>}
      <section className="card">
        <div className="chart-header">
          <h3>Professional Chart</h3>
          <div className="range-tabs">
            {RANGES.map((item) => (
              <button key={item} className={item === range ? "btn-sm active" : "btn-sm"} onClick={() => setRange(item)}>
                {item}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={chart?.candles || []}>
            <CartesianGrid stroke="#243044" />
            <XAxis dataKey="time" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="price" domain={["auto", "auto"]} tick={{ fontSize: 11 }} />
            <YAxis yAxisId="volume" orientation="right" tick={{ fontSize: 11 }} />
            <Tooltip formatter={(value) => typeof value === "number" ? value.toFixed(2) : value} />
            <Bar yAxisId="price" dataKey="high" fill="#22c55e" opacity={0.25} animationDuration={500} />
            <Bar yAxisId="price" dataKey="low" fill="#ef4444" opacity={0.25} animationDuration={500} />
            <Line yAxisId="price" type="monotone" dataKey="close" stroke="#22c55e" dot={false} strokeWidth={2} />
            <Line yAxisId="price" type="monotone" dataKey="moving_average" stroke="#f59e0b" dot={false} strokeWidth={2} />
            <Bar yAxisId="volume" dataKey="volume" fill="#8b9bb4" opacity={0.3} />
          </ComposedChart>
        </ResponsiveContainer>
        <div className="indicator-row">
          <span>Support {formatCurrency(chart?.support || 0)}</span>
          <span>Resistance {formatCurrency(chart?.resistance || 0)}</span>
          <span>Trend {chart?.indicators?.trend || "neutral"}</span>
        </div>
      </section>
      <section className="stock-grid">
        <Fundamentals stock={stock} />
        <section className="card">
          <h3>Volume</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chart?.candles || []}>
              <XAxis dataKey="time" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="volume" fill="#22c55e" animationDuration={500} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </section>
      <section className="stock-grid">
        <TextPanel title="About Company" text={stock.company_description} />
        <TextPanel title="Financial Summary" text={stock.financial_summary} />
        <TextPanel title="Latest News" text={(stock.latest_news || "").split("|").join("\n")} />
      </section>
      <section className="card">
        <h3>Related Stocks</h3>
        <div className="stock-strip">
          {related.map((item) => (
            <Link className="btn-sm" key={item.id} to={`/stocks/${item.ticker}`}>{item.ticker}</Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function Fundamentals({ stock }) {
  const rows = [
    ["CEO", stock.ceo || "-"], ["Employees", stock.employees || "-"], ["Market Cap", formatCurrency(stock.market_cap)],
    ["EPS", stock.eps], ["PE Ratio", stock.pe_ratio], ["Dividend", `${stock.dividend_yield}%`],
    ["Beta", stock.beta], ["Book Value", stock.book_value], ["ROE", `${stock.roe}%`], ["ROA", `${stock.roa}%`],
    ["52 Week High", formatCurrency(stock.week_52_high)], ["52 Week Low", formatCurrency(stock.week_52_low)],
    ["Today's High", formatCurrency(stock.today_high)], ["Today's Low", formatCurrency(stock.today_low)],
    ["Previous Close", formatCurrency(stock.previous_close)], ["Open Price", formatCurrency(stock.today_open)],
    ["Current Price", formatCurrency(stock.current_price)], ["Volume", stock.volume], ["Average Volume", stock.average_volume],
  ];
  return (
    <section className="card">
      <h3>Stock Details</h3>
      <div className="fundamental-grid">
        {rows.map(([label, value]) => (
          <div className="stat" key={label}>
            <span className="stat-label">{label}</span>
            <span className="stat-value">{value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function TextPanel({ title, text }) {
  return (
    <section className="card">
      <h3>{title}</h3>
      <p className="text-block">{text || "No data available."}</p>
    </section>
  );
}
