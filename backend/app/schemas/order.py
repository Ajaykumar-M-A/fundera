from datetime import datetime

from pydantic import BaseModel, Field


class OrderCreate(BaseModel):
    symbol: str
    side: str = Field(pattern="^(buy|sell)$")
    quantity: float = Field(gt=0)


class OrderOut(BaseModel):
    id: int
    symbol: str
    side: str
    order_type: str
    quantity: float
    price: float
    status: str
    transaction_id: str | None = None
    realized_profit: float = 0
    created_at: datetime

    class Config:
        from_attributes = True
