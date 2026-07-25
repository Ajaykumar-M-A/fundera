from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps.auth import get_current_user, require_trading_user
from app.models import Position, User
from app.schemas import PositionOut, StopLossUpdate
from app.services.positions import enrich_positions, get_open_positions

router = APIRouter(prefix="/api/positions", tags=["positions"])


@router.get("", response_model=list[PositionOut])
def list_positions(user: User = Depends(require_trading_user), db: Session = Depends(get_db)):
    positions = get_open_positions(db, user.id)
    return enrich_positions(positions, db)


@router.patch("/{position_id}/stop-loss", response_model=PositionOut)
def set_stop_loss(
    position_id: int,
    data: StopLossUpdate,
    user: User = Depends(require_trading_user),
    db: Session = Depends(get_db),
):
    pos = db.query(Position).filter(Position.id == position_id, Position.user_id == user.id).first()
    if not pos or pos.status != "open":
        raise HTTPException(status_code=404, detail="Position not found")
    pos.stop_loss = data.stop_loss
    db.commit()
    db.refresh(pos)
    enriched = enrich_positions([pos], db)
    return enriched[0]
