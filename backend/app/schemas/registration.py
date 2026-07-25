import re
from datetime import date

from pydantic import BaseModel, EmailStr, Field, field_validator


class UserCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    mobile_number: str = Field(min_length=10, max_length=15)
    password: str = Field(min_length=8, max_length=72)
    date_of_birth: date
    gender: str = Field(min_length=1, max_length=20)
    address_line: str = Field(min_length=5, max_length=255)
    city: str = Field(min_length=2, max_length=80)
    state: str = Field(min_length=2, max_length=80)
    country: str = Field(min_length=2, max_length=80)
    pincode: str = Field(min_length=4, max_length=10)
    pan_number: str = Field(min_length=10, max_length=10)
    # Increased max_length to 16 to allow space-separated inputs before stripping
    aadhaar_number: str | None = Field(default=None, max_length=16)
    occupation: str = Field(min_length=2, max_length=80)
    account_holder_name: str = Field(min_length=2, max_length=120)
    bank_name: str = Field(min_length=2, max_length=120)
    account_number: str = Field(min_length=6, max_length=20)
    ifsc_code: str = Field(min_length=11, max_length=11)
    branch_name: str = Field(min_length=2, max_length=120)
    account_type: str
    investment_experience: str = Field(min_length=2, max_length=40)
    annual_income: str = Field(min_length=2, max_length=40)
    risk_appetite: str = Field(min_length=2, max_length=40)
    investment_goal: str = Field(min_length=2, max_length=80)

    @field_validator("account_type")
    @classmethod
    def validate_account_type(cls, v: str) -> str:
        formatted = v.strip().capitalize()
        if formatted not in {"Savings", "Current"}:
            raise ValueError("Account type must be either 'Savings' or 'Current'")
        return formatted

    @field_validator("mobile_number")
    @classmethod
    def validate_mobile(cls, v: str) -> str:
        digits = re.sub(r"\D", "", v)
        if len(digits) != 10:
            raise ValueError("Mobile number must be exactly 10 digits")
        return digits

    @field_validator("pan_number")
    @classmethod
    def validate_pan(cls, v: str) -> str:
        pan = v.strip().upper()
        if not re.fullmatch(r"[A-Z]{5}[0-9]{4}[A-Z]", pan):
            raise ValueError("Invalid PAN format (e.g. ABCDE1234F)")
        return pan

    @field_validator("aadhaar_number")
    @classmethod
    def validate_aadhaar(cls, v: str | None) -> str | None:
        if not v or not v.strip():
            return None
        digits = re.sub(r"\D", "", v)
        if len(digits) != 12:
            raise ValueError("Aadhaar identifier must contain exactly 12 digits")
        return digits

    @field_validator("ifsc_code")
    @classmethod
    def validate_ifsc(cls, v: str) -> str:
        code = v.strip().upper()
        if not re.fullmatch(r"[A-Z]{4}0[A-Z0-9]{6}", code):
            raise ValueError("Invalid IFSC code format (e.g. SBIN0070479)")
        return code

    @field_validator("date_of_birth")
    @classmethod
    def validate_age(cls, v: date) -> date:
        today = date.today()
        # Precise age calculation avoiding leap year floor division issues
        age = today.year - v.year - ((today.month, today.day) < (v.month, v.day))
        if age < 18:
            raise ValueError("You must be at least 18 years old to register")
        return v