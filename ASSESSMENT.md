# Assessment Notes

## Features Implemented

### Required (Minimum Outcome)

1. **Register and log in** — JWT-based auth with bcrypt password hashing. New users receive $100,000 virtual balance.
2. **Simulated market prices** — Background random-walk simulator updates enabled stocks every second. Prices stream via WebSocket for live ticks and initial chart history is loaded via REST, so the selected stock chart updates correctly when the ticker changes.
3. **Market buy/sell orders** — Instant execution at current simulated price. Balance and positions update atomically.
4. **Protective stop-loss** — Users set a stop-loss price on any open position. A background monitor auto-closes positions when price hits the threshold.
5. **Open positions and P&L** — Dashboard shows unrealized P&L, entry/current prices, portfolio equity, and exposure.

### Additional Features

- **Order history** — Last 50 orders with side, quantity, price, and type (market / stop_loss).
- **Portfolio summary** — Balance, equity, total P&L, open position count, and exposure.
- **Estimated order cost** — Preview before placing a buy.
- **Docker Compose** — One-command Postgres + backend setup.

## Prioritization Rationale

| Priority | Feature | Why |
|----------|---------|-----|
| P0 | Auth + trading core | Required for any user flow |
| P0 | Live price stream | Core UX — traders need real-time data |
| P0 | Stop-loss monitor | Required; implemented as async background task |
| P1 | Portfolio/P&L view | Required; split into dedicated endpoints for clarity |
| P2 | Order history | Useful for auditing trades; low effort |
| P2 | Price chart | Visual feedback makes the simulator tangible |

## Assumptions

- **Single instrument** (BTC/USD) — per assessment spec.
- **One open long position per user** — simplified position model; partial sells reduce quantity.
- **Market orders only** — no limit orders or order book.
- **No short selling** — sell requires an existing long position.
- **Stop-loss on long positions only** — triggers when price ≤ stop-loss level.
- **Simulated prices are shared** — all users see the same market (paper trading).
- **No email verification or password reset** — out of scope for 24h assessment.
- **Frontend file structure** — each component/page uses separate `.styles.css` and `.functions.js` files in the same folder, capped at 100 lines per file.

## Intentionally Left Out

| Feature | Reason |
|---------|--------|
| Multiple instruments | Assessment specifies single instrument |
| Limit / stop-limit orders | Market orders satisfy minimum; adds complexity |
| Short selling | Simplifies P&L and position logic |
| Real market data feed | Simulated data is sufficient for paper trading |
| Admin panel / user management | Not required |
| Mobile-native app | Responsive web UI is sufficient |
| Automated tests | Time-boxed; manual test plan in README |
| Alembic migrations | `create_all` on startup for simplicity |

## Next 24 Hours

If given another day, I would prioritize:

1. **Automated tests** — pytest for trading logic, stop-loss triggers, and auth; Vitest for frontend hooks.
2. **Partial position management** — Support multiple concurrent positions and FIFO/LIFO close strategies.
3. **Limit orders** — Order queue that fills when simulated price crosses threshold.
4. **Trade analytics** — Win rate, average hold time, cumulative P&L chart over time.
5. **Rate limiting & input validation hardening** — Protect auth endpoints, validate order sizes.
6. **Alembic migrations** — Proper schema versioning for production readiness.
7. **E2E tests** — Playwright flow covering register → trade → stop-loss trigger.
