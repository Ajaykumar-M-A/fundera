from datetime import date, datetime

from sqlalchemy import Date, DateTime, Float, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    full_name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    mobile_number: Mapped[str] = mapped_column(String(15))
    hashed_password: Mapped[str] = mapped_column(String(255))
    date_of_birth: Mapped[date] = mapped_column(Date)
    gender: Mapped[str] = mapped_column(String(20))
    address_line: Mapped[str] = mapped_column(String(255))
    city: Mapped[str] = mapped_column(String(80))
    state: Mapped[str] = mapped_column(String(80))
    country: Mapped[str] = mapped_column(String(80))
    pincode: Mapped[str] = mapped_column(String(10))
    pan_number: Mapped[str] = mapped_column(String(10))
    aadhaar_number: Mapped[str | None] = mapped_column(String(12), nullable=True)
    occupation: Mapped[str] = mapped_column(String(80))
    account_holder_name: Mapped[str] = mapped_column(String(120))
    bank_name: Mapped[str] = mapped_column(String(120))
    account_number: Mapped[str] = mapped_column(String(20))
    ifsc_code: Mapped[str] = mapped_column(String(11))
    branch_name: Mapped[str] = mapped_column(String(120))
    account_type: Mapped[str] = mapped_column(String(20))
    investment_experience: Mapped[str] = mapped_column(String(40))
    annual_income: Mapped[str] = mapped_column(String(40))
    risk_appetite: Mapped[str] = mapped_column(String(40))
    investment_goal: Mapped[str] = mapped_column(String(80))
    balance: Mapped[float] = mapped_column(Float, default=100_000.0)
    role: Mapped[str] = mapped_column(String(20), default="USER")
    status: Mapped[str] = mapped_column(String(20), default="PENDING")
    kyc_status: Mapped[str] = mapped_column(String(20), default="PENDING")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    positions = relationship("Position", back_populates="user", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="user", cascade="all, delete-orphan")
    kyc = relationship("KycVerification", back_populates="user", uselist=False, cascade="all, delete-orphan")
    watchlists = relationship("Watchlist", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
