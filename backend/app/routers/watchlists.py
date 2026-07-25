from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps.auth import require_trading_user
from app.models import Stock, User, Watchlist, WatchlistItem
from app.schemas import WatchlistCreate, WatchlistOut, WatchlistRename, WatchlistStockCreate

router = APIRouter(prefix="/api/watchlists", tags=["watchlists"])


@router.get("", response_model=list[WatchlistOut])
def list_watchlists(user: User = Depends(require_trading_user)):
    return [_serialize_watchlist(watchlist) for watchlist in sorted(user.watchlists, key=lambda item: (not item.pinned, item.name))]


@router.post("", response_model=WatchlistOut)
def create_watchlist(data: WatchlistCreate, user: User = Depends(require_trading_user), db: Session = Depends(get_db)):
    watchlist = Watchlist(user_id=user.id, name=data.name)
    db.add(watchlist)
    db.commit()
    db.refresh(watchlist)
    return _serialize_watchlist(watchlist)


@router.patch("/{watchlist_id}", response_model=WatchlistOut)
def update_watchlist(
    watchlist_id: int,
    data: WatchlistRename,
    user: User = Depends(require_trading_user),
    db: Session = Depends(get_db),
):
    watchlist = _get_watchlist(db, user.id, watchlist_id)
    if data.name is not None:
        watchlist.name = data.name
    if data.pinned is not None:
        watchlist.pinned = data.pinned
    db.commit()
    db.refresh(watchlist)
    return _serialize_watchlist(watchlist)


@router.post("/{watchlist_id}/stocks", response_model=WatchlistOut)
def add_stock(
    watchlist_id: int,
    data: WatchlistStockCreate,
    user: User = Depends(require_trading_user),
    db: Session = Depends(get_db),
):
    watchlist = _get_watchlist(db, user.id, watchlist_id)
    stock = db.query(Stock).filter(Stock.id == data.stock_id).first()
    if not stock:
        raise HTTPException(status_code=404, detail="Stock not found")
    if not any(item.stock_id == stock.id for item in watchlist.items):
        db.add(WatchlistItem(watchlist_id=watchlist.id, stock_id=stock.id, sort_order=len(watchlist.items)))
        db.commit()
        db.refresh(watchlist)
    return _serialize_watchlist(watchlist)


@router.delete("/{watchlist_id}/stocks/{stock_id}", response_model=WatchlistOut)
def remove_stock(
    watchlist_id: int,
    stock_id: int,
    user: User = Depends(require_trading_user),
    db: Session = Depends(get_db),
):
    watchlist = _get_watchlist(db, user.id, watchlist_id)
    item = next((entry for entry in watchlist.items if entry.stock_id == stock_id), None)
    if item:
        db.delete(item)
        db.commit()
        db.refresh(watchlist)
    return _serialize_watchlist(watchlist)


def _get_watchlist(db: Session, user_id: int, watchlist_id: int) -> Watchlist:
    watchlist = db.query(Watchlist).filter(Watchlist.id == watchlist_id, Watchlist.user_id == user_id).first()
    if not watchlist:
        raise HTTPException(status_code=404, detail="Watchlist not found")
    return watchlist


def _serialize_watchlist(watchlist: Watchlist) -> dict:
    items = sorted(watchlist.items, key=lambda item: item.sort_order)
    return {
        "id": watchlist.id,
        "name": watchlist.name,
        "pinned": watchlist.pinned,
        "created_at": watchlist.created_at,
        "stocks": [item.stock for item in items],
    }
