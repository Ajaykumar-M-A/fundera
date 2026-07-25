# Fundera Feature Implementation Notes

## Features implemented

- Separate admin panel at `/admin`, protected by `role = ADMIN`.
- Admin login/logout support through the existing auth flow.
- Admin analytics for total users, pending users, verified users, pending KYC, trades, revenue, most bought/sold stock, daily registrations, and trading volume.
- Admin user management: approve, reject, suspend, and activate users.
- Database-backed stocks with admin create, edit, delete, enable/disable trading, price, available quantity, logo URL, sector, market cap, open, previous close, 52-week high/low, volume, P/E, dividend yield, and description fields.
- User registration now defaults to `PENDING`; pending/rejected/suspended users cannot trade or access trading-only resources.
- User dashboard clearly shows `Waiting for Admin Approval` while pending.
- KYC page at `/kyc` for PAN, Aadhaar, optional driving license, selfie, address proof, phone, date of birth, occupation, annual income, bank details, and nominee.
- KYC statuses: `PENDING`, `VERIFIED`, and `REJECTED`, with admin review.
- Trading requires both approved account status and verified KYC.
- Portfolio response expanded with total investment, today's P/L, overall P/L, portfolio value, available cash, buying power, return percentages, sector allocation, top holding, recent transactions, and performance data.
- Stock detail pages at `/stocks/:ticker` with company profile, fundamentals, chart ranges, line/candlestick-style data, volume, moving average, support, resistance, news, and related stocks.
- Watchlist page at `/watchlists` with create, search, sort, pin, add stock, and remove stock workflows.
- Fast stock search from database by company, ticker, sector, and industry.
- Transaction history includes transaction IDs, buy/sell records, realized profit, timestamps, and CSV export.
- Notifications are stored for account status changes, KYC review, and completed orders.
- Dashboard now shows database stocks, market overview, trending/active stocks, top gainers, top losers, watchlists, notifications, portfolio summary, and latest stock-linked information.
- Security additions include JWT access tokens, refresh tokens, password hashing, role-based route guards, backend dependency guards, protected frontend routes, and Pydantic validation.
- Database structure is normalized with related tables for stocks, KYC, watchlists, watchlist items, notifications, orders, positions, and users.
- Startup-safe additive migrations preserve existing rows while adding new columns and tables.

## Why these were prioritized

The highest business value comes from making the platform operationally controllable and compliant. Admin approval, KYC verification, role-based access, and stock CRUD unlock real brokerage-style workflows while reducing unauthorized trading risk. Database-backed stocks remove the single hardcoded instrument limitation, which enables search, watchlists, stock pages, analytics, and richer portfolio calculations to work from one source of truth.

## Assumptions

- Existing deployments can continue using startup table creation, so additive migration logic was added without requiring a separate Alembic command during app startup.
- Document uploads are stored as text references or URLs because no object storage service was configured in the existing project.
- A default admin is seeded only when no admin exists. Defaults are configurable with `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
- Seed stocks are inserted only when the stocks table is empty.
- Market prices are simulated and persisted to the database for paper-trading behavior.
- Revenue is estimated as a 0.1% trade fee for analytics.

## Features intentionally left out

- Real file upload storage for KYC documents was deferred because the project does not currently include S3, local media storage, virus scanning, or secure document retrieval.
- Real market/news provider integration was deferred because the current app uses simulated paper-trading data and no external data provider is configured.
- Full Alembic revision files were deferred in favor of startup-safe additive migrations to avoid deployment friction and preserve existing data immediately.
- Cancelled order workflows are represented in the schema/history model but a full pending-order lifecycle was deferred because the current trading engine executes market orders immediately.
- Push or websocket notifications for every price movement were deferred to avoid noisy notification volume; persisted notifications are currently generated for account/KYC/order events.
