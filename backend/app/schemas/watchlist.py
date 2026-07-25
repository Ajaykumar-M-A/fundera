from datetime import datetime

from pydantic import BaseModel

from app.schemas.market import StockOut


class WatchlistCreate(BaseModel):
    name: str


class WatchlistRename(BaseModel):
    name: str | None = None
    pinned: bool | None = None


class WatchlistStockCreate(BaseModel):
    stock_id: int


class WatchlistOut(BaseModel):
    id: int
    name: str
    pinned: bool
    created_at: datetime
    stocks: list[StockOut]
