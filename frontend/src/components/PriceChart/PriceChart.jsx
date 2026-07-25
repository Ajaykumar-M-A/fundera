import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "../../utils/format";
import { buildChartData } from "./priceChart.functions";
import "./PriceChart.styles.css";

export default function PriceChart({ history, price, symbol = "BTC/USD" }) {
  const data = buildChartData(history);

  return (
    <div className="card chart-card">
      <div className="chart-header">
        <h3>{symbol}</h3>
        {price && <span className="live-price">{formatCurrency(price)}</span>}
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <XAxis dataKey="time" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
          <YAxis
            domain={["auto", "auto"]}
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
          />
          <Tooltip formatter={(v) => formatCurrency(v)} />
          <Line type="monotone" dataKey="price" stroke="#22c55e" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
