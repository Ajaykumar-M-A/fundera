export function buildChartData(history) {
  return history.map((t) => ({
    time: new Date(t.timestamp).toLocaleTimeString(),
    price: t.price,
  }));
}
