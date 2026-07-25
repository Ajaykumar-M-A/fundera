import random
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import PriceTick, Stock
from app.schemas import PriceHistoryOut, PriceOut, StockOut
from app.services.market import market_simulator

router = APIRouter(prefix="/api/market", tags=["market"])


@router.get("/price", response_model=PriceOut)
def current_price(symbol: str | None = None, db: Session = Depends(get_db)):
    stock = _get_stock(db, symbol or market_simulator.symbol)
    return PriceOut(symbol=stock.ticker, price=stock.current_price, timestamp=datetime.utcnow())


@router.get("/history", response_model=PriceHistoryOut)
def price_history(symbol: str | None = None, limit: int = 120, db: Session = Depends(get_db)):
    ticker = (symbol or market_simulator.symbol).upper()
    ticks = (
        db.query(PriceTick)
        .filter(PriceTick.symbol == ticker)
        .order_by(PriceTick.timestamp.desc())
        .limit(limit)
        .all()
    )
    ticks.reverse()
    return PriceHistoryOut(
        symbol=ticker,
        prices=[{"price": t.price, "timestamp": t.timestamp.isoformat()} for t in ticks],
    )


@router.get("/stocks", response_model=list[StockOut])
def list_stocks(q: str | None = None, db: Session = Depends(get_db)):
    query = db.query(Stock)
    if q:
        term = f"%{q.strip()}%"
        query = query.filter(or_(
            Stock.company_name.ilike(term),
            Stock.ticker.ilike(term),
            Stock.sector.ilike(term),
            Stock.industry.ilike(term),
        ))
    return query.order_by(Stock.company_name).all()


@router.get("/stocks/{ticker}", response_model=StockOut)
def stock_detail(ticker: str, db: Session = Depends(get_db)):
    return _get_stock(db, ticker)


@router.get("/stocks/{ticker}/chart")
def stock_chart(ticker: str, range: str = "1M", db: Session = Depends(get_db)):
    stock = _get_stock(db, ticker)
    points = _chart_points_for_range(range)
    start = datetime.utcnow() - timedelta(days=max(points // 8, 1))
    ticks = (
        db.query(PriceTick)
        .filter(PriceTick.symbol == stock.ticker, PriceTick.timestamp >= start)
        .order_by(PriceTick.timestamp.asc())
        .limit(points)
        .all()
    )
    prices = [tick.price for tick in ticks] or _synthetic_prices(stock.current_price, points)
    candles = []
    previous = prices[0]
    for index, price in enumerate(prices):
        open_price = previous
        close = price
        high = max(open_price, close) * (1 + random.uniform(0, 0.006))
        low = min(open_price, close) * (1 - random.uniform(0, 0.006))
        candles.append({
            "time": index,
            "open": round(open_price, 2),
            "high": round(high, 2),
            "low": round(low, 2),
            "close": round(close, 2),
            "volume": round((stock.volume or 0) / max(points, 1) + random.randint(500, 5000), 0),
            "moving_average": round(sum(prices[max(0, index - 4):index + 1]) / len(prices[max(0, index - 4):index + 1]), 2),
        })
        previous = price
    recent_prices = [c["close"] for c in candles]
    return {
        "symbol": stock.ticker,
        "range": range,
        "support": round(min(recent_prices), 2),
        "resistance": round(max(recent_prices), 2),
        "candles": candles,
        "indicators": {
            "moving_average": candles[-1]["moving_average"] if candles else stock.current_price,
            "trend": "bullish" if candles and candles[-1]["close"] >= candles[0]["open"] else "bearish",
        },
    }


@router.get("/overview")
def market_overview(db: Session = Depends(get_db)):
    stocks = db.query(Stock).all()
    ranked = sorted(stocks, key=lambda s: _change_percent(s), reverse=True)
    active = sorted(stocks, key=lambda s: s.volume or 0, reverse=True)
    return {
        "trending": [s.ticker for s in active[:5]],
        "top_gainers": [_stock_snapshot(s) for s in ranked[:5]],
        "top_losers": [_stock_snapshot(s) for s in ranked[-5:]],
        "most_active": [_stock_snapshot(s) for s in active[:5]],
        "market_overview": {
            "listed_stocks": len(stocks),
            "trading_enabled": len([s for s in stocks if s.trading_enabled]),
            "total_volume": sum(s.volume or 0 for s in stocks),
        },
    }


@router.websocket("/ws")
async def price_stream(ws: WebSocket):
    await ws.accept()
    queue = market_simulator.subscribe()
    try:
        await ws.send_json({"symbol": settings.instrument_symbol, "price": market_simulator.price})
        while True:
            tick = await queue.get()
            await ws.send_json(tick)
    except WebSocketDisconnect:
        pass
    finally:
        market_simulator.unsubscribe(queue)


def _get_stock(db: Session, ticker: str) -> Stock:
    stock = db.query(Stock).filter(Stock.ticker == ticker.upper()).first()
    if not stock:
        raise HTTPException(status_code=404, detail="Stock not found")
    return stock


def _chart_points_for_range(range_name: str) -> int:
    return {
        "1D": 60, "1W": 80, "1M": 120, "3M": 140,
        "6M": 160, "1Y": 180, "5Y": 220, "ALL": 240,
    }.get(range_name.upper(), 120)


def _synthetic_prices(price: float, count: int) -> list[float]:
    prices = [price]
    for _ in range(max(count - 1, 0)):
        prices.append(max(prices[-1] * (1 + random.gauss(0, 0.004)), 1))
    return prices


def _change_percent(stock: Stock) -> float:
    base = stock.previous_close or stock.today_open or stock.current_price or 1
    return ((stock.current_price - base) / base) * 100


def _stock_snapshot(stock: Stock) -> dict:
    return {
        "ticker": stock.ticker,
        "company_name": stock.company_name,
        "price": stock.current_price,
        "change_percent": round(_change_percent(stock), 2),
        "volume": stock.volume,
        "sector": stock.sector,
    }
