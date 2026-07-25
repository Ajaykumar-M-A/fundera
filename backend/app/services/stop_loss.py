import asyncio
from datetime import datetime

from app.database import SessionLocal
from app.models import Order, Position, User
from app.services.market import market_simulator


async def stop_loss_monitor():
    while True:
        await asyncio.sleep(1)
        price = market_simulator.price
        db = SessionLocal()
        try:
            positions = db.query(Position).filter(
                Position.status == "open", Position.stop_loss.isnot(None)
            ).all()
            for pos in positions:
                hit = (pos.side == "buy" and price <= pos.stop_loss)
                if not hit:
                    continue
                user = db.query(User).filter(User.id == pos.user_id).first()
                user.balance += price * pos.quantity
                db.add(Order(
                    user_id=pos.user_id, symbol=pos.symbol, side="sell",
                    order_type="stop_loss", quantity=pos.quantity, price=price,
                ))
                pos.status = "closed"
                pos.closed_at = datetime.utcnow()
                pos.close_price = price
            db.commit()
        finally:
            db.close()
