from sqlalchemy.orm import Session

from app.models import Order, Position, Stock, User
from app.services.pnl import calc_pnl, position_value


def get_portfolio(db: Session, user: User) -> dict:
    positions = db.query(Position).filter(Position.user_id == user.id, Position.status == "open").all()
    symbols = {p.symbol for p in positions}
    stocks = db.query(Stock).filter(Stock.ticker.in_(symbols)).all() if symbols else []
    stock_map = {stock.ticker: stock for stock in stocks}
    exposure = 0.0
    pnl = 0.0
    investment = 0.0
    sector_totals: dict[str, float] = {}
    holdings: list[dict] = []
    for position in positions:
        stock = stock_map.get(position.symbol)
        price = stock.current_price if stock else position.entry_price
        value = position_value(position, price)
        gain = calc_pnl(position, price)
        exposure += value
        pnl += gain
        investment += position.entry_price * position.quantity
        sector = stock.sector if stock else "Unknown"
        sector_totals[sector] = sector_totals.get(sector, 0) + value
        holdings.append({
            "symbol": position.symbol,
            "value": round(value, 2),
            "quantity": position.quantity,
            "unrealized_profit": round(gain, 2),
        })
    orders = (
        db.query(Order)
        .filter(Order.user_id == user.id)
        .order_by(Order.created_at.desc())
        .limit(8)
        .all()
    )
    recent = [
        {
            "transaction_id": order.transaction_id,
            "symbol": order.symbol,
            "side": order.side,
            "quantity": order.quantity,
            "price": order.price,
            "realized_profit": order.realized_profit,
            "timestamp": order.created_at.isoformat(),
        }
        for order in orders
    ]
    realized = sum(order.realized_profit or 0 for order in db.query(Order).filter(Order.user_id == user.id).all())
    equity = user.balance + exposure
    total_return = ((pnl + realized) / investment * 100) if investment else 0
    today_return = (pnl / investment * 100) if investment else 0
    performance = _performance_points(user.balance, exposure, pnl)
    return {
        "balance": round(user.balance, 2),
        "equity": round(equity, 2),
        "total_pnl": round(pnl, 2),
        "open_positions": len(positions),
        "total_exposure": round(exposure, 2),
        "total_investment": round(investment, 2),
        "todays_profit_loss": round(pnl, 2),
        "overall_profit_loss": round(pnl + realized, 2),
        "portfolio_value": round(exposure, 2),
        "available_cash": round(user.balance, 2),
        "buying_power": round(user.balance, 2),
        "todays_return_percent": round(today_return, 2),
        "total_return_percent": round(total_return, 2),
        "sector_allocation": [
            {"sector": sector, "value": round(value, 2), "percent": round((value / exposure * 100), 2) if exposure else 0}
            for sector, value in sector_totals.items()
        ],
        "top_holding": max(holdings, key=lambda item: item["value"]) if holdings else None,
        "recent_transactions": recent,
        "performance": performance,
    }


def _performance_points(balance: float, exposure: float, pnl: float) -> list[dict]:
    base = balance + exposure - pnl
    return [
        {"label": "Start", "value": round(base, 2)},
        {"label": "Invested", "value": round(balance + exposure - (pnl * 0.5), 2)},
        {"label": "Today", "value": round(balance + exposure, 2)},
    ]
