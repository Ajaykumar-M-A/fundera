from datetime import date, datetime

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps.auth import get_current_user
from app.models import KycVerification, User
from app.schemas import KycOut

router = APIRouter(prefix="/api/kyc", tags=["kyc"])


@router.get("", response_model=KycOut | None)
def my_kyc(user: User = Depends(get_current_user)):
    return user.kyc


@router.post("", response_model=KycOut)
def submit_kyc(
    phone_number: str = Form(...),
    date_of_birth: date = Form(...),
    occupation: str = Form(...),
    annual_income: str = Form(...),
    account_holder_name: str = Form(...),
    bank_name: str = Form(...),
    ifsc: str = Form(...),
    account_number: str = Form(...),
    nominee: str | None = Form(None),
    pan_card: UploadFile = File(...),
    aadhaar: str = Form(...),
    selfie: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    kyc = user.kyc or KycVerification(user_id=user.id)
    kyc.phone_number = phone_number
    kyc.date_of_birth = date_of_birth
    kyc.occupation = occupation
    kyc.annual_income = annual_income
    kyc.account_holder_name = account_holder_name
    kyc.bank_name = bank_name
    kyc.ifsc = ifsc
    kyc.account_number = account_number
    kyc.nominee = nominee

    if pan_card:
        if not pan_card.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="ID document must be an image file.")
        kyc.pan_card = pan_card.filename
    elif not kyc.pan_card:
        raise HTTPException(status_code=400, detail="ID document upload is required.")

    kyc.aadhaar = aadhaar

    if selfie:
        if not selfie.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Selfie must be an image file.")
        kyc.selfie = selfie.filename
    elif not kyc.selfie:
        raise HTTPException(status_code=400, detail="Selfie upload is required.")

    kyc.status = "PENDING"
    kyc.rejection_reason = None
    kyc.submitted_at = datetime.utcnow()
    kyc.reviewed_at = None
    user.kyc_status = "PENDING"
    db.add(kyc)
    db.commit()
    db.refresh(kyc)
    return kyc
