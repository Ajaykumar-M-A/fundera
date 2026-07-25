import asyncio
import random
from datetime import datetime

from sqlalchemy.orm import Session

from app.config import settings
from app.models import PriceTick, Stock


class MarketSimulator:
    def __init__(self):
        self.price = settings.initial_price
        self.symbol = settings.instrument_symbol
        self._running = False
        self._subscribers: list[asyncio.Queue] = []

    def subscribe(self) -> asyncio.Queue:
        queue: asyncio.Queue = asyncio.Queue(maxsize=100)
        self._subscribers.append(queue)
        return queue

    def unsubscribe(self, queue: asyncio.Queue):
        if queue in self._subscribers:
            self._subscribers.remove(queue)

    async def start(self, db_factory):
        if self._running:
            return
        self._running = True
        while self._running:
            db = db_factory()
            try:
                stocks = db.query(Stock).filter(Stock.trading_enabled.is_(True)).all()
                ticks = []
                for stock in stocks:
                    drift = random.gauss(0, 0.0008)
                    next_price = max(stock.current_price * (1 + drift), 1.0)
                    stock.current_price = round(next_price, 2)
                    stock.today_high = max(stock.today_high or next_price, next_price)
                    stock.today_low = min(stock.today_low or next_price, next_price)
                    stock.volume = (stock.volume or 0) + random.randint(100, 2500)
                    tick = {
                        "symbol": stock.ticker,
                        "price": stock.current_price,
                        "timestamp": datetime.utcnow().isoformat(),
                    }
                    ticks.append(tick)
                    db.add(PriceTick(symbol=stock.ticker, price=stock.current_price))
                if ticks:
                    self.symbol = ticks[0]["symbol"]
                    self.price = ticks[0]["price"]
                db.commit()
            finally:
                db.close()
            for tick in ticks:
                for q in self._subscribers[:]:
                    try:
                        q.put_nowait(tick)
                    except asyncio.QueueFull:
                        pass
            await asyncio.sleep(1)

    def stop(self):
        self._running = False


market_simulator = MarketSimulator()
