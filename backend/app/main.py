import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, SessionLocal, engine
from app.migrations import run_safe_migrations, seed_database
from app.routers import admin, auth, kyc, market, notifications, orders, portfolio, positions, watchlists
from app.services.market import market_simulator
from app.services.stop_loss import stop_loss_monitor


@asynccontextmanager
async def lifespan(app: FastAPI):
    run_safe_migrations(engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    sim_task = asyncio.create_task(market_simulator.start(SessionLocal))
    sl_task = asyncio.create_task(stop_loss_monitor())
    yield
    market_simulator.stop()
    sim_task.cancel()
    sl_task.cancel()


app = FastAPI(title="FundedIn Paper Trading", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(market.router)
app.include_router(orders.router)
app.include_router(positions.router)
app.include_router(portfolio.router)
app.include_router(admin.router)
app.include_router(kyc.router)
app.include_router(watchlists.router)
app.include_router(notifications.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
