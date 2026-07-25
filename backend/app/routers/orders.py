import csv
from io import StringIO

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps.auth import get_current_user, require_trading_user
from app.models import User
from app.schemas import OrderCreate, OrderOut
from app.services.trading import execute_market_order

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.post("", response_model=OrderOut)
def place_order(data: OrderCreate, user: User = Depends(require_trading_user), db: Session = Depends(get_db)):
    try:
        order, _ = execute_market_order(db, user, data.symbol, data.side, data.quantity)
        return order
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("", response_model=list[OrderOut])
def list_orders(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return sorted(user.orders, key=lambda order: order.created_at, reverse=True)[:50]


@router.get("/export.csv")
def export_orders(user: User = Depends(get_current_user)):
    buffer = StringIO()
    writer = csv.writer(buffer)
    writer.writerow([
        "transaction_id", "symbol", "side", "quantity", "price",
        "status", "realized_profit", "timestamp",
    ])
    for order in sorted(user.orders, key=lambda item: item.created_at):
        writer.writerow([
            order.transaction_id, order.symbol, order.side, order.quantity,
            order.price, order.status, order.realized_profit, order.created_at.isoformat(),
        ])
    buffer.seek(0)
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=transactions.csv"},
    )
