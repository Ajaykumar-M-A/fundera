import { api } from "./client";

export const register = (data) =>
  api("/api/auth/register", { method: "POST", body: JSON.stringify(data) });

export const fetchPortfolio = () => api("/api/portfolio");
export const topUpFunds = (amount) => api("/api/portfolio/top-up", { method: "POST", body: JSON.stringify({ amount }) });
export const fetchPositions = () => api("/api/positions");
export const fetchOrders = () => api("/api/orders");
export const fetchPriceHistory = (symbol = "RELIANCE") => api(`/api/market/history?symbol=${symbol}&limit=120`);
export const fetchStocks = (query = "") => api(`/api/market/stocks${query ? `?q=${encodeURIComponent(query)}` : ""}`);
export const fetchStock = (ticker) => api(`/api/market/stocks/${ticker}`);
export const fetchStockChart = (ticker, range = "1M") => api(`/api/market/stocks/${ticker}/chart?range=${range}`);
export const fetchMarketOverview = () => api("/api/market/overview");
export const fetchKyc = () => api("/api/kyc");
export const submitKyc = (data) => {
  const formData = new FormData();
  const fileFields = new Set(["pan_card", "selfie"]);
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (fileFields.has(key) && !(value instanceof File)) return;
    formData.append(key, value);
  });
  return api("/api/kyc", { method: "POST", body: formData });
};
export const fetchWatchlists = () => api("/api/watchlists");
export const createWatchlist = (name) => api("/api/watchlists", { method: "POST", body: JSON.stringify({ name }) });
export const updateWatchlist = (id, data) => api(`/api/watchlists/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const addToWatchlist = (watchlistId, stockId) =>
  api(`/api/watchlists/${watchlistId}/stocks`, { method: "POST", body: JSON.stringify({ stock_id: stockId }) });
export const removeFromWatchlist = (watchlistId, stockId) =>
  api(`/api/watchlists/${watchlistId}/stocks/${stockId}`, { method: "DELETE" });
export const fetchNotifications = () => api("/api/notifications");

export const placeOrder = (symbol, side, quantity) =>
  api("/api/orders", { method: "POST", body: JSON.stringify({ symbol, side, quantity }) });

export const setStopLoss = (positionId, stopLoss) =>
  api(`/api/positions/${positionId}/stop-loss`, {
    method: "PATCH",
    body: JSON.stringify({ stop_loss: stopLoss }),
  });

export const fetchAdminStats = () => api("/api/admin/stats");
export const fetchAdminUsers = () => api("/api/admin/users");
export const adminUserAction = (userId, action) =>
  api(`/api/admin/users/${userId}/${action}`, { method: "PATCH" });
export const fetchAdminStocks = () => api("/api/admin/stocks");
export const createAdminStock = (data) => api("/api/admin/stocks", { method: "POST", body: JSON.stringify(data) });
export const updateAdminStock = (id, data) => api(`/api/admin/stocks/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const deleteAdminStock = (id) => api(`/api/admin/stocks/${id}`, { method: "DELETE" });
export const fetchAdminKyc = () => api("/api/admin/kyc");
export const reviewKyc = (id, status, rejection_reason = "") =>
  api(`/api/admin/kyc/${id}`, { method: "PATCH", body: JSON.stringify({ status, rejection_reason }) });
