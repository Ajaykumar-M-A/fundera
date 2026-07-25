from datetime import datetime

from pydantic import BaseModel


class PriceOut(BaseModel):
    symbol: str
    price: float
    timestamp: datetime


class PriceHistoryOut(BaseModel):
    symbol: str
    prices: list[dict]


class StockBase(BaseModel):
    company_name: str
    ticker: str
    exchange: str = "NSE"
    sector: str = "General"
    industry: str = "General"
    ceo: str | None = None
    employees: int | None = None
    logo_url: str | None = None
    market_cap: float = 0
    eps: float = 0
    pe_ratio: float = 0
    dividend_yield: float = 0
    beta: float = 1
    book_value: float = 0
    roe: float = 0
    roa: float = 0
    today_open: float = 0
    previous_close: float = 0
    today_high: float = 0
    today_low: float = 0
    current_price: float = 0
    week_52_high: float = 0
    week_52_low: float = 0
    volume: float = 0
    average_volume: float = 0
    available_quantity: float = 0
    trading_enabled: bool = True
    company_description: str | None = None
    financial_summary: str | None = None
    latest_news: str | None = None


class StockCreate(StockBase):
    pass


class StockUpdate(BaseModel):
    company_name: str | None = None
    ticker: str | None = None
    exchange: str | None = None
    sector: str | None = None
    industry: str | None = None
    ceo: str | None = None
    employees: int | None = None
    logo_url: str | None = None
    market_cap: float | None = None
    eps: float | None = None
    pe_ratio: float | None = None
    dividend_yield: float | None = None
    beta: float | None = None
    book_value: float | None = None
    roe: float | None = None
    roa: float | None = None
    today_open: float | None = None
    previous_close: float | None = None
    today_high: float | None = None
    today_low: float | None = None
    current_price: float | None = None
    week_52_high: float | None = None
    week_52_low: float | None = None
    volume: float | None = None
    average_volume: float | None = None
    available_quantity: float | None = None
    trading_enabled: bool | None = None
    company_description: str | None = None
    financial_summary: str | None = None
    latest_news: str | None = None


class StockOut(StockBase):
    id: int

    class Config:
        from_attributes = True
