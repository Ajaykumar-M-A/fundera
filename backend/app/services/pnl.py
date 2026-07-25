from app.models import Position


def calc_pnl(position: Position, current_price: float) -> float:
    diff = current_price - position.entry_price
    if position.side == "sell":
        diff = -diff
    return round(diff * position.quantity, 2)


def position_value(position: Position, current_price: float) -> float:
    return position.quantity * current_price
