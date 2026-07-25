from fastapi import APIRouter, Body, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.deps.auth import require_trading_user
from app.models import User
from app.schemas import PortfolioOut
from app.schemas.portfolio import PortfolioTopUp
from app.services.portfolio import get_portfolio

router = APIRouter(prefix="/api/portfolio", tags=["portfolio"])


@router.get("", response_model=PortfolioOut)
def portfolio(user: User = Depends(require_trading_user), db: Session = Depends(get_db)):
    return get_portfolio(db, user)


@router.post("/top-up", response_model=PortfolioOut)
def top_up_portfolio(
    data: PortfolioTopUp = Body(default_factory=dict),
    user: User = Depends(require_trading_user),
    db: Session = Depends(get_db),
):
    amount = data.amount if data.amount is not None else settings.starting_balance
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Top-up amount must be greater than zero.")
    user.balance += amount
    db.add(user)
    db.commit()
    db.refresh(user)
    return get_portfolio(db, user)
