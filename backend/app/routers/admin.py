from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps.auth import require_admin
from app.models import KycVerification, Notification, Order, Stock, User
from app.schemas import KycOut, KycReview, StockCreate, StockOut, StockUpdate, UserOut

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/stats")
def stats(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    total_trades = db.query(Order).count()
    revenue = sum((order.price * order.quantity) * 0.001 for order in db.query(Order).all())
    most_bought = _top_symbol(db, "buy")
    most_sold = _top_symbol(db, "sell")
    registrations = []
    for days_ago in range(6, -1, -1):
        day = datetime.utcnow().date() - timedelta(days=days_ago)
        count = db.query(User).filter(func.date(User.created_at) == day).count()
        registrations.append({"date": day.isoformat(), "count": count})
    return {
        "total_users": db.query(User).filter(User.role == "USER").count(),
        "pending_users": db.query(User).filter(User.status == "PENDING").count(),
        "verified_users": db.query(User).filter(User.status == "APPROVED", User.kyc_status == "VERIFIED").count(),
        "pending_kyc": db.query(KycVerification).filter(KycVerification.status == "PENDING").count(),
        "total_trades": total_trades,
        "revenue": round(revenue, 2),
        "most_bought_stock": most_bought,
        "most_sold_stock": most_sold,
        "daily_registrations": registrations,
        "trading_volume": round(sum(order.quantity for order in db.query(Order).all()), 2),
        "stocks": db.query(Stock).count(),
    }


@router.get("/users", response_model=list[UserOut])
def users(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    return db.query(User).order_by(User.created_at.desc()).all()


@router.patch("/users/{user_id}/{action}", response_model=UserOut)
def update_user_status(user_id: int, action: str, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id, User.role != "ADMIN").first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    transitions = {
        "approve": "APPROVED",
        "reject": "REJECTED",
        "suspend": "SUSPENDED",
        "activate": "APPROVED",
    }
    if action not in transitions:
        raise HTTPException(status_code=400, detail="Unsupported user action")
    user.status = transitions[action]
    db.add(Notification(
        user_id=user.id,
        title=f"Account {user.status.lower()}",
        message=_user_status_message(user.status),
        type="ACCOUNT",
    ))
    db.commit()
    db.refresh(user)
    return user


@router.get("/stocks", response_model=list[StockOut])
def admin_stocks(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    return db.query(Stock).order_by(Stock.company_name).all()


@router.post("/stocks", response_model=StockOut)
def create_stock(data: StockCreate, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    if db.query(Stock).filter(Stock.ticker == data.ticker.upper()).first():
        raise HTTPException(status_code=400, detail="Ticker already exists")
    stock = Stock(**data.model_dump())
    stock.ticker = stock.ticker.upper()
    db.add(stock)
    db.commit()
    db.refresh(stock)
    return stock


@router.patch("/stocks/{stock_id}", response_model=StockOut)
def edit_stock(stock_id: int, data: StockUpdate, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    stock = _stock_by_id(db, stock_id)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(stock, key, value.upper() if key == "ticker" and isinstance(value, str) else value)
    db.commit()
    db.refresh(stock)
    return stock


@router.delete("/stocks/{stock_id}", status_code=204)
def delete_stock(stock_id: int, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    stock = _stock_by_id(db, stock_id)
    db.delete(stock)
    db.commit()
    return None


@router.patch("/kyc/{kyc_id}", response_model=KycOut)
def review_kyc(kyc_id: int, data: KycReview, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    kyc = db.query(KycVerification).filter(KycVerification.id == kyc_id).first()
    if not kyc:
        raise HTTPException(status_code=404, detail="KYC not found")
    kyc.status = data.status
    kyc.rejection_reason = data.rejection_reason
    kyc.reviewed_at = datetime.utcnow()
    kyc.user.kyc_status = data.status
    db.add(Notification(
        user_id=kyc.user_id,
        title=f"KYC {data.status.lower()}",
        message="Your KYC has been verified." if data.status == "VERIFIED" else (data.rejection_reason or "Your KYC was rejected."),
        type="KYC",
    ))
    db.commit()
    db.refresh(kyc)
    return kyc


@router.get("/kyc", response_model=list[KycOut])
def list_kyc(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    return db.query(KycVerification).order_by(KycVerification.submitted_at.desc()).all()


def _stock_by_id(db: Session, stock_id: int) -> Stock:
    stock = db.query(Stock).filter(Stock.id == stock_id).first()
    if not stock:
        raise HTTPException(status_code=404, detail="Stock not found")
    return stock


def _top_symbol(db: Session, side: str) -> str | None:
    row = (
        db.query(Order.symbol, func.sum(Order.quantity).label("qty"))
        .filter(Order.side == side)
        .group_by(Order.symbol)
        .order_by(func.sum(Order.quantity).desc())
        .first()
    )
    return row.symbol if row else None


def _user_status_message(status: str) -> str:
    return {
        "APPROVED": "Your account has been approved. Complete KYC verification to trade.",
        "REJECTED": "Your account registration was rejected by admin.",
        "SUSPENDED": "Your account has been suspended. Trading is disabled.",
    }.get(status, "Your account status changed.")
