export function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatPnl(value) {
  const prefix = value >= 0 ? "+" : "";
  return prefix + formatCurrency(value);
}

export function formatTime(iso) {
  return new Date(iso).toLocaleTimeString();
}
