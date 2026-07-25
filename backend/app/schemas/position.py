from datetime import datetime

from pydantic import BaseModel, Field


class StopLossUpdate(BaseModel):
    stop_loss: float = Field(gt=0)


class PositionOut(BaseModel):
    id: int
    symbol: str
    side: str
    quantity: float
    entry_price: float
    stop_loss: float | None
    status: str
    opened_at: datetime
    current_price: float | None = None
    unrealized_pnl: float | None = None

    class Config:
        from_attributes = True
