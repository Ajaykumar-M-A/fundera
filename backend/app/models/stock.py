from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Stock(Base):
    __tablename__ = "stocks"

    id: Mapped[int] = mapped_column(primary_key=True)
    company_name: Mapped[str] = mapped_column(String(160))
    ticker: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    exchange: Mapped[str] = mapped_column(String(30), default="NSE")
    sector: Mapped[str] = mapped_column(String(80), default="General")
    industry: Mapped[str] = mapped_column(String(120), default="General")
    ceo: Mapped[str | None] = mapped_column(String(120), nullable=True)
    employees: Mapped[int | None] = mapped_column(Integer, nullable=True)
    logo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    market_cap: Mapped[float] = mapped_column(Float, default=0)
    eps: Mapped[float] = mapped_column(Float, default=0)
    pe_ratio: Mapped[float] = mapped_column(Float, default=0)
    dividend_yield: Mapped[float] = mapped_column(Float, default=0)
    beta: Mapped[float] = mapped_column(Float, default=1)
    book_value: Mapped[float] = mapped_column(Float, default=0)
    roe: Mapped[float] = mapped_column(Float, default=0)
    roa: Mapped[float] = mapped_column(Float, default=0)
    today_open: Mapped[float] = mapped_column(Float, default=0)
    previous_close: Mapped[float] = mapped_column(Float, default=0)
    today_high: Mapped[float] = mapped_column(Float, default=0)
    today_low: Mapped[float] = mapped_column(Float, default=0)
    current_price: Mapped[float] = mapped_column(Float, default=0)
    week_52_high: Mapped[float] = mapped_column(Float, default=0)
    week_52_low: Mapped[float] = mapped_column(Float, default=0)
    volume: Mapped[float] = mapped_column(Float, default=0)
    average_volume: Mapped[float] = mapped_column(Float, default=0)
    available_quantity: Mapped[float] = mapped_column(Float, default=0)
    trading_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    company_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    financial_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    latest_news: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    watchlist_items = relationship("WatchlistItem", back_populates="stock", cascade="all, delete-orphan")
