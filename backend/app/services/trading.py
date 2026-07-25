from datetime import datetime
from uuid import uuid4

from sqlalchemy.orm import Session

from app.models import Notification, Order, Position, Stock, User


def execute_market_order(db: Session, user: User, symbol: str, side: str, quantity: float) -> tuple[Order, Position | None]:
    stock = db.query(Stock).filter(Stock.ticker == symbol.upper()).first()
    if not stock:
        raise ValueError("Stock not found")
    if not stock.trading_enabled:
        raise ValueError("Trading is disabled for this stock")
    price = stock.current_price
    symbol = stock.ticker
    cost = price * quantity

    if side == "buy" and user.balance < cost:
        raise ValueError("Insufficient balance")
    if side == "buy" and stock.available_quantity < quantity:
        raise ValueError("Requested quantity is not available")
    if side == "sell":
        owned = sum(p.quantity for p in _find_open_positions(db, user.id, symbol))
        if owned < quantity:
            raise ValueError("Insufficient position to sell")

    order = Order(
        user_id=user.id,
        symbol=symbol,
        side=side,
        quantity=quantity,
        price=price,
        transaction_id=f"TXN-{uuid4().hex[:12].upper()}",
    )
    db.add(order)

    if side == "buy":
        user.balance -= cost
        stock.available_quantity -= quantity
        pos = Position(user_id=user.id, symbol=symbol, side="buy", quantity=quantity, entry_price=price)
        db.add(pos)
    else:
        user.balance += cost
        stock.available_quantity += quantity
        order.realized_profit = _close_positions(db, user.id, symbol, quantity, price)
        pos = None

    db.add(Notification(
        user_id=user.id,
        title="Order completed",
        message=f"{side.title()} order for {quantity:g} {symbol} completed at {price:.2f}.",
        type="ORDER",
    ))
    db.commit()
    db.refresh(order)
    return order, pos


def _find_open_positions(db: Session, user_id: int, symbol: str) -> list[Position]:
    return (
        db.query(Position)
        .filter(
            Position.user_id == user_id,
            Position.symbol == symbol,
            Position.status == "open",
            Position.side == "buy",
        )
        .order_by(Position.opened_at.asc())
        .all()
    )


def _close_positions(db: Session, user_id: int, symbol: str, quantity: float, price: float) -> float:
    remaining = quantity
    realized = 0.0
    for pos in _find_open_positions(db, user_id, symbol):
        if remaining <= 0:
            break
        sold = min(pos.quantity, remaining)
        realized += (price - pos.entry_price) * sold
        pos.quantity -= sold
        remaining -= sold
        if pos.quantity <= 0:
            pos.status = "closed"
            pos.closed_at = datetime.utcnow()
            pos.close_price = price
    return round(realized, 2)
