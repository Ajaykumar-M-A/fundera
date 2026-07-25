from sqlalchemy.orm import Session

from app.models import Position, Stock
from app.services.pnl import calc_pnl


def get_open_positions(db: Session, user_id: int) -> list[Position]:
    return db.query(Position).filter(Position.user_id == user_id, Position.status == "open").all()


def enrich_positions(positions: list[Position], db: Session | None = None) -> list[dict]:
    prices = {}
    if db:
        symbols = {p.symbol for p in positions}
        stocks = db.query(Stock).filter(Stock.ticker.in_(symbols)).all() if symbols else []
        prices = {s.ticker: s.current_price for s in stocks}
    result = []
    for p in positions:
        price = prices.get(p.symbol, p.entry_price)
        result.append({
            "id": p.id, "symbol": p.symbol, "side": p.side,
            "quantity": p.quantity, "entry_price": p.entry_price,
            "stop_loss": p.stop_loss, "status": p.status,
            "opened_at": p.opened_at, "current_price": price,
            "unrealized_pnl": calc_pnl(p, price),
        })
    return result
