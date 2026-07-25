from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import User
from app.schemas import Token, UserCreate, UserOut
from app.deps.auth import get_current_user
from app.services.auth import create_token_pair, decode_token, hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=UserOut)
def register(data: UserCreate, db: Session = Depends(get_db)):
    # 1. Pre-check for duplicate Email
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered"
        )

    # 2. Pre-check for duplicate PAN Number
    if db.query(User).filter(User.pan_number == data.pan_number.upper()).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="PAN number is already registered"
        )

    # 3. Construct User object
    user = User(
        full_name=data.full_name,
        email=data.email,
        mobile_number=data.mobile_number,
        hashed_password=hash_password(data.password),
        date_of_birth=data.date_of_birth,
        gender=data.gender,
        address_line=data.address_line,
        city=data.city,
        state=data.state,
        country=data.country,
        pincode=data.pincode,
        pan_number=data.pan_number.upper(),
        aadhaar_number=data.aadhaar_number,
        occupation=data.occupation,
        account_holder_name=data.account_holder_name,
        bank_name=data.bank_name,
        account_number=data.account_number,
        ifsc_code=data.ifsc_code.upper(),
        branch_name=data.branch_name,
        account_type=data.account_type,
        investment_experience=data.investment_experience,
        annual_income=data.annual_income,
        risk_appetite=data.risk_appetite,
        investment_goal=data.investment_goal,
        balance=settings.starting_balance,
        role="USER",
        status="PENDING",
        kyc_status="PENDING",
    )

    # 4. Save to Database with Exception Handling
    try:
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration failed due to duplicate entry or constraint failure: {str(e.orig)}"
        )
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Database execution error: {str(e)}"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal Server Error: {str(e)}"
        )


@router.post("/login", response_model=Token)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form.username).first()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    return Token(**create_token_pair(user.id))


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user


@router.post("/refresh", response_model=Token)
def refresh_token(data: dict):
    token = data.get("refresh_token")
    user_id = decode_token(token) if token else None
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    return Token(**create_token_pair(user_id))
