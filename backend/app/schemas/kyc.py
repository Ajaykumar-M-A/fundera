from datetime import date, datetime

from pydantic import BaseModel, Field


class KycSubmit(BaseModel):
    pan_card: str | None = None
    aadhaar: str | None = None
    driving_license: str | None = None
    selfie: str | None = None
    address_proof: str | None = None
    phone_number: str = Field(min_length=10, max_length=20)
    date_of_birth: date
    occupation: str
    annual_income: str
    account_holder_name: str
    bank_name: str
    ifsc: str = Field(min_length=11, max_length=11)
    account_number: str = Field(min_length=6, max_length=30)
    nominee: str | None = None


class KycReview(BaseModel):
    status: str = Field(pattern="^(VERIFIED|REJECTED)$")
    rejection_reason: str | None = None


class KycOut(KycSubmit):
    id: int
    user_id: int
    status: str
    rejection_reason: str | None = None
    submitted_at: datetime
    reviewed_at: datetime | None = None

    class Config:
        from_attributes = True
