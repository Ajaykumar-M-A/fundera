from datetime import date, datetime

from sqlalchemy import Date, DateTime, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class KycVerification(Base):
    __tablename__ = "kyc_verifications"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, index=True)
    status: Mapped[str] = mapped_column(String(20), default="PENDING")
    pan_card: Mapped[str | None] = mapped_column(String(500), nullable=True)
    aadhaar: Mapped[str | None] = mapped_column(String(500), nullable=True)
    driving_license: Mapped[str | None] = mapped_column(String(500), nullable=True)
    selfie: Mapped[str | None] = mapped_column(String(500), nullable=True)
    address_proof: Mapped[str | None] = mapped_column(String(500), nullable=True)
    phone_number: Mapped[str] = mapped_column(String(20))
    date_of_birth: Mapped[date] = mapped_column(Date)
    occupation: Mapped[str] = mapped_column(String(100))
    annual_income: Mapped[str] = mapped_column(String(60))
    account_holder_name: Mapped[str] = mapped_column(String(120))
    bank_name: Mapped[str] = mapped_column(String(120))
    ifsc: Mapped[str] = mapped_column(String(11))
    account_number: Mapped[str] = mapped_column(String(30))
    nominee: Mapped[str | None] = mapped_column(String(120), nullable=True)
    rejection_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    submitted_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    user = relationship("User", back_populates="kyc")
